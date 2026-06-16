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

    console.log(`[Upload API] Chart ${chartId} queued successfully with job ID ${job.id}`);

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
 * Get timeline evidence
 */
exports.getTimelineEvidence = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    console.log(`[Timeline API] Fetching events for patient ${patientId}`);

    const result = await req.db.query(
      `
      SELECT id, event_date, event_type, measure, provider, evidence, source_type, review_status
      FROM ${schema}.clinical_timeline_events
      WHERE patient_id = $1
      ORDER BY event_date DESC
      `,
      [patientId]
    );

    console.log(`[Timeline API] Found ${result.rows.length} events for patient ${patientId}`);

    return res.json(result.rows);
  } catch (err) {
    console.error("[Timeline API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch timeline evidence",
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
    const { event_date, provider, measure, evidence, event_type } = req.body;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events 
       SET event_date = $1, provider = $2, measure = $3, evidence = $4, event_type = $5, review_status = 'EDITED', reviewed_by = $6, reviewed_at = NOW() 
       WHERE id = $7`,
      [event_date, provider, measure, evidence, event_type, userId, eventId]
    );

    return res.json({ success: true, message: 'Event edited' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
