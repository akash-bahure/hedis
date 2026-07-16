const express = require("express");
const multer = require("multer");
const hedisController = require("../controllers/hedis.controller");
const router = express.Router();
const fs = require("fs");
const path = require("path");

/**
 * @swagger
 * /api/hedis/evaluations/{id}:
 *   get:
 *     summary: Get HEDIS evaluations for a patient
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evaluations fetched
 */
router.get("/evaluations/:id", hedisController.getEvaluations);

/**
 * @swagger
 * /api/hedis/qa-review/{evaluationId}:
 *   get:
 *     summary: Get detailed HEDIS QA review data including AI analysis and evidence
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: evaluationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: QA review details fetched successfully
 */
router.get("/qa-review/:evaluationId", hedisController.getQAReviewDetails);

/**
 * @swagger
 * /api/hedis/assign-abstractor:
 *   post:
 *     summary: Assign a patient to an abstractor with measure-level decisions
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - assignedAbstractorId
 *               - decisions
 *             properties:
 *               patientId:
 *                 type: string
 *               chartId:
 *                 type: string
 *               assignedAbstractorId:
 *                 type: string
 *               decisions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     measureId:
 *                       type: string
 *                     measureCode:
 *                       type: string
 *                     measureName:
 *                       type: string
 *                     qaStatus:
 *                       type: string
 *                       enum: [QA_PASS, REQUEST_REVISION, QA_FAIL]
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Abstractor assigned successfully
 */
router.post("/assign-abstractor", hedisController.assignAbstractor);

/**
 * @swagger
 * /api/hedis/patient/qa-stage:
 *   post:
 *     summary: Update patient overall QA stage from QA buttons
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - action
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 enum: [QA_PASS, REQUEST_REVISION, QA_FAIL]
 *               reason:
 *                 type: string
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient stage updated successfully
 */
router.post("/patient/qa-stage", hedisController.updatePatientQAStage);

/**
 * @swagger
 * /api/hedis/clinical-timeline/{patientId}:
 *   get:
 *     summary: Get clinical timeline for a patient with optional filters
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the patient
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for event_title, summary, or provider (case-insensitive)
 *
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *         description: Filter by document type
 *
 *       - in: query
 *         name: encounterType
 *         schema:
 *           type: string
 *         description: Filter by encounter type
 *
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by provider name
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for event_date filter (YYYY-MM-DD)
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for event_date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Clinical timeline data returned (grouped by year and month)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient_id:
 *                   type: string
 *                   format: uuid
 *                 timeline:
 *                   type: object
 *                   description: Grouped timeline events by year → month
 *       500:
 *         description: Internal server error
 */
router.get("/clinical-timeline/:id", hedisController.getClinicalTimeline);

/**
 * @swagger
 * /api/hedis/clinical-timeline/event/{eventId}:
 *   get:
 *     summary: Get detailed information for a specific timeline event
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event details fetched
 */
router.get(
  "/clinical-timeline/event/:eventId",
  hedisController.getTimelineEventDetails
);

/**
 * @swagger
 * /api/hedis/clinical-timeline/review:
 *   post:
 *     summary: Accept or Reject a timeline event
 *     tags: [Clinical Timeline]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId, status]
 *             properties:
 *               eventId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *               remarks:
 *                 type: string
 *               reviewedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review saved
 */
router.post("/clinical-timeline/review", hedisController.reviewTimelineEvent);

/**
 * @swagger
 * /api/hedis/evidence-timeline/{id}:
 *   get:
 *     summary: Get evidence timeline events for abstractor
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the patient
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Category filter (All, HEDIS Only, Encounters, Labs, Meds, Docs)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Provider name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Evidence timeline fetched successfully
 */
router.get("/evidence-timeline/:id", hedisController.getEvidenceTimeline);

