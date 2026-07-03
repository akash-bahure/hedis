const hedisService = require("../services/hedis.service");
const { v4: uuidv4 } = require("uuid");
const pdfMergeService = require("../services/pdfMerge.service");
const fs = require("fs").promises;
const path = require("path");

exports.getEvaluations = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const { subdomain, schema_name: schema } = req.tenant;

    // Verify patient exists before proceeding
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`,
      });
    }

    let evaluations = await hedisService.getEvaluations(req.db, patientId);

    res.json({
      patient_id: patientId,
      evaluations,
    });
  } catch (err) {
    console.error("Get HEDIS Evaluations Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.sendToQA = async (req, res) => {
  try {
    const { patientId, chartId, measureCode, measureName, notes } = req.body;

    // Fetch patient details and assigned QA
    const patientResult = await req.db.query(
      `SELECT id, first_name, last_name, qa_id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found.`,
      });
    }

    const patient = patientResult.rows[0];
    const patientName = `${patient.first_name} ${patient.last_name}`;
    const qa_assignee = patient.qa_id;

    if (!qa_assignee) {
      return res.status(400).json({
        error:
          "No Quality Analyst assigned to this patient. Please assign a QA before sending to QA queue.",
      });
    }

    const query = `
      INSERT INTO hedis_qa_queue (
        id, patient_id, patient_name, chart_id, 
        measure_code, measure_name, status, 
        qa_assignee, notes, sent_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Pending QA', $7, $8, $9)
      RETURNING *
    `;

    const values = [
      uuidv4(),
      patientId,
      patientName,
      chartId || null,
      measureCode,
      measureName,
      qa_assignee,
      notes || null,
      req.user?.id || null,
    ];

    const result = await req.db.query(query, values);

    res.status(201).json({
      message: "Measure successfully sent to QA",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Send to QA Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.markAsReviewed = async (req, res) => {
  try {
    const { patientId, measureCode, notes } = req.body;

    // Find the most recent record that is not already reviewed/in-review
    const findQuery = `
      SELECT id FROM hedis_qa_queue 
      WHERE patient_id = $1 AND measure_code = $2 
      AND status = 'Pending QA'
      ORDER BY sent_at DESC LIMIT 1
    `;
    const findResult = await req.db.query(findQuery, [patientId, measureCode]);

    if (findResult.rows.length === 0) {
      // If no pending record, create a new one as In Review
      const insertQuery = `
        INSERT INTO hedis_qa_queue (
          id, patient_id, measure_code, status, notes, reviewed_by, reviewed_at
        ) VALUES ($1, $2, $3, 'In Review', $4, $5, NOW())
        RETURNING *
      `;
      const insertResult = await req.db.query(insertQuery, [
        uuidv4(),
        patientId,
        measureCode,
        notes || null,
        req.user?.id || null,
      ]);
      return res.json({
        message: "Measure marked as in review",
        data: insertResult.rows[0],
      });
    }

    const updateQuery = `
      UPDATE hedis_qa_queue 
      SET status = 'In Review', 
          reviewed_at = NOW(), 
          reviewed_by = $1,
          notes = COALESCE($2, notes),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await req.db.query(updateQuery, [
      req.user?.id || null,
      notes || null,
      findResult.rows[0].id,
    ]);

    res.json({
      message: "Measure marked as in review",
      data: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Mark as Reviewed Error (Setting to In Review):", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getQAQueue = async (req, res) => {
  try {
    const { id: patientId } = req.params; // Now required as path
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    // Verify patient exists
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`,
      });
    }

    let query = `
      SELECT *, COUNT(*) OVER() as total_count
      FROM hedis_qa_queue
      WHERE patient_id = $1
    `;
    const values = [patientId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (patient_name ILIKE $${paramIndex} OR measure_code ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status !== "All") {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` ORDER BY sent_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await req.db.query(query, values);

    const data = result.rows;
    const total = data.length > 0 ? parseInt(data[0].total_count) : 0;
    const pages = Math.ceil(total / limit);

    res.json({
      patient_id: patientId,
      data,
      metadata: {
        total,
        pages,
        current_page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get QA Queue Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getQAReviewDetails = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const schema = req.tenant.schema_name;

    // 1. Get Evaluation record
    const evalResult = await req.db.query(
      `SELECT * FROM ${schema}.hedis_evaluations WHERE id = $1`,
      [evaluationId]
    );

    if (evalResult.rows.length === 0) {
      return res.status(404).json({ error: "Evaluation record not found" });
    }

    const evaluation = evalResult.rows[0];
    const { patient_id, measure_code, measure_name } = evaluation;

    // 2. Get patient chart path
    const chartResult = await req.db.query(
      `
      SELECT chart_document
      FROM ${schema}.patient_charts
      WHERE patient_id = $1
      LIMIT 1
    `,
      [patient_id]
    );

    const chartDoc = chartResult.rows[0]?.chart_document || {};
    const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;

    const chartPdfUrl = `${req.protocol}://${req.get("host")}/uploads/${filePath}`;
    const pdfPath = `/app/uploads/${filePath}`;

    // 3. Check if analysis already exists in DB (cache)
    const cachedResult = await req.db.query(
      `SELECT *
       FROM ${schema}.hedis_qa_review_analyses
       WHERE evaluation_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [evaluationId]
    );

    // 4. Check if the measure was marked "Evidence Not Found" by the abstractor
    const evidenceResult = await req.db.query(
      `SELECT not_found, not_found_comment 
       FROM ${schema}.hedis_measure_evidence
       WHERE measure_id = $1`,
      [evaluationId]
    );

    const isNotFound = evidenceResult.rows.length > 0 && evidenceResult.rows[0].not_found === true;
    const notFoundComment = isNotFound ? evidenceResult.rows[0].not_found_comment : null;
    const notFoundMessage = isNotFound 
      ? "Measure marked as 'Evidence Not Found'. A QA reviewer will be notified to manually verify." 
      : null;

    if (cachedResult.rows.length > 0) {
      const cached = cachedResult.rows[0];

      console.log(
        `Returning cached QA analysis for evaluation: ${evaluationId}`
      );

      return res.json({
        pdfUrl: chartPdfUrl,
        measure: {
          id: evaluationId,
          measureCode: cached.measure_code,
          measureName: cached.measure_name,
        },
        measureRules: cached.measure_rules,
        extractedEvidence: cached.extracted_evidence,
        validationChecklist: cached.validation_checklist,
        summary: cached.summary,
        all_evidences: cached.all_evidences || [],
        notFound: isNotFound,
        notFoundComment,
        notFoundMessage,
      });
    }

    // Fallback: If marked "Not Found" but no AI review exists yet, return 200 OK with empty fields
    if (isNotFound) {
      console.log(
        `No cached analysis found for evaluation ${evaluationId}, but marked as Evidence Not Found. Returning fallback JSON.`
      );
      return res.json({
        pdfUrl: chartPdfUrl,
        measure: {
          id: evaluationId,
          measureCode: measure_code,
          measureName: measure_name,
        },
        measureRules: null,
        extractedEvidence: null,
        validationChecklist: null,
        summary: null,
        all_evidences: [],
        notFound: true,
        notFoundComment,
        notFoundMessage,
      });
    }

    console.log(
      `No cached analysis found for evaluation ${evaluationId}. Background queuing handles reviews.`
    );

    return res.status(404).json({
      error: `HEDIS QA Review Analysis for evaluation ID ${evaluationId} has not yet been processed or was not found.`,
    });
  } catch (err) {
    console.error("Get QA Review Details Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.updateQAStatus = async (req, res) => {
  try {
    const { qaQueueIds, action, reason, additionalNotes } = req.body;

    if (!qaQueueIds || !Array.isArray(qaQueueIds) || qaQueueIds.length === 0) {
      return res.status(400).json({
        error: "qaQueueIds is required and must be a non-empty array.",
      });
    }

    if (!action) {
      return res.status(400).json({
        error: "action is required.",
      });
    }

    const updatedEvaluations = await hedisService.updateQAStatus(
      req.db,
      qaQueueIds,
      action,
      reason,
      additionalNotes
    );

    res.json({
      message: "QA status updated successfully",
      updated_count: updatedEvaluations.length,
      data: updatedEvaluations,
    });
  } catch (err) {
    console.error("Update QA Status Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.assignAbstractor = async (req, res) => {
  const client = req.db;
  try {
    const { patientId, chartId, decisions } = req.body;
    const schema = req.tenant.schema_name;

    if (!patientId || !decisions || !Array.isArray(decisions)) {
      return res.status(400).json({
        error: "Missing required fields: patientId, decisions",
      });
    }

    // Fetch abstractor
    const patientResult = await client.query(
      `SELECT abstractor_id FROM ${schema}.patients WHERE id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const assignedAbstractorId = patientResult.rows[0].abstractor_id;

    if (!assignedAbstractorId) {
      return res.status(400).json({
        error: "No abstractor assigned to this patient in the system.",
      });
    }

    await client.query("BEGIN");

    let finalStage = "QA Passed";
    let hasRevision = false;
    let hasFail = false;

    const processedMeasures = [];

    for (const decision of decisions) {
      const { measureId, measureCode, measureName, qaStatus, reasons } =
        decision;

      await client.query(
        `INSERT INTO ${schema}.hedis_qa_measure_decisions
         (patient_id, chart_id, measure_id, measure_code, measure_name, qa_status, reasons, assigned_abstractor_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          patientId,
          chartId || null,
          measureId || null,
          measureCode,
          measureName,
          qaStatus,
          JSON.stringify(reasons || []),
          assignedAbstractorId,
        ]
      );

      if (qaStatus === "REQUEST_REVISION") hasRevision = true;
      if (qaStatus === "QA_FAIL") hasFail = true;

      processedMeasures.push({
        measureId,
        measureCode,
        measureName,
        qaStatus,
        reasons: reasons || [],
      });
    }

    if (hasFail) finalStage = "QA Failed";
    else if (hasRevision) finalStage = "Revision Required";

    await client.query(
      `UPDATE ${schema}.patients
       SET assigned_to = $1, stage = $2, updated_at = NOW()
       WHERE id = $3`,
      [assignedAbstractorId, finalStage, patientId]
    );

    if (chartId) {
      await client.query(
        `INSERT INTO ${schema}.chart_assignments
         (patient_chart_id, assigned_to, assigned_role, assignment_status, assigned_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          chartId,
          assignedAbstractorId,
          "Chart Abstractor",
          "Assigned",
          req.user?.id || null,
        ]
      );
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Patient assigned back to abstractor and decisions persisted",
      patientId,
      chartId,
      abstractorId: assignedAbstractorId,
      finalStage,
      totalMeasures: processedMeasures.length,
      measures: processedMeasures,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Assign Abstractor Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getClinicalTimeline = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const filters = req.query;

    // Fetch timeline from DB with filters (extraction is done in background via BullMQ)
    const timeline = await hedisService.getClinicalTimeline(
      req.db,
      patientId,
      filters
    );

    res.json({
      patient_id: patientId,
      timeline,
    });
  } catch (err) {
    console.error("Get Clinical Timeline Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getTimelineEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await hedisService.getTimelineEventDetails(req.db, eventId);

    if (!event) {
      return res.status(404).json({ error: "Timeline event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error("Get Timeline Event Details Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.reviewTimelineEvent = async (req, res) => {
  try {
    const { eventId, status, remarks, reviewedBy } = req.body;

    if (!eventId || !status) {
      return res
        .status(400)
        .json({ error: "Missing required fields: eventId, status" });
    }

    const event = await hedisService.reviewTimelineEvent(
      req.db,
      eventId,
      status,
      remarks,
      reviewedBy || req.user?.id
    );

    res.json({
      message: `Event ${status.toLowerCase()} successfully`,
      event,
    });
  } catch (err) {
    console.error("Review Timeline Event Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getEvidenceTimeline = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const filters = req.query;
    const { subdomain, schema_name: schema } = req.tenant;

    // 1. Get patient chart path and construct PDF URL for frontend rendering
    const chartResult = await req.db.query(
      `
      SELECT chart_document
      FROM ${schema}.patient_charts
      WHERE patient_id = $1
      LIMIT 1
    `,
      [patientId]
    );

    let pdfUrl = null;
    if (chartResult.rows.length > 0) {
      const chartDoc = chartResult.rows[0].chart_document || {};
      const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
      pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${filePath}`;
    }

    // 2. Retrieve the reviewed evidence timeline events
    const timeline = await hedisService.getEvidenceTimeline(
      req.db,
      patientId,
      filters
    );

    res.json({
      patient_id: patientId,
      pdfUrl,
      timeline,
    });
  } catch (err) {
    console.error("Get Evidence Timeline Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * GET /api/hedis/abstractor-measures/:patientId
 * Returns all QA measure decisions assigned to the abstractor for a patient.
 */
exports.getAbstractorMeasures = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    // 1. Get the patient's assigned abstractor
    const patientResult = await req.db.query(
      `SELECT abstractor_id FROM ${schema}.patients WHERE id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const abstractorId = patientResult.rows[0].abstractor_id;

    // 2. Fetch all QA measure decisions for this patient assigned to the abstractor
    const measuresResult = await req.db.query(
      `SELECT
         d.id,
         d.patient_id,
         d.chart_id,
         d.measure_id,
         d.measure_code,
         d.measure_name,
         d.qa_status,
         d.reasons,
         d.assigned_abstractor_id,
         d.created_at,
         d.updated_at
       FROM ${schema}.hedis_qa_measure_decisions d
       WHERE d.patient_id = $1
         AND d.assigned_abstractor_id = $2
       ORDER BY d.created_at DESC`,
      [patientId, abstractorId]
    );

    // 3. Get chart PDF URL
    const chartResult = await req.db.query(
      `SELECT chart_document
       FROM ${schema}.patient_charts
       WHERE patient_id = $1
       LIMIT 1`,
      [patientId]
    );

    let pdfUrl = null;
    if (chartResult.rows.length > 0) {
      const chartDoc = chartResult.rows[0].chart_document || {};
      const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
      pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${filePath}`;
    }

    res.json({
      patient_id: patientId,
      abstractor_id: abstractorId,
      pdfUrl,
      total: measuresResult.rows.length,
      measures: measuresResult.rows.map((m) => ({
        id: m.id,
        measure_id: m.measure_id,
        measure_code: m.measure_code,
        measure_name: m.measure_name,
        qa_status: m.qa_status,
        reasons: m.reasons,
        chart_id: m.chart_id,
        assigned_abstractor_id: m.assigned_abstractor_id,
        created_at: m.created_at,
        updated_at: m.updated_at,
      })),
    });
  } catch (err) {
    console.error("Get Abstractor Measures Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.submitAbstractorQA = async (req, res) => {
  const client = req.db;
  const schema = req.tenant.schema_name;

  try {
    const {
      patientId,
      chartId,
      measureId,
      serviceDate,
      screeningType,
      evidenceType,
      reading,
      cptCode,
      icd10Code,
      evidenceSource,
      notes,
    } = req.body;

    if (!patientId || !chartId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: patientId, chartId" });
    }

    // Start a transaction
    await client.query("BEGIN");

    // 1. Fetch patient's chart
    const chartResult = await client.query(
      `SELECT chart_document FROM ${schema}.patient_charts WHERE id = $1 AND patient_id = $2`,
      [chartId, patientId]
    );

    if (chartResult.rows.length === 0) {
      throw new Error(
        `Chart with ID ${chartId} not found for patient ${patientId}`
      );
    }

    const chartDoc = chartResult.rows[0].chart_document || {};
    const relativeOriginalPath =
      chartDoc.filePath || `charts/${chartDoc.fileName}`;

    // Resolve original path robustly
    let absoluteOriginalPath = path.resolve(
      process.cwd(),
      "src",
      "uploads",
      relativeOriginalPath
    );
    if (!require("fs").existsSync(absoluteOriginalPath)) {
      absoluteOriginalPath = path.resolve(
        process.cwd(),
        "uploads",
        relativeOriginalPath
      );
    }

    // If it still doesn't exist, check direct relative or absolute path
    if (!require("fs").existsSync(absoluteOriginalPath)) {
      if (require("fs").existsSync(relativeOriginalPath)) {
        absoluteOriginalPath = relativeOriginalPath;
      } else {
        throw new Error(
          `Original chart file not found on disk: ${relativeOriginalPath}`
        );
      }
    }

    // 2. Prepare merged file path
    const mergedFileName = `merged_${chartId}.pdf`;
    const relativeMergedPath = `charts/${mergedFileName}`;
    const absoluteOutputPath = path.resolve(
      process.cwd(),
      "src",
      "uploads",
      relativeMergedPath
    );

    // 3. Merge pages using Helper
    const absoluteEvidencePath = path.resolve(req.file.path);
    const mergeResult = await pdfMergeService.mergePDFs(
      absoluteOriginalPath,
      absoluteEvidencePath,
      absoluteOutputPath
    );

    // 4. Update patient_charts.chart_document
    const updatedChartDoc = {
      fileName: mergedFileName,
      filePath: relativeMergedPath,
      pages: mergeResult.pagesCount,
      mimeType: "application/pdf",
      uploadedAt: new Date().toISOString(),
      size: mergeResult.size,
    };

    await client.query(
      `UPDATE ${schema}.patient_charts
       SET chart_document = $1, updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(updatedChartDoc), chartId]
    );

    // 5. Upsert hedis_measure_evidence
    const evidenceMetadata = {
      filename: req.file.filename,
      filepath: `evidence/${req.file.filename}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };

    const upsertQuery = `
      INSERT INTO ${schema}.hedis_measure_evidence (
        patient_id, chart_id, measure_id,
        service_date, screening_type, evidence_type, reading,
        cpt_code, icd10_code, evidence_source, notes,
        uploaded_document, is_draft, not_found, not_found_comment, not_found_at, not_found_by,
        created_by, updated_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE, FALSE, NULL, NULL, NULL, $13, $14, NOW(), NOW())
      ON CONFLICT (patient_id, chart_id, measure_id)
      DO UPDATE SET
        service_date = EXCLUDED.service_date,
        screening_type = EXCLUDED.screening_type,
        evidence_type = EXCLUDED.evidence_type,
        reading = EXCLUDED.reading,
        cpt_code = EXCLUDED.cpt_code,
        icd10_code = EXCLUDED.icd10_code,
        evidence_source = EXCLUDED.evidence_source,
        notes = EXCLUDED.notes,
        uploaded_document = EXCLUDED.uploaded_document,
        is_draft = FALSE,
        not_found = FALSE,
        not_found_comment = NULL,
        not_found_at = NULL,
        not_found_by = NULL,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *
    `;

    const upsertValues = [
      patientId,
      chartId,
      measureId || null,
      serviceDate || null,
      screeningType || null,
      evidenceType || null,
      reading || null,
      cptCode || null,
      icd10Code || null,
      evidenceSource || null,
      notes || null,
      JSON.stringify(evidenceMetadata),
      req.user?.id || null,
      req.user?.id || null,
    ];

    const evidenceResult = await client.query(upsertQuery, upsertValues);

    // 6. Add Manual Evidence entry into Clinical Timeline
    await client.query(
      `
  INSERT INTO ${schema}.clinical_timeline_events (
      patient_id,
      chart_id,
      event_date,
      event_type,
      event_title,
      provider,
      evidence,
      source_type,
      review_status,
      source_text,
      source_excerpt,
      year,
      month,
      summary,
      assigned_abstractor_id,
      created_at,
      updated_at
  )
  VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      'MANUAL',
      'PENDING',
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      NOW(),
      NOW()
  )
  `,
      [
        patientId,
        chartId,

        // Use serviceDate if provided, otherwise current date
        new Date(),

        // event_type
        "Evidence",

        // event_title
        screeningType || "Manual Evidence",

        // provider
        req.user?.full_name || req.user?.name || "Abstractor",

        // evidence
        evidenceType || null,

        // source_text
        `CPT: ${cptCode || "-"} | ICD-10: ${icd10Code || "-"}`,

        // source_excerpt
        notes || null,

        // year
        new Date(serviceDate || new Date()).getFullYear(),

        // month
        new Intl.DateTimeFormat("en-US", {
          month: "long",
        }).format(new Date(serviceDate || new Date())),

        // summary
        `Manual evidence submitted (${screeningType || "Evidence"})`,

        // assigned_abstractor_id
        req.user?.id || null,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Evidence successfully submitted.",
      data: evidenceResult.rows[0],
      chart: updatedChartDoc,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Submit Abstractor QA Error:", err);

    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file:", unlinkErr);
      }
    }

    return res.status(500).json({
      error: err.message || "An unexpected error occurred during Submit to QA",
    });
  }
};

exports.triggerRecalculation = async (req, res) => {
  const { patientId, evaluationId } = req.body;
  const { subdomain, schema_name: schema } = req.tenant;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }

  try {
    // 1. Fetch only evaluations that have matching hedis_measure_evidence (i.e. submitted by Abstractor)
    // Note: We skip measures that are saved as drafts (is_draft = true) or marked as Evidence Not Found (not_found = true).
    let query = `
      SELECT ev.id as evaluation_id, ev.measure_code, ev.measure_name, ev.patient_id,
             e.id as evidence_id, e.service_date, e.screening_type, e.evidence_type,
             e.reading, e.cpt_code, e.icd10_code, e.evidence_source, e.notes,
             e.uploaded_document, e.chart_id
      FROM ${schema}.hedis_measure_evidence e
      INNER JOIN ${schema}.hedis_evaluations ev ON e.measure_id = ev.id
      WHERE e.patient_id = $1
        AND e.is_draft = FALSE
        AND e.not_found = FALSE
    `;
    const params = [patientId];

    if (evaluationId) {
      query += ` AND ev.id = $2`;
      params.push(evaluationId);
    }

    const { rows } = await req.db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          "No measures found with submitted manual evidence for recalculation.",
      });
    }

    // 2. Fetch the patient chart document to get the merged PDF path
    const chartQuery = `
      SELECT chart_document
      FROM ${schema}.patient_charts
      WHERE patient_id = $1
      LIMIT 1
    `;
    const chartResult = await req.db.query(chartQuery, [patientId]);
    if (chartResult.rows.length === 0) {
      return res.status(404).json({
        error: `Patient chart not found for patient ${patientId}`,
      });
    }

    const chartDoc = chartResult.rows[0].chart_document || {};
    const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
    const pdfPath = `/app/uploads/${filePath}`;

    // 3. Queue recalculation job for each matching measure
    const queuedMeasures = [];
    for (const row of rows) {
      const manualEvidence = {
        service_date: row.service_date,
        screening_type: row.screening_type,
        evidence_type: row.evidence_type,
        reading: row.reading,
        cpt_code: row.cpt_code,
        icd10_code: row.icd10_code,
        evidence_source: row.evidence_source,
        notes: row.notes,
        uploaded_document: row.uploaded_document,
      };

      await hedisService.queueQAReviewAnalysis(
        row.evaluation_id,
        patientId,
        row.measure_code,
        pdfPath,
        subdomain,
        true, // recalculation flag
        manualEvidence
      );

      queuedMeasures.push({
        evaluationId: row.evaluation_id,
        measureCode: row.measure_code,
        measureName: row.measure_name,
      });
    }

    return res.json({
      message: "Recalculation successfully triggered for submitted measures.",
      queuedMeasures,
    });
  } catch (err) {
    console.error("Recalculation API Error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred during recalculation",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ABSTRACTOR DRAFT APIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/hedis/abstractor/save-draft
 * Save incomplete abstractor work for a single measure without submitting to QA.
 */
exports.saveDraft = async (req, res) => {
  const client = req.db;
  const schema = req.tenant.schema_name;

  try {
    const {
      patientId,
      chartId,
      measureId,
      serviceDate,
      screeningType,
      evidenceType,
      reading,
      cptCode,
      icd10Code,
      evidenceSource,
      notes,
      uploadedDocument,
    } = req.body;

    if (!patientId || !chartId || !measureId) {
      return res.status(400).json({
        error: "Missing required fields: patientId, chartId, measureId",
      });
    }

    const draftData = {
      serviceDate,
      screeningType,
      evidenceType,
      reading,
      cptCode,
      icd10Code,
      evidenceSource,
      notes,
      uploadedDocument,
    };

    const saved = await hedisService.saveDraft(client, schema, {
      patientId,
      chartId,
      measureId,
      draftData,
      userId: req.user?.id || null,
    });

    return res.status(200).json({
      message: "Draft saved successfully.",
      data: saved,
    });
  } catch (err) {
    console.error("Save Draft Error:", err);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      error: err.message || "An unexpected error occurred while saving draft",
    });
  }
};

/**
 * GET /api/hedis/abstractor/draft/:patientId
 * Retrieve a previously saved draft for a measure.
 * Query params: chartId, measureId
 */
exports.getDraft = async (req, res) => {
  const schema = req.tenant.schema_name;

  try {
    const { patientId } = req.params;
    const { chartId, measureId } = req.query;

    if (!patientId || !chartId || !measureId) {
      return res.status(400).json({
        error:
          "Missing required fields: patientId (path), chartId, measureId (query params)",
      });
    }

    const draft = await hedisService.getDraft(req.db, schema, {
      patientId,
      chartId,
      measureId,
    });

    return res.status(200).json({
      draft: draft || null,
    });
  } catch (err) {
    console.error("Get Draft Error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while fetching draft",
    });
  }
};

/**
 * POST /api/hedis/abstractor/mark-not-found
 * Flag a specific measure as "Evidence Not Found" so QA is notified.
 */
exports.markNotFound = async (req, res) => {
  const client = req.db;
  const schema = req.tenant.schema_name;

  try {
    const { patientId, chartId, measureId, comment } = req.body;

    if (!patientId || !chartId || !measureId) {
      return res.status(400).json({
        error: "Missing required fields: patientId, chartId, measureId",
      });
    }

    const record = await hedisService.markNotFound(client, schema, {
      patientId,
      chartId,
      measureId,
      comment: comment || null,
      userId: req.user?.id || null,
    });

    return res.status(200).json({
      message:
        "Measure marked as 'Evidence Not Found'. A QA reviewer will be notified to manually verify.",
      data: record,
    });
  } catch (err) {
    console.error("Mark Not Found Error:", err);
    return res.status(500).json({
      error:
        err.message || "An unexpected error occurred while marking not found",
    });
  }
};

