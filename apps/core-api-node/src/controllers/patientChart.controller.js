const { forwardChartToAiService } = require("../services/aiIntegration.service");
const chartQueue = require("../queue/chart.queue");

/**
 * Upload chart and push to queue
 */
exports.uploadChart = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`[UPLOAD] Request Received`);
    console.log(`[UPLOAD] Patient ID: ${patientId}`);
    console.log(`[UPLOAD] File Name: ${req.file.originalname}`);

    // Save Chart Record
    const result = await req.db.query(
      `
      INSERT INTO ${schema}.patient_charts (
        patient_id, status, chart_document
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [patientId, 'QUEUED', JSON.stringify({ filename: req.file.originalname, path: req.file.path })]
    );

    const chartId = result.rows[0].id;
    console.log(`[UPLOAD] Chart ID: ${chartId}`);
    console.log(`[UPLOAD] File Saved: ${req.file.path}`);

    // Add job to Queue
    const job = await chartQueue.add('process-chart', {
      patientId,
      chartId,
      filePath: req.file.path,
      originalname: req.file.originalname,
      schema,
      uploadedBy: req.user ? req.user.id : null,
      uploadedAt: new Date().toISOString()
    });

    console.log(`[UPLOAD] Queue Job Created`);
    console.log(`[UPLOAD] Job ID: ${job.id}`);

    return res.json({
      status: "QUEUED",
      chartId: chartId,
      jobId: job.id
    });
  } catch (err) {
    console.error("[Upload API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process chart upload",
    });
  }
};

/**
 * Get clinical timeline
 */
exports.getClinicalTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      search,
      sourceType, 
      encounterType, 
      provider, 
      hedisRelevantOnly, 
      structuredDataOnly, 
      startDate, 
      endDate 
    } = req.query;
    const schema = req.tenant.schema_name;

    console.log(`[CLINICAL-TIMELINE] Fetch Started`);
    console.log(`[CLINICAL-TIMELINE] Patient ID: ${patientId}`);
    console.log(`[CLINICAL-TIMELINE] Filters:`, req.query);

    let queryStr = `
      SELECT id, event_date, event_type, measure, provider, evidence, source_type, review_status
      FROM ${schema}.clinical_timeline_events
      WHERE patient_id = $1
    `;
    const params = [patientId];
    let paramIndex = 2;

    // Search by text
    if (search) {
      queryStr += ` AND (evidence ILIKE $${paramIndex} OR measure ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by Source Type (e.g. encounter, lab_result, vitals) maps to event_type
    if (sourceType) {
      const typesArray = sourceType.split(',').map(t => t.trim());
      queryStr += ` AND event_type = ANY($${paramIndex})`;
      params.push(typesArray);
      paramIndex++;
    }

    // Filter by Specific Encounter Type
    if (encounterType && encounterType !== 'All Encounters') {
      // Map exact enums or ILIKE depending on how it's stored. The UI passes snake_case or exact text.
      // E.g. office_visit -> Office Visit. Let's replace _ with space for simple matching.
      const formattedEncounter = encounterType.replace('_', ' ');
      queryStr += ` AND evidence ILIKE $${paramIndex}`;
      params.push(`%${formattedEncounter}%`);
      paramIndex++;
    }

    // Filter by Provider
    if (provider && provider !== 'All Providers') {
      queryStr += ` AND provider ILIKE $${paramIndex}`;
      params.push(`%${provider}%`);
      paramIndex++;
    }

    // HEDIS Relevant Only (Measure must be present)
    if (hedisRelevantOnly === 'true') {
      queryStr += ` AND measure IS NOT NULL AND measure != ''`;
    }

    // Structured Data Only (Source Type is EMR/EHR, not AI)
    if (structuredDataOnly === 'true') {
      queryStr += ` AND source_type IN ('EMR', 'EHR', 'MANUAL')`;
    }

    // Date Range Filters
    if (startDate) {
      queryStr += ` AND event_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      queryStr += ` AND event_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryStr += ` ORDER BY event_date DESC`;

    const result = await req.db.query(queryStr, params);

    console.log(`[CLINICAL-TIMELINE] Events Found: ${result.rows.length}`);
    console.log(`[CLINICAL-TIMELINE] Response Sent`);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No clinical timeline events found for this patient matching the filters.",
        events: []
      });
    }

    return res.json({
      message: "Clinical timeline events successfully retrieved.",
      events: result.rows
    });
  } catch (err) {
    console.error("[Clinical Timeline API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch clinical timeline evidence",
    });
  }
};