/**
 * @swagger
 * /api/hedis/abstractor-measures/{patientId}:
 *   get:
 *     summary: Get all QA measure decisions assigned to the abstractor for a patient
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the patient
 *     responses:
 *       200:
 *         description: List of measure decisions for the abstractor
 *       404:
 *         description: Patient not found
 */
router.get(
  "/abstractor-measures/:patientId",
  hedisController.getAbstractorMeasures
);

const evidenceUploadDir = path.join(__dirname, "../uploads/evidence");
if (!fs.existsSync(evidenceUploadDir)) {
  fs.mkdirSync(evidenceUploadDir, { recursive: true });
}

const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, evidenceUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `evidence_${timestamp}${ext}`);
  },
});

const uploadEvidence = multer({ storage: evidenceStorage });

/**
 * @swagger
 * /api/hedis/abstractor/submit-qa:
 *   post:
 *     summary: Submit HEDIS measure evidence to QA queue with evidence upload
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - chartId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               chartId:
 *                 type: string
 *                 format: uuid
 *               measureId:
 *                 type: string
 *                 format: uuid
 *               serviceDate:
 *                 type: string
 *                 format: date
 *               screeningType:
 *                 type: string
 *               evidenceType:
 *                 type: string
 *               reading:
 *                 type: string
 *               cptCode:
 *                 type: string
 *               icd10Code:
 *                 type: string
 *               evidenceSource:
 *                 type: string
 *               notes:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Evidence PDF document
 *     responses:
 *       200:
 *         description: Evidence submitted and PDF merged successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post(
  "/abstractor/submit-qa",
  uploadEvidence.single("document"),
  hedisController.submitAbstractorQA
);

/**
 * @swagger
 * /api/hedis/recalculate-qa:
 *   post:
 *     summary: Trigger AI recalculation for measures submitted by the Abstractor
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the patient
 *               evaluationId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional ID of a specific evaluation to recalculate
 *     responses:
 *       200:
 *         description: Recalculation successfully triggered and queued
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Patient chart or matching submitted measures not found
 *       500:
 *         description: Internal server error
 */
router.post("/recalculate-qa", hedisController.triggerRecalculation);

/**
 * @swagger
 * /api/hedis/abstractor/save-draft:
 *   post:
 *     summary: Save a draft of abstractor measure fields without submitting to QA
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - chartId
 *               - measureId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient
 *               chartId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient chart
 *               measureId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID from hedis_evaluations.id
 *               serviceDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               screeningType:
 *                 type: string
 *                 example: "CBC"
 *               evidenceType:
 *                 type: string
 *                 example: "Office Visit BP Reading"
 *               reading:
 *                 type: string
 *                 example: "120/80"
 *               cptCode:
 *                 type: string
 *                 example: "99213"
 *               icd10Code:
 *                 type: string
 *                 example: "I10"
 *               evidenceSource:
 *                 type: string
 *                 example: "Electronic Health Record (EHR)"
 *               notes:
 *                 type: string
 *                 example: "Draft in progress - needs review"
 *               uploadedDocument:
 *                 type: object
 *                 description: JSON metadata of a previously uploaded document reference (not a file upload)
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Draft saved successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     patient_id:
 *                       type: string
 *                     chart_id:
 *                       type: string
 *                     measure_id:
 *                       type: string
 *                     is_draft:
 *                       type: boolean
 *                       example: true
 *                     not_found:
 *                       type: boolean
 *                       example: false
 *                     service_date:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Measure already submitted to QA — cannot overwrite with draft
 *       500:
 *         description: Internal server error
 */
router.post("/abstractor/save-draft", hedisController.saveDraft);

