const pool = require("../config/db");
const axios = require("axios");
const { hedisQueue, qaReviewQueue, timelineQueue } = require("../config/queue");

class HEDISService {
  /**
   * Orchestrate HEDIS evaluation by calling AI service and persisting results.
   */
  async evaluatePatientChart(patientId, file, tenantSubdomain, db) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const url = `${aiServiceUrl}/api/hedis/analyze`;

    console.log(
      `Forwarding chart for patient ${patientId} to AI Service: ${url}`
    );

    const FormData = require("form-data");
    const fs = require("fs");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("patient_id", patientId);
    formData.append("tenant_subdomain", tenantSubdomain);

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { evaluations } = response.data;
    const savedEvaluations = [];

    // Save each evaluation to the tenant-specific schema
    for (const evalResult of evaluations) {
      const saved = await this.saveEvaluation(db, patientId, evalResult);
      savedEvaluations.push(saved);
    }

    return savedEvaluations;
  }

  /**
   * Orchestrate HEDIS evaluation by calling AI service with a file path and persisting results.
   */
  async evaluatePatientChartByPath(patientId, pdfPath, tenantSubdomain, db) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const url = `${aiServiceUrl}/api/hedis/analyze`;

    console.log(
      `Triggering AI evaluation for patient ${patientId} with path ${pdfPath} to AI Service: ${url}`
    );

    const response = await axios.post(url, {
      patient_id: patientId,
      pdfPath: pdfPath,
      tenant_subdomain: tenantSubdomain,
    });

    const { evaluations } = response.data;
    const savedEvaluations = [];

    // Save each evaluation to the tenant-specific schema
    for (const evalResult of evaluations) {
      const saved = await this.saveEvaluation(db, patientId, evalResult);
      savedEvaluations.push(saved);

      // Automatically queue QA Review Analysis for the saved evaluation
      console.log(`[services/hedis.service] Auto-triggering QA Review Analysis queuing for Evaluation ID: ${saved.id}, Code: ${saved.measure_code}`);
      try {
        await this.queueQAReviewAnalysis(
          saved.id,
          patientId,
          saved.measure_code,
          pdfPath,
          tenantSubdomain
        );
      } catch (err) {
        console.error(`[services/hedis.service] Failed to auto-trigger QA Review queued job for Evaluation ID ${saved.id}:`, err.message);
      }
    }

    return savedEvaluations;
  }

  /**
   * Evaluate a single manually-selected measure for a patient chart.
   * Bypasses the full chart analysis + filtering pipeline used by evaluatePatientChartByPath.
   * Reuses saveEvaluation() and queueQAReviewAnalysis() for consistency.
   *
   * @param {string} patientId
   * @param {string} pdfPath - absolute path to the patient chart PDF
   * @param {object} measureData - full measure record from the measures table
   * @param {string} tenantSubdomain
   * @param {object} db - tenant-scoped DB client
   * @returns {object} the saved hedis_evaluations row
   */
  async evaluateSingleMeasure(patientId, pdfPath, measureData, tenantSubdomain, db) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const url = `${aiServiceUrl}/api/hedis/analyze-single`;

    console.log(
      `[hedis.service] Evaluating single measure ${measureData.measureCode} for patient ${patientId} via ${url}`
    );

    const response = await axios.post(url, {
      patient_id: patientId,
      pdfPath,
      measure: measureData,
    });

    const { evaluations } = response.data;

    if (!evaluations || evaluations.length === 0) {
      throw new Error(`AI service returned no evaluation for measure ${measureData.measureCode}`);
    }

    const evalResult = evaluations[0];
    const saved = await this.saveEvaluation(db, patientId, evalResult);

    // Auto-queue QA Review Analysis (same as evaluatePatientChartByPath)
    console.log(
      `[hedis.service] Auto-queuing QA Review for new single-measure evaluation ID: ${saved.id}`
    );
    try {
      await this.queueQAReviewAnalysis(
        saved.id,
        patientId,
        saved.measure_code,
        pdfPath,
        tenantSubdomain
      );
    } catch (err) {
      console.error(
        `[hedis.service] Failed to auto-queue QA Review for evaluation ${saved.id}:`,
        err.message
      );
    }

    return saved;
  }

  /**
   * Add a HEDIS analysis job to the background queue.
   */
  async queueHedisAnalysis(patientId, chartDocument, tenantSubdomain) {
    if (!patientId || !chartDocument || !tenantSubdomain) {
      console.error(`[services/hedis.service] queueHedisAnalysis missing required arguments: patientId=${patientId}, tenantSubdomain=${tenantSubdomain}`);
      throw new Error("Missing required arguments for queueHedisAnalysis");
    }

    const chartDoc = chartDocument || {};
    const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
    const pdfPath = `/app/uploads/${filePath}`;

    console.log(`[services/hedis.service] Queuing HEDIS analysis for Patient: ${patientId}, Subdomain: ${tenantSubdomain}, Path: ${pdfPath}`);

    const job = await hedisQueue.add("hedis-analysis-job", {
      patientId,
      pdfPath,
      tenantSubdomain,
    });

    console.log(`[services/hedis.service] HEDIS analysis job successfully queued with ID: ${job.id}`);
    return job;
  }

  /**
   * Add a HEDIS QA Review analysis job to the background queue.
   */
  async queueQAReviewAnalysis(evaluationId, patientId, measureCode, pdfPath, tenantSubdomain, recalculation = false, manualEvidence = null) {
    if (!evaluationId || !patientId || !measureCode || !pdfPath || !tenantSubdomain) {
      console.error(`[services/hedis.service] queueQAReviewAnalysis missing required arguments: evaluationId=${evaluationId}, patientId=${patientId}`);
      throw new Error("Missing required arguments for queueQAReviewAnalysis");
    }

    console.log(`[services/hedis.service] Queuing QA Review analysis for Evaluation: ${evaluationId}, Patient: ${patientId}, Measure: ${measureCode}, Recalculation: ${recalculation}`);

    const job = await qaReviewQueue.add("hedis-qa-review-job", {
      evaluationId,
      patientId,
      measureCode,
      pdfPath,
      tenantSubdomain,
      recalculation,
      manualEvidence,
    });

    console.log(`[services/hedis.service] QA Review analysis job successfully queued with ID: ${job.id}`);
    return job;
  }

  /**
   * Add a Clinical Timeline extraction job to the background queue.
   */
  async queueTimelineExtraction(patientId, chartDocument, tenantSubdomain) {
    if (!patientId || !chartDocument || !tenantSubdomain) {
      console.error(`[services/hedis.service] queueTimelineExtraction missing required arguments: patientId=${patientId}, tenantSubdomain=${tenantSubdomain}`);
      throw new Error("Missing required arguments for queueTimelineExtraction");
    }

    const chartDoc = chartDocument || {};
    const filePath = chartDoc.filePath || `charts/${chartDoc.fileName}`;
    const pdfPath = `/app/uploads/${filePath}`;

    console.log(`[services/hedis.service] Queuing Clinical Timeline extraction for Patient: ${patientId}, Subdomain: ${tenantSubdomain}, Path: ${pdfPath}`);

    const job = await timelineQueue.add("clinical-timeline-job", {
      patientId,
      pdfPath,
      tenantSubdomain,
    });

    console.log(`[services/hedis.service] Clinical Timeline job successfully queued with ID: ${job.id}`);
    return job;
  }

  /**
   * Orchestrate Clinical Timeline extraction.
   */
  async extractClinicalTimeline(patientId, pdfPath, tenantSubdomain, db) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const url = `${aiServiceUrl}/api/hedis/clinical-timeline/extract`;

    console.log(
      `Triggering Clinical Timeline extraction for patient ${patientId} with path ${pdfPath}`
    );

    const response = await axios.post(url, {
      patient_id: patientId,
      pdfPath: pdfPath,
      tenant_subdomain: tenantSubdomain, // ← Added for consistency
    });

    const { timeline } = response.data || { timeline: [] };

    if (!timeline || timeline.length === 0) {
      console.warn(
        `AI Service returned empty timeline for patient ${patientId}`
      );
      return [];
    }

    const savedEvents = [];

    for (const event of timeline) {
      const saved = await this.saveTimelineEvent(db, patientId, event);
      savedEvents.push(saved);
    }

    console.log(
      `Successfully saved ${savedEvents.length} timeline events for patient ${patientId}`
    );
    return savedEvents;
  }

  /**
   * Save clinical timeline event to DB.
   */
  async saveTimelineEvent(db, patientId, event) {
    const query = `
      INSERT INTO clinical_timeline_events (
        patient_id, event_title, event_date, year, month, 
        event_type, encounter_type, provider, document_type, 
        summary, extracted_structured_data, ai_confidence, source_text,measures,
        review_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15)
      RETURNING *
    `;

    const values = [
      patientId,
      event.event_title,
      event.event_date || null,
      event.year ||
      (event.event_date ? new Date(event.event_date).getFullYear() : null),
      event.month ||
      (event.event_date
        ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          new Date(event.event_date)
        )
        : null),
      event.event_type,
      event.encounter_type,
      event.provider,
      event.document_type,
      event.summary,
      JSON.stringify(event.extracted_fields || {}),
      event.confidence || 0,
      event.evidence,
      JSON.stringify(event.measures || []),
      "PENDING",
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Save evaluation record to DB.
   */
  async saveEvaluation(db, patientId, evalResult) {
    const query = `
      INSERT INTO hedis_evaluations (
        patient_id, measure_code, measure_name, eligible, 
        denominator, numerator, exclusion, status, 
        confidence, reasoning, evidence, detailed_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      patientId,
      evalResult.measureCode,
      evalResult.measureName,
      evalResult.eligible,
      evalResult.denominator,
      evalResult.numerator,
      evalResult.exclusion,
      evalResult.status,
      evalResult.confidence,
      evalResult.overallReason || evalResult.reason,
      JSON.stringify(evalResult.evidence_quotes || evalResult.evidence || []),
      JSON.stringify(evalResult.detailed_response || evalResult),
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all evaluations for a patient.
   */
  async getEvaluations(db, patientId) {
    const query = `
      SELECT * FROM hedis_evaluations 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [patientId]);
    return result.rows;
  }


  /**
   * Get clinical timeline for a patient with filters and grouping.
   */
  async getClinicalTimeline(db, patientId, filters = {}) {
    let query = `
      SELECT * FROM clinical_timeline_events 
      WHERE patient_id = $1
    `;
    const params = [patientId];
    let paramCount = 1;

    if (filters.search) {
      paramCount++;
      query += ` AND (event_title ILIKE $${paramCount} OR summary ILIKE $${paramCount} OR provider ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    if (filters.documentType) {
      paramCount++;
      query += ` AND document_type = $${paramCount}`;
      params.push(filters.documentType);
    }

    if (filters.encounterType) {
      paramCount++;
      query += ` AND encounter_type = $${paramCount}`;
      params.push(filters.encounterType);
    }

    if (filters.provider) {
      paramCount++;
      query += ` AND provider = $${paramCount}`;
      params.push(filters.provider);
    }

    if (filters.startDate && filters.endDate) {
      paramCount++;
      query += ` AND event_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.startDate, filters.endDate);
      paramCount++;
    }

    query += ` ORDER BY event_date DESC`;

    const result = await db.query(query, params);
    const events = result.rows;

    // Group by Year and Month
    const grouped = {};
    events.forEach((event) => {
      const year =
        event.year ||
        (event.event_date
          ? new Date(event.event_date).getFullYear()
          : "Unknown");
      const month =
        event.month ||
        (event.event_date
          ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(
            new Date(event.event_date)
          )
          : "Unknown");

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push({
        ...event,
        extracted_fields:
          typeof event.extracted_structured_data === "string"
            ? JSON.parse(event.extracted_structured_data)
            : event.extracted_structured_data,
      });
    });

    return grouped;
  }

  /**
   * Get full details for a specific timeline event.
   */
  async getTimelineEventDetails(db, eventId) {
    const query = `
      SELECT e.*, d.document_segment_text, d.preview_metadata, d.page_number
      FROM clinical_timeline_events e
      LEFT JOIN clinical_timeline_event_documents d ON e.id = d.event_id
      WHERE e.id = $1
    `;
    const result = await db.query(query, [eventId]);
    if (result.rows.length === 0) return null;

    const event = result.rows[0];
    return {
      ...event,
      extracted_fields:
        typeof event.extracted_structured_data === "string"
          ? JSON.parse(event.extracted_structured_data)
          : event.extracted_structured_data,
      documents: result.rows
        .map((row) => ({
          segment_text: row.document_segment_text,
          preview_metadata: row.preview_metadata,
          page_number: row.page_number,
        }))
        .filter((d) => d.segment_text || d.preview_metadata),
    };
  }

  /**
   * Review a timeline event (Accept/Reject).
   */
  async reviewTimelineEvent(db, eventId, status, remarks, reviewedBy) {
    // 1. Update event status
    const updateQuery = `
      UPDATE clinical_timeline_events
      SET review_status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [status, eventId]);
    const event = result.rows[0];

    if (!event) throw new Error("Event not found");

    // 2. Fetch patient's assigned abstractor
    const patientResult = await db.query(
      `SELECT abstractor_id FROM patients WHERE id = $1`,
      [event.patient_id]
    );
    const abstractorId = patientResult.rows[0]?.abstractor_id;

    // 3. Create review record
    const reviewQuery = `
      INSERT INTO clinical_timeline_reviews (
        event_id, status, remarks, reviewed_by, abstractor_id, assignment_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    await db.query(reviewQuery, [
      eventId,
      status,
      remarks || null,
      reviewedBy || null,
      status === "ACCEPTED" ? (abstractorId || null) : null,
      status === "ACCEPTED" ? "ASSIGNED" : "REJECTED",
    ]);

    // 4. Update assignment table if accepted
    if (status === "ACCEPTED" && abstractorId) {
      await db.query(
        `
        INSERT INTO clinical_timeline_assignments (event_id, abstractor_id, assigned_by)
        VALUES ($1, $2, $3)
        ON CONFLICT (event_id, abstractor_id) DO UPDATE SET status = 'Assigned', updated_at = NOW()
      `,
        [eventId, abstractorId, reviewedBy || null]
      );

      // Update event with abstractor
      await db.query(
        `UPDATE clinical_timeline_events SET assigned_abstractor_id = $1 WHERE id = $2`,
        [abstractorId, eventId]
      );
    }

    return event;
  }

  /**
   * Get reviewed & assigned evidence timeline events for abstractor.
   */
  async getEvidenceTimeline(db, patientId, filters = {}) {
    let query = `
      SELECT e.* 
      FROM clinical_timeline_events e
      INNER JOIN patients p ON e.patient_id = p.id
      WHERE e.patient_id = $1
        AND (
          (e.review_status = 'ACCEPTED' AND e.assigned_abstractor_id = p.abstractor_id)
          OR e.review_status IN ('PENDING', 'REJECTED')
        )
    `;
    const params = [patientId];
    let paramCount = 1;

    // Apply filters based on image pills
    if (filters.filter) {
      const f = filters.filter.toLowerCase();
      if (f === "hedis" || f === "hedis_only" || f === "hedisonly") {
        query += ` AND e.measures IS NOT NULL AND jsonb_array_length(e.measures) > 0`;
      } else if (f === "encounter" || f === "encounters") {
        query += ` AND e.event_type = 'Encounter'`;
      } else if (f === "lab" || f === "labs") {
        query += ` AND e.event_type = 'Lab Result'`;
      } else if (f === "med" || f === "meds" || f === "medication") {
        query += ` AND e.event_type = 'Medication'`;
      } else if (f === "doc" || f === "docs" || f === "document") {
        query += ` AND (e.event_type = 'Document' OR e.event_type NOT IN ('Encounter', 'Lab Result', 'Medication', 'Imaging', 'Procedure'))`;
      }
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (e.event_title ILIKE $${paramCount} OR e.summary ILIKE $${paramCount} OR e.provider ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    if (filters.provider && filters.provider !== "All Providers") {
      paramCount++;
      query += ` AND e.provider = $${paramCount}`;
      params.push(filters.provider);
    }

    if (filters.startDate && filters.endDate) {
      paramCount++;
      query += ` AND e.event_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(filters.startDate, filters.endDate);
      paramCount++;
    }

    query += ` ORDER BY e.event_date DESC`;

    const result = await db.query(query, params);
    const events = result.rows;

    // Group by Year and Month
    const grouped = {};
    events.forEach((event) => {
      const year =
        event.year ||
        (event.event_date
          ? new Date(event.event_date).getFullYear()
          : "Unknown");
      const month =
        event.month ||
        (event.event_date
          ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(
            new Date(event.event_date)
          )
          : "Unknown");

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push({
        ...event,
        extracted_fields:
          typeof event.extracted_structured_data === "string"
            ? JSON.parse(event.extracted_structured_data)
            : event.extracted_structured_data,
      });
    });

    return grouped;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ABSTRACTOR DRAFT & NOT-FOUND METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Save Draft — upsert partial measure fields into hedis_measure_evidence
   * with is_draft = TRUE. Will NOT overwrite a previously submitted
   * (is_draft = FALSE) record with a draft flag.
   *
   * @param {object} db - tenant DB client
   * @param {string} schema - tenant schema name
   * @param {object} params
   * @param {string} params.patientId
   * @param {string} params.chartId
   * @param {string} params.measureId  - UUID from hedis_evaluations.id
   * @param {object} params.draftData  - field values to persist
   * @param {string} params.userId     - req.user.id (created_by / updated_by)
   */
  async saveDraft(db, schema, { patientId, chartId, measureId, draftData, userId }) {
    // Guard: do not overwrite a fully-submitted record with a draft
    const existingCheck = await db.query(
      `SELECT id, is_draft FROM ${schema}.hedis_measure_evidence
       WHERE patient_id = $1 AND chart_id = $2 AND measure_id = $3`,
      [patientId, chartId, measureId]
    );

    if (existingCheck.rows.length > 0 && existingCheck.rows[0].is_draft === false) {
      const err = new Error(
        "This measure has already been submitted to QA and cannot be overwritten with a draft. Use submitAbstractorQA to update."
      );
      err.statusCode = 409;
      throw err;
    }

    const {
      serviceDate = null,
      screeningType = null,
      evidenceType = null,
      reading = null,
      cptCode = null,
      icd10Code = null,
      evidenceSource = null,
      notes = null,
      uploadedDocument = null,
    } = draftData || {};

    const upsertQuery = `
      INSERT INTO ${schema}.hedis_measure_evidence (
        patient_id, chart_id, measure_id,
        service_date, screening_type, evidence_type, reading,
        cpt_code, icd10_code, evidence_source, notes,
        uploaded_document, is_draft,
        created_by, updated_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, $13, $14, NOW(), NOW())
      ON CONFLICT (patient_id, chart_id, measure_id)
      DO UPDATE SET
        service_date      = EXCLUDED.service_date,
        screening_type    = EXCLUDED.screening_type,
        evidence_type     = EXCLUDED.evidence_type,
        reading           = EXCLUDED.reading,
        cpt_code          = EXCLUDED.cpt_code,
        icd10_code        = EXCLUDED.icd10_code,
        evidence_source   = EXCLUDED.evidence_source,
        notes             = EXCLUDED.notes,
        uploaded_document = EXCLUDED.uploaded_document,
        is_draft          = TRUE,
        updated_by        = EXCLUDED.updated_by,
        updated_at        = NOW()
      RETURNING *
    `;

    const values = [
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
      uploadedDocument ? JSON.stringify(uploadedDocument) : null,
      userId || null,
      userId || null,
    ];

    const result = await db.query(upsertQuery, values);
    return result.rows[0];
  }

  /**
   * Get Draft — fetch the saved draft for a specific measure.
   * Returns null if no draft exists (or the record was already submitted).
   *
   * @param {object} db
   * @param {string} schema
   * @param {object} params
   * @param {string} params.patientId
   * @param {string} params.chartId
   * @param {string} params.measureId
   */
  async getDraft(db, schema, { patientId, chartId, measureId }) {
    const result = await db.query(
      `SELECT * FROM ${schema}.hedis_measure_evidence
       WHERE patient_id = $1 AND chart_id = $2 AND measure_id = $3
         AND is_draft = TRUE`,
      [patientId, chartId, measureId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  /**
   * Mark Not Found — record that the abstractor could not locate evidence
   * for the selected measure. Sets not_found = TRUE and is_draft = FALSE
   * so the measure becomes visible to QA.
   *
   * Never deletes uploaded files, drafts, or previous evidence.
   *
   * @param {object} db
   * @param {string} schema
   * @param {object} params
   * @param {string} params.patientId
   * @param {string} params.chartId
   * @param {string} params.measureId
   * @param {string|null} params.comment
   * @param {string|null} params.userId
   */
  async markNotFound(db, schema, { patientId, chartId, measureId, comment, userId }) {
    const upsertQuery = `
      INSERT INTO ${schema}.hedis_measure_evidence (
        patient_id, chart_id, measure_id,
        not_found, not_found_comment, not_found_at, not_found_by,
        is_draft, created_by, updated_by, created_at, updated_at
      ) VALUES ($1, $2, $3, TRUE, $4, NOW(), $5, FALSE, $6, $7, NOW(), NOW())
      ON CONFLICT (patient_id, chart_id, measure_id)
      DO UPDATE SET
        not_found         = TRUE,
        not_found_comment = EXCLUDED.not_found_comment,
        not_found_at      = NOW(),
        not_found_by      = EXCLUDED.not_found_by,
        is_draft          = FALSE,
        updated_by        = EXCLUDED.updated_by,
        updated_at        = NOW()
      RETURNING *
    `;

    const values = [
      patientId,
      chartId,
      measureId,
      comment || null,
      userId || null,
      userId || null,
      userId || null,
    ];

    const result = await db.query(upsertQuery, values);
    return result.rows[0];
  }
}

module.exports = new HEDISService();
