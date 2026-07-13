// exports.requestEvidence = async (req, res) => {
//   try {
//     const { chartId, measureCode, requestedEvidenceType, requestedEvidenceSource, requestReason, comment } = req.body;
//     const schema = req.tenant.schema_name;
//     const userId = req.user ? req.user.id : null;

//     if (!chartId || !measureCode || !requestReason) {
//       return res.status(400).json({ error: "chartId, measureCode, and requestReason are required." });
//     }

//     // Insert into qa_evidence_requests
//     const result = await req.db.query(
//       `INSERT INTO ${schema}.qa_evidence_requests (
//          chart_id, measure_code, requested_evidence_type, requested_evidence_source,
//          request_reason, request_comment, status, requested_by
//        ) VALUES ($1, $2, $3, $4, $5, $6, 'OPEN', $7) RETURNING id`,
//       [chartId, measureCode, requestedEvidenceType, requestedEvidenceSource, requestReason, comment, userId]
//     );

//     const qaRequestId = result.rows[0].id;

//     // Update chart status
//     await req.db.query(
//       `UPDATE ${schema}.patient_charts
//        SET abstraction_status = 'QA_EVIDENCE_REQUESTED', status = 'QA Evidence Requested'
//        WHERE id = $1`,
//       [chartId]
//     );

//     // Update hedis_qa_queue if exists to keep statuses in sync
//     await req.db.query(
//       `UPDATE ${schema}.hedis_qa_queue
//        SET status = 'Evidence Requested', updated_at = NOW()
//        WHERE chart_id = $1`,
//       [chartId]
//     );

//     // Log Audit
//     await req.db.query(
//       `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`,
//       [userId, 'QA Requested Evidence', `QA requested additional evidence for measure ${measureCode} [QA Request: ${qaRequestId}]`, 'Success']
//     );

//     return res.json({ success: true, message: "Evidence request created", qaRequestId });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.approveChart = async (req, res) => {
//   try {
//     const { chartId } = req.params;
//     const schema = req.tenant.schema_name;
//     const userId = req.user ? req.user.id : null;

//     // Validate that there are no open QA requests
//     const openRequests = await req.db.query(
//       `SELECT id FROM ${schema}.qa_evidence_requests WHERE chart_id = $1 AND status IN ('OPEN', 'IN_PROGRESS')`,
//       [chartId]
//     );

//     if (openRequests.rows.length > 0) {
//       return res.status(400).json({ error: "Cannot approve chart. There are outstanding QA evidence requests." });
//     }

//     // Update chart status
//     await req.db.query(
//       `UPDATE ${schema}.patient_charts
//        SET abstraction_status = 'QA_APPROVED', status = 'QA Approved'
//        WHERE id = $1`,
//       [chartId]
//     );

//     // Update QA Queue status
//     await req.db.query(
//       `UPDATE ${schema}.hedis_qa_queue
//        SET status = 'Approved', updated_at = NOW()
//        WHERE chart_id = $1`,
//       [chartId]
//     );

//     // Log Audit
//     await req.db.query(
//       `INSERT INTO ${schema}.audit_logs (user_id, event_type, details, status) VALUES ($1, $2, $3, $4)`,
//       [userId, 'QA Approved Chart', `QA fully approved chart [ChartId: ${chartId}]`, 'Success']
//     );

//     return res.json({ success: true, message: "Chart QA approved successfully" });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// };