/**
 * @swagger
 * /api/hedis/abstractor/draft/{patientId}:
 *   get:
 *     summary: Get a saved draft for a specific measure
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the patient
 *       - in: query
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the patient chart
 *       - in: query
 *         name: measureId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID from hedis_evaluations.id
 *     responses:
 *       200:
 *         description: Draft returned (null if none exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 draft:
 *                   oneOf:
 *                     - type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         patient_id:
 *                           type: string
 *                         chart_id:
 *                           type: string
 *                         measure_id:
 *                           type: string
 *                         is_draft:
 *                           type: boolean
 *                           example: true
 *                         service_date:
 *                           type: string
 *                         screening_type:
 *                           type: string
 *                         evidence_type:
 *                           type: string
 *                         reading:
 *                           type: string
 *                         cpt_code:
 *                           type: string
 *                         icd10_code:
 *                           type: string
 *                         notes:
 *                           type: string
 *                         updated_at:
 *                           type: string
 *                     - type: 'null'
 *                       description: No draft found for this measure
 *       400:
 *         description: Missing required query params
 *       500:
 *         description: Internal server error
 */
router.get("/abstractor/draft/:patientId", hedisController.getDraft);

/**
 * @swagger
 * /api/hedis/abstractor/mark-not-found:
 *   post:
 *     summary: Flag a measure as 'Evidence Not Found' to notify QA reviewer
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - chartId
 *               - measureId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient
 *               chartId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient chart
 *               measureId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID from hedis_evaluations.id
 *               comment:
 *                 type: string
 *                 nullable: true
 *                 example: "Searched all available records — no evidence found."
 *     responses:
 *       200:
 *         description: Measure successfully flagged as Evidence Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Measure marked as 'Evidence Not Found'. A QA reviewer will be notified to manually verify."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     patient_id:
 *                       type: string
 *                     chart_id:
 *                       type: string
 *                     measure_id:
 *                       type: string
 *                     not_found:
 *                       type: boolean
 *                       example: true
 *                     not_found_comment:
 *                       type: string
 *                     not_found_at:
 *                       type: string
 *                       format: date-time
 *                     is_draft:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/abstractor/mark-not-found", hedisController.markNotFound);

/**
 * @swagger
 * /api/hedis/add-measure:
 *   post:
 *     summary: Manually add a missing HEDIS measure and trigger AI evaluation for that single measure
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient
 *               measureId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the measure from the Measure Library (use this OR measureCode)
 *               measureCode:
 *                 type: string
 *                 description: Measure code (e.g. BCS, CBP) — used if measureId is not provided
 *     responses:
 *       201:
 *         description: Measure evaluated and added to hedis_evaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Measure 'BCS' successfully evaluated and added."
 *                 evaluation:
 *                   type: object
 *                   description: The saved hedis_evaluations record
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Patient, measure, or patient chart not found
 *       409:
 *         description: Evaluation for this measure already exists — use recalculate-qa instead
 *       500:
 *         description: Internal server error
 */
router.post("/add-measure", hedisController.addMeasure);

/**
 * @swagger
 * /api/hedis/add-missing-evidence:
 *   post:
 *     summary: Manually add a missing evidence record into the clinical timeline
 *     description: >
 *       Inserts a record into clinical_timeline_events without any AI extraction.
 *       document_type is set to "External Document" and source_type to "MANUAL" by the backend.
 *       provider is derived from the authenticated user.
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - eventTitle
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient
 *               chartId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the patient chart (optional)
 *               eventTitle:
 *                 type: string
 *                 description: Evidence type / title of the timeline event
 *                 example: "Annual Wellness Visit"
 *               summary:
 *                 type: string
 *                 description: Free-text summary of the evidence
 *                 example: "Patient completed annual wellness visit with Dr. Smith"
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the evidence event (defaults to today if omitted)
 *                 example: "2024-06-15"
 *               documentType:
 *                 type: string
 *                 description: Document type label (defaults to "External Document" if omitted)
 *                 example: "External Document"
 *     responses:
 *       201:
 *         description: Evidence record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing evidence record added successfully."
 *                 data:
 *                   type: object
 *                   description: The inserted clinical_timeline_events row
 *       400:
 *         description: Missing required fields (patientId or eventTitle)
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
router.post("/add-missing-evidence", hedisController.addMissingEvidence);

module.exports = router;