/**
 * Get detailed review evidence for an event
 */
exports.getReviewEvidence = async (req, res) => {
  try {
    const { eventId } = req.params;
    const schema = req.tenant.schema_name;

    console.log(`[CLINICAL-TIMELINE] Fetching Review Evidence for Event: ${eventId}`);

    const result = await req.db.query(
      `
      SELECT 
        e.event_date as "Event Date", 
        e.event_type as "Event Type", 
        e.measure as "Measure Name", 
        e.evidence as "Evidence Text", 
        c.chart_document as "Source Document", 
        e.provider as "Provider Information", 
        e.evidence as "Supporting Clinical Data",
        e.review_status,
        e.id
      FROM ${schema}.clinical_timeline_events e
      LEFT JOIN ${schema}.patient_charts c ON e.chart_id = c.id
      WHERE e.id = $1
      `,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Evidence event not found" });
    }

    console.log(`[CLINICAL-TIMELINE] Review Evidence Retrieved successfully`);
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("[Review Evidence API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch review evidence",
    });
  }
};

exports.acceptEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events SET review_status = 'ACCEPTED', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
      [userId, eventId]
    );

    return res.json({ success: true, message: 'Event accepted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events SET review_status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
      [userId, eventId]
    );

    return res.json({ success: true, message: 'Event rejected' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { event_date, provider, measure, evidence, event_type, status } = req.body;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    console.log(`[CLINICAL-TIMELINE] Editing Event: ${eventId}`);
    console.log(`[CLINICAL-TIMELINE] Edit Payload:`, req.body);

    const result = await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events 
       SET 
         event_date = COALESCE($1, event_date), 
         provider = COALESCE($2, provider), 
         measure = COALESCE($3, measure), 
         evidence = COALESCE($4, evidence), 
         event_type = COALESCE($5, event_type), 
         review_status = COALESCE($6, review_status), 
         reviewed_by = $7, 
         reviewed_at = NOW() 
       WHERE id = $8 RETURNING *`,
      [event_date, provider, measure, evidence, event_type, status, userId, eventId]
    );

    if (result.rows.length === 0) {
      console.warn(`[CLINICAL-TIMELINE] Edit Failed - Event Not Found: ${eventId}`);
      return res.status(404).json({ error: 'Event not found' });
    }

    // Log the status change to audit_logs for workflow timeline
    if (status) {
       await req.db.query(
         `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`,
         [userId, 'Evidence Status Updated', `Evidence event ${eventId} marked as ${status}`, 'Success']
       );
    }

    console.log(`[CLINICAL-TIMELINE] Event Edited Successfully`);
    return res.json({ success: true, message: 'Event edited successfully', event: result.rows[0] });
  } catch (err) {
    console.error("[Clinical Timeline API] Edit Error:", err);
    return res.status(500).json({ error: err.message || "Failed to edit event" });
  }
};

/**
 * Get unique filters for the clinical timeline
 */
exports.getClinicalTimelineFilters = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const patientId = req.query.patientId;

    let baseFilterProvider = 'WHERE provider IS NOT NULL AND provider != \'\'';
    let baseFilterEvent = 'WHERE event_type IS NOT NULL AND event_type != \'\'';
    const params = [];
    
    if (patientId) {
      baseFilterProvider += ` AND patient_id = $1`;
      baseFilterEvent += ` AND patient_id = $1`;
      params.push(patientId);
    }

    const providersResult = await req.db.query(`
      SELECT DISTINCT provider 
      FROM ${schema}.clinical_timeline_events 
      ${baseFilterProvider}
      ORDER BY provider
    `, params);

    const eventTypesResult = await req.db.query(`
      SELECT DISTINCT event_type 
      FROM ${schema}.clinical_timeline_events 
      ${baseFilterEvent}
      ORDER BY event_type
    `, params);

    // Common standard encounter types to present alongside dynamic ones
    const encounterTypes = [
      "All Encounters",
      "Office Visit", 
      "Telehealth", 
      "Emergency", 
      "Inpatient", 
      "Procedure"
    ];

    return res.json({
      success: true,
      data: {
        providers: providersResult.rows.map(row => row.provider),
        documentTypes: eventTypesResult.rows.map(row => row.event_type),
        encounterTypes: encounterTypes
      }
    });
  } catch (err) {
    console.error("[Clinical Timeline API] Get Filters Error:", err);
    return res.status(500).json({ error: err.message || "Failed to get timeline filters" });
  }
};

/**
 * Get chart abstraction summary for the widget
 */
exports.getChartAbstractionSummary = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;

    const evidenceResult = await req.db.query(`
      SELECT COUNT(*) as evidence_count
      FROM ${schema}.clinical_timeline_events
      WHERE chart_id = $1
    `, [chartId]);

    const evidenceCount = parseInt(evidenceResult.rows[0].evidence_count, 10) || 0;
    
    // Per user request, gap_to_close is mocked as pending logic for now
    const gapsToClose = 0;

    return res.json({
      success: true,
      data: {
        chart_id: chartId,
        evidence_items_count: evidenceCount,
        gaps_to_close_count: gapsToClose
      }
    });
  } catch (err) {
    console.error("[Clinical Timeline API] Get Chart Summary Error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chart summary" });
  }
};

/**
 * Get unified evidence timeline for the Abstraction Workspace
 */
exports.getEvidenceTimeline = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;

    // Fetch evidence items
    const evidenceResult = await req.db.query(`
      SELECT 
        e.id as "Evidence ID",
        e.evidence as "Evidence Name",
        c.chart_document as "Source Document",
        e.measure as "Measure",
        e.review_status as "Status",
        e.reviewed_by as "Created By",
        e.created_at as "Created Date",
        e.updated_at as "Updated Date",
        e.event_date as "Timeline Timestamp",
        'EVIDENCE' as "Timeline Type"
      FROM ${schema}.clinical_timeline_events e
      LEFT JOIN ${schema}.patient_charts c ON e.chart_id = c.id
      WHERE e.chart_id = $1
    `, [chartId]);

    // Fetch workflow audit logs for this chart
    const auditResult = await req.db.query(`
      SELECT 
        a.id as "Evidence ID",
        a.event_type as "Evidence Name",
        NULL as "Source Document",
        NULL as "Measure",
        a.status as "Status",
        a.user_id as "Created By",
        a.created_at as "Created Date",
        a.created_at as "Updated Date",
        a.created_at as "Timeline Timestamp",
        'WORKFLOW' as "Timeline Type",
        a.details as "Review Notes"
      FROM ${schema}.audit_logs a
      WHERE a.details ILIKE $1
    `, [`%${chartId}%`]);

    // Combine and sort
    const combinedTimeline = [...evidenceResult.rows, ...auditResult.rows].sort((a, b) => {
      const dateA = new Date(a["Timeline Timestamp"] || a["Created Date"]);
      const dateB = new Date(b["Timeline Timestamp"] || b["Created Date"]);
      return dateB - dateA; // Descending chronologically
    });

    return res.json({
      success: true,
      events: combinedTimeline
    });
  } catch (err) {
    console.error("[Evidence Timeline API] Error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch evidence timeline" });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(`UPDATE ${schema}.patient_charts SET abstraction_status = 'DRAFT' WHERE id = $1`, [chartId]);
    await req.db.query(`INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Draft Saved', `Chart abstraction saved as draft [ChartId: ${chartId}]`, 'Success']);

    return res.json({ success: true, message: 'Draft saved' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.markNotFound = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(`UPDATE ${schema}.patient_charts SET abstraction_status = 'NOT_FOUND' WHERE id = $1`, [chartId]);
    await req.db.query(`INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Marked Not Found', `Evidence marked as not found [ChartId: ${chartId}]`, 'Success']);

    return res.json({ success: true, message: 'Marked not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.submitQA = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(`UPDATE ${schema}.patient_charts SET abstraction_status = 'QA_REVIEW', status = 'Pending QA' WHERE id = $1`, [chartId]);
    await req.db.query(`INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Submitted To QA', `Chart abstraction submitted for QA review [ChartId: ${chartId}]`, 'Success']);

    return res.json({ success: true, message: 'Submitted for QA' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
