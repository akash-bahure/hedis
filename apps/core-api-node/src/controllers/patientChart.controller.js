const { forwardChartToAiService } = require("../services/aiIntegration.service");
const chartQueue = require("../queue/chart.queue");
const measureService = require("../services/measure.service");

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
      chartId,
      documentType, 
      encounterType, 
      providerIds, 
      hedisRelevant, 
      structuredRelevant, 
      startDate, 
      endDate 
    } = req.query;
    const schema = req.tenant.schema_name;

    console.log(`[CLINICAL-TIMELINE] Fetch Started`);
    console.log(`[CLINICAL-TIMELINE] Patient ID: ${patientId}`);
    console.log(`[CLINICAL-TIMELINE] Filters:`, req.query);

    let queryStr = `
      SELECT id, event_date, event_type, measure, provider, evidence, source_type, review_status, source_excerpt, review_comment, rejection_reason, extracted_evidence, ai_confidence_score
      FROM ${schema}.clinical_timeline_events
      WHERE patient_id = $1
    `;
    const params = [patientId];
    let paramIndex = 2;

    if (chartId) {
      queryStr += ` AND chart_id = $${paramIndex}`;
      params.push(chartId);
      paramIndex++;
    }

    // Search by text
    if (search) {
      queryStr += ` AND (evidence ILIKE $${paramIndex} OR measure ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by Document Type
    if (documentType) {
      const typesArray = documentType.split(',').map(t => t.trim());
      queryStr += ` AND event_type = ANY($${paramIndex})`;
      params.push(typesArray);
      paramIndex++;
    }

    // Filter by Specific Encounter Type
    if (encounterType && encounterType !== 'All Encounters') {
      const typesArray = encounterType.split(',').map(t => t.trim());
      queryStr += ` AND event_type = ANY($${paramIndex})`;
      params.push(typesArray);
      paramIndex++;
    }

    // Filter by Provider IDs (validate against chart data)
    if (providerIds) {
      const providerArray = providerIds.split(',').map(p => p.trim());
      queryStr += ` AND provider = ANY($${paramIndex})`;
      params.push(providerArray);
      paramIndex++;
    }

    // HEDIS Relevant Only (Measure must be present)
    if (hedisRelevant === 'true') {
      queryStr += ` AND measure IS NOT NULL AND measure != ''`;
    }

    // Structured Data Only (Source Type is EMR/EHR/MANUAL)
    if (structuredRelevant === 'true') {
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

    // Dynamic Providers Extraction
    let providerQuery = `SELECT DISTINCT provider FROM ${schema}.clinical_timeline_events WHERE patient_id = $1 AND provider IS NOT NULL AND provider != ''`;
    const providerParams = [patientId];
    if (chartId) {
      providerQuery += ` AND chart_id = $2`;
      providerParams.push(chartId);
    }
    const providerResult = await req.db.query(providerQuery, providerParams);
    const availableProviders = providerResult.rows.map(r => r.provider);

    console.log(`[CLINICAL-TIMELINE] Events Found: ${result.rows.length}`);
    console.log(`[CLINICAL-TIMELINE] Response Sent`);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No clinical timeline events found for this patient matching the filters.",
        events: [],
        availableProviders
      });
    }

    return res.json({
      message: "Clinical timeline events successfully retrieved.",
      events: result.rows,
      availableProviders
    });
  } catch (err) {
    console.error("[Clinical Timeline API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch clinical timeline evidence",
    });
  }
};



exports.acceptEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reviewedBy, comment, sourceExcerpt, extractedEvidence } = req.body;
    const schema = req.tenant.schema_name;
    const userId = reviewedBy || (req.user ? req.user.id : null);

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events 
       SET review_status = 'ACCEPTED', 
           reviewed_by = $1, 
           reviewed_at = NOW(), 
           review_comment = $2, 
           source_excerpt = $3, 
           extracted_evidence = $4 
       WHERE id = $5`,
      [userId, comment, sourceExcerpt, extractedEvidence, eventId]
    );

    await req.db.query(
      `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Evidence Accepted', `Evidence accepted for EventId: ${eventId}`, 'Success']
    );

    return res.json({ success: true, message: 'Event accepted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { reviewedBy, reason, sourceExcerpt } = req.body;
    const schema = req.tenant.schema_name;
    const userId = reviewedBy || (req.user ? req.user.id : null);

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events 
       SET review_status = 'REJECTED', 
           reviewed_by = $1, 
           reviewed_at = NOW(), 
           rejection_reason = $2, 
           source_excerpt = $3 
       WHERE id = $4`,
      [userId, reason, sourceExcerpt, eventId]
    );

    await req.db.query(
      `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Evidence Rejected', `Evidence rejected for EventId: ${eventId}`, 'Success']
    );

    return res.json({ success: true, message: 'Event rejected' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { comment, reviewedBy } = req.body;
    const schema = req.tenant.schema_name;
    const userId = reviewedBy || (req.user ? req.user.id : null);

    await req.db.query(
      `UPDATE ${schema}.clinical_timeline_events 
       SET review_comment = $1, 
           reviewed_by = $2, 
           reviewed_at = NOW() 
       WHERE id = $3`,
      [comment, userId, eventId]
    );

    await req.db.query(
      `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'EVIDENCE_COMMENT_ADDED', `Comment added for EventId: ${eventId}`, 'Success']
    );

    return res.json({ success: true, message: 'Event edited successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getReviewEvidence = async (req, res) => {
  try {
    const { eventId } = req.params;
    const schema = req.tenant.schema_name;

    const result = await req.db.query(
      `SELECT * FROM ${schema}.clinical_timeline_events WHERE id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const event = result.rows[0];

    const auditResult = await req.db.query(
      `SELECT * FROM ${schema}.audit_logs WHERE details LIKE $1 ORDER BY created_at DESC`,
      [`%${eventId}%`]
    );

    const reviewHistory = auditResult.rows.map(log => ({
      action: log.event_type,
      user: log.user_id,
      timestamp: log.created_at,
      details: log.details
    }));

    // Reconstruct the requested format
    const responseData = {
      id: event.id,
      document: {
        documentId: "doc123",
        documentName: "Source Document",
        pageNumber: 1
      },
      sourceExcerpt: event.source_excerpt || event.source_text || "",
      extractedEvidence: event.extracted_evidence || { value: event.evidence },
      aiConfidenceScore: event.ai_confidence_score || event.confidence || 0,
      status: event.review_status || "PENDING",
      reviewComment: event.review_comment || null,
      rejectionReason: event.rejection_reason || null,
      reviewHistory
    };

    return res.json(responseData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



/**
 * Get chart abstraction summary for the widget
 */
exports.getChartAbstractionSummary = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;

    // Fetch patient and assigned measure from DB
    const patientResult = await req.db.query(`
      SELECT p.id, p.measure
      FROM ${schema}.patient_charts c
      JOIN ${schema}.patients p ON c.patient_id = p.id
      WHERE c.id = $1
    `, [chartId]);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: "Chart or patient not found" });
    }

    const patient = patientResult.rows[0];
    const measureCode = patient.measure;

    // Fetch measure requirements
    const enrichedMeasure = measureService.enrichMeasure(
      measureService.getMeasureByIdOrCode(measureCode)
    );

    let measureName = measureCode || "Unassigned";
    let requiredEvidenceTypes = [];
    let eligibilityStatus = "Eligible";
    
    if (enrichedMeasure) {
      measureName = enrichedMeasure.measureMetadata.measureName || measureName;
      
      if (enrichedMeasure.documentation && enrichedMeasure.documentation.acceptedEvidenceTypes) {
        requiredEvidenceTypes = enrichedMeasure.documentation.acceptedEvidenceTypes.map(e => e.type);
      }
    }

    // Fetch existing timeline events for this chart
    const timelineResult = await req.db.query(`
      SELECT event_type 
      FROM ${schema}.clinical_timeline_events
      WHERE chart_id = $1 AND event_type IS NOT NULL
    `, [chartId]);

    const existingEvents = timelineResult.rows.map(row => row.event_type);

    // Calculate Missing Evidence
    // Assuming each required evidence type needs to be present
    let missingEvidenceList = [];
    let gapToCloseDetails = [];

    requiredEvidenceTypes.forEach(reqType => {
      // Check if we have an event matching the required type (case-insensitive approx match)
      const isMet = existingEvents.some(evt => evt.toLowerCase() === reqType.toLowerCase());
      if (!isMet) {
        missingEvidenceList.push(reqType);
        gapToCloseDetails.push(`Missing ${reqType}`);
      }
    });

    // Check Eligibility based on missing evidence
    if (requiredEvidenceTypes.length > 0 && missingEvidenceList.length === requiredEvidenceTypes.length) {
       eligibilityStatus = "Missing Evidence / Not Eligible";
    } else if (missingEvidenceList.length > 0) {
       eligibilityStatus = "Gap To Close";
    }

    const availableEvidenceCount = existingEvents.length;
    const missingEvidenceCount = missingEvidenceList.length;

    return res.json({
      success: true,
      data: {
        chart_id: chartId,
        measureName: measureName,
        eligibilityStatus: eligibilityStatus,
        availableEvidenceCount: availableEvidenceCount,
        missingEvidenceCount: missingEvidenceCount,
        missingEvidenceList: missingEvidenceList,
        gapToCloseDetails: gapToCloseDetails
      }
    });
  } catch (err) {
    console.error("[Clinical Timeline API] Get Chart Summary Error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chart summary" });
  }
};



async function upsertManualAbstraction(req, status) {
  const { chartId } = req.params;
  const schema = req.tenant.schema_name;
  const userId = req.user ? req.user.id : null;
  const {
    patient_id,
    service_date,
    screening_type,
    evidence_type,
    systolic,
    diastolic,
    cpt_code,
    icd_10_code,
    source_type,
    evidence_source,
    uploaded_document,
    notes,
    qaRequestId,
  } = req.body;

  // Verify chart exists and get patient_id if not provided
  const chartRes = await req.db.query(`SELECT id, patient_id FROM ${schema}.patient_charts WHERE id = $1`, [chartId]);
  if (chartRes.rows.length === 0) throw new Error("Chart not found");
  const actualPatientId = patient_id || chartRes.rows[0].patient_id;

  // Check if abstraction exists for this chart
  const existing = await req.db.query(`SELECT id FROM ${schema}.manual_chart_abstractions WHERE patient_chart_id = $1`, [chartId]);

  let manualEvidenceId;

  if (existing.rows.length > 0) {
    // Update
    await req.db.query(`
      UPDATE ${schema}.manual_chart_abstractions SET
        service_date = $1, screening_type = $2, evidence_type = $3,
        systolic = $4, diastolic = $5, cpt_code = $6, icd_10_code = $7,
        source_type = $8, evidence_source = $9, uploaded_document = $10,
        notes = $11, abstraction_status = $12
      WHERE patient_chart_id = $13
    `, [
      service_date, screening_type, evidence_type, systolic, diastolic,
      cpt_code, icd_10_code, source_type, evidence_source, uploaded_document,
      notes, status, chartId
    ]);
    manualEvidenceId = existing.rows[0].id;
  } else {
    // Insert
    const insertRes = await req.db.query(`
      INSERT INTO ${schema}.manual_chart_abstractions (
        patient_id, patient_chart_id, service_date, screening_type, evidence_type,
        systolic, diastolic, cpt_code, icd_10_code, source_type, evidence_source,
        uploaded_document, notes, abstraction_status, created_by, abstracted_by, abstracted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
      ) RETURNING id
    `, [
      actualPatientId, chartId, service_date, screening_type, evidence_type,
      systolic, diastolic, cpt_code, icd_10_code, source_type, evidence_source,
      uploaded_document, notes, status, userId, userId
    ]);
    manualEvidenceId = insertRes.rows[0].id;
  }

  // Handle QA Request logic if present
  if (qaRequestId) {
    await req.db.query(
      `UPDATE ${schema}.qa_evidence_requests 
       SET status = 'RESOLVED', resolved_by = $1, resolved_at = NOW(), submitted_evidence_id = $2 
       WHERE id = $3 AND chart_id = $4`,
      [userId, manualEvidenceId, qaRequestId, chartId]
    );

    // Update chart status back to QA queue status (so it returns to the same QA user)
    await req.db.query(
      `UPDATE ${schema}.patient_charts 
       SET abstraction_status = 'READY_FOR_QA_REVIEW', status = 'Ready for QA Review' 
       WHERE id = $1`,
      [chartId]
    );

    await req.db.query(
      `UPDATE ${schema}.hedis_qa_queue 
       SET status = 'Ready for QA Review', updated_at = NOW() 
       WHERE chart_id = $1`,
      [chartId]
    );

    await req.db.query(
      `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`,
      [userId, 'QA Evidence Submitted', `Abstractor submitted requested evidence for QA Request: ${qaRequestId}`, 'Success']
    );
  }
}

exports.saveDraft = async (req, res) => {
  try {
    const { chartId } = req.params;
    const schema = req.tenant.schema_name;
    const userId = req.user ? req.user.id : null;

    if (Object.keys(req.body).length > 0) {
      await upsertManualAbstraction(req, 'DRAFT');
    }

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

    if (Object.keys(req.body).length > 0) {
      await upsertManualAbstraction(req, 'NOT_FOUND');
    }

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

    // Save payload if provided
    if (Object.keys(req.body).length > 0) {
      await upsertManualAbstraction(req, 'QA_REVIEW');
    }

    // QA Assignment Logic
    const chartRes = await req.db.query(`
      SELECT c.patient_id, p.qa_id, c.chart_id as chart_code, p.measure,
             p.first_name, p.last_name
      FROM ${schema}.patient_charts c
      JOIN ${schema}.patients p ON c.patient_id = p.id
      WHERE c.id = $1
    `, [chartId]);

    if (chartRes.rows.length === 0) {
      return res.status(404).json({ error: 'Chart not found' });
    }

    const { patient_id, qa_id, chart_code, measure, first_name, last_name } = chartRes.rows[0];
    const patientName = `${first_name} ${last_name}`;

    if (!qa_id) {
      return res.status(400).json({ error: 'Cannot submit to QA. No QA user assigned to this patient.' });
    }

    // Insert or update in hedis_qa_queue
    const existingQA = await req.db.query(`SELECT id FROM ${schema}.hedis_qa_queue WHERE chart_id = $1`, [chartId]);
    if (existingQA.rows.length > 0) {
      await req.db.query(`
        UPDATE ${schema}.hedis_qa_queue 
        SET status = 'Pending QA', qa_assignee = $1, sent_by = $2, sent_at = NOW(), updated_at = NOW()
        WHERE chart_id = $3
      `, [qa_id, userId, chartId]);
    } else {
      await req.db.query(`
        INSERT INTO ${schema}.hedis_qa_queue (
          patient_id, patient_name, chart_id, measure_code, status, sent_by, qa_assignee
        ) VALUES ($1, $2, $3, $4, 'Pending QA', $5, $6)
      `, [patient_id, patientName, chartId, measure, userId, qa_id]);
    }

    await req.db.query(`UPDATE ${schema}.patient_charts SET abstraction_status = 'QA_REVIEW', status = 'Pending QA' WHERE id = $1`, [chartId]);
    await req.db.query(`INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`, 
      [userId, 'Submitted To QA', `Chart abstraction submitted for QA review [ChartId: ${chartId}] to QA User [${qa_id}]`, 'Success']);

    return res.json({ success: true, message: 'Submitted for QA' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
