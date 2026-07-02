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
   * Update QA status (stage) for selected measures.
   */
  async updateQAStatus(db, qaQueueIds, action, reason, additionalNotes) {
    const actionToStage = {
      requestRevision: "QA Returned",
      qaFail: "Rework",
      qaPass: "Completed",
    };

    const stage = actionToStage[action];

    if (!stage) {
      throw new Error(`Invalid action: ${action}`);
    }

    // Get selected queue records
    const queueResult = await db.query(
      `
    SELECT patient_id, measure_code
    FROM hedis_qa_queue
    WHERE id = ANY($1)
    `,
      [qaQueueIds]
    );

    if (queueResult.rows.length === 0) {
      throw new Error("No matching QA queue records found.");
    }

    const patientId = queueResult.rows[0].patient_id;

    const measureCodes = queueResult.rows.map((row) => row.measure_code);

    // Update hedis_evaluations
    const result = await db.query(
      `
    UPDATE hedis_evaluations
    SET
      stage = $1,
      reason = $2,
      reasoning = COALESCE($3, reasoning)
    WHERE patient_id = $4
      AND measure_code = ANY($5)
    RETURNING *
    `,
      [stage, reason || null, additionalNotes || null, patientId, measureCodes]
    );

    // // Optional: update QA queue status
    // await db.query(
    //   `
    //   UPDATE hedis_qa_queue
    //   SET
    //     status = $1,
    //     reviewed_at = NOW(),
    //     notes = $2,
    //     updated_at = NOW()
    //   WHERE id = ANY($3)
    //   `,
    //   [
    //     stage,
    //     additionalNotes || null,
    //     qaQueueIds,
    //   ]
    // );

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
      remarks,
      reviewedBy,
      status === "ACCEPTED" ? abstractorId : null,
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
        [eventId, abstractorId, reviewedBy]
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
}

module.exports = new HEDISService();

