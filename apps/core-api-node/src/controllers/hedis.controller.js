const hedisService = require("../services/hedis.service");
const { v4: uuidv4 } = require("uuid");



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

    // If no evaluations exist, try to trigger AI analysis from patient chart
    if (evaluations.length === 0) {
      console.log(`No evaluations found for patient ${patientId}. Checking for chart to trigger AI analysis...`);

      const chartResult = await req.db.query(
        `SELECT chart_document FROM ${schema}.patient_charts WHERE patient_id = $1 LIMIT 1`,
        [patientId]
      );

      if (chartResult.rows.length > 0) {
        const chartDoc = chartResult.rows[0].chart_document || {};
        const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
        const pdfPath = `/app/uploads/${filePath}`;

        console.log(`Triggering internal HEDIS analysis for Patient: ${patientId}, Path: ${pdfPath}`);

        evaluations = await hedisService.evaluatePatientChartByPath(
          patientId,
          pdfPath,
          subdomain,
          req.db
        );
      } else {
        console.log(`No chart found for patient ${patientId}. Cannot trigger AI analysis.`);
      }
    }

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
    const pdfPath = `/app/uploads/${filePath}`; // This is what AI service expects

    // 3. Check if analysis already exists in DB (cache)
    const cachedResult = await req.db.query(
      `SELECT * FROM ${schema}.hedis_qa_review_analyses WHERE evaluation_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [evaluationId]
    );

    if (cachedResult.rows.length > 0) {
      const cached = cachedResult.rows[0];
      console.log(`Returning cached QA analysis for evaluation: ${evaluationId}`);
      return res.json({
        pdfUrl: chartPdfUrl,
        measure: {
          id: evaluationId,
          measureCode: cached.measure_code,
          measureName: cached.measure_name,
        },
        abstractorEvidence: cached.abstractor_evidence,
        measureRules: cached.measure_rules,
        extractedEvidence: cached.extracted_evidence,
        validationChecklist: cached.validation_checklist,
        summary: cached.summary,
        all_evidences: cached.all_evidences || [],
      });
    }

    // 4. Fetch measure rules from Measure Library
    const measureResult = await req.db.query(
      `SELECT * FROM ${schema}.measures WHERE measure_code = $1`,
      [measure_code]
    );
    const measureRules = measureResult.rows[0] || {};

    // 5. Mock abstraction data
    const mockAbstractionData = {
      serviceDate: "2025-08-15",
      screeningType: "Bilateral Mammogram",
      cptCode: "77067",
      icd10: "Z12.31",
      provider: "Dr. Torres",
      facility: "Advanced Imaging Center",
      result: "BI-RADS 1 - Negative",
    };

    // 6. Call AI Service (ai-service-node)
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
    console.log(
      `Calling AI Service at ${aiServiceUrl}/api/hedis/qa-review-analysis`
    );
    const axios = require("axios");

    const aiResponse = await axios.post(
      `${aiServiceUrl}/api/hedis/qa-review-analysis`,
      {
        patientId: patient_id,
        measureCode: measure_code,
        pdfPath: pdfPath,
        measureRules: measureRules,
        abstractorEvidence: mockAbstractionData,
      },
      {
        timeout: 300000, // 5 minutes
      }
    );

    const analysisData = aiResponse.data;

    // 7. Persist result to DB
    await req.db.query(
      `INSERT INTO ${schema}.hedis_qa_review_analyses
        (evaluation_id, patient_id, measure_code, measure_name, pdf_path,
         extracted_evidence, validation_checklist, summary,
         abstractor_evidence, measure_rules, all_evidences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        evaluationId,
        patient_id,
        measure_code,
        measure_name,
        pdfPath,
        JSON.stringify(analysisData.extractedEvidence || []),
        JSON.stringify(analysisData.validationChecklist || {}),
        JSON.stringify(analysisData.summary || {}),
        JSON.stringify(mockAbstractionData),
        JSON.stringify(measureRules),
        JSON.stringify(analysisData.allEvidence || []),
      ]
    );

    // 8. Return normalized response
    res.json({
      pdfUrl: chartPdfUrl,
      measure: {
        id: evaluationId,
        measureCode: measure_code,
        measureName: measure_name,
      },
      abstractorEvidence: mockAbstractionData,
      measureRules: measureRules,
      ...analysisData,
      all_evidences: analysisData.allEvidence || [],
    });
  } catch (err) {
    console.error("Get QA Review Details Error:", err);
    res.status(500).json({ error: err.message });
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
      const {
        measureId,
        measureCode,
        measureName,
        qaStatus,
        reasons,
      } = decision;

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

      if (measureId) {
        await client.query(
          `UPDATE ${schema}.hedis_evaluations
           SET status = $1, stage = $2, reason = $3
           WHERE id = $4`,
          [qaStatus, "QA Review", (reasons || []).join(", "), measureId]
        );
      }

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