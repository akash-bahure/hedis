const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const chartController = require("../controllers/patientChart.controller");

/**
 * @swagger
 * /api/patients/{patientId}/charts/upload:
 *   post:
 *     summary: Upload a patient chart to AI service (Unprotected for testing)
 *     tags: [Patients, AI Integration]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF chart file
 *     responses:
 *       200:
 *         description: Chart queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "QUEUED"
 *                 chartId:
 *                   type: string
 *                 jobId:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/:patientId/charts/upload", upload.single("file"), chartController.uploadChart);

/**
 * @swagger
 * /api/patients/{patientId}/clinical-timeline:
 *   get:
 *     summary: Retrieve patient clinical timeline evidence from AI service (Unprotected for testing)
 *     tags: [Patients, AI Integration]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The patient ID
 *       - in: query
 *         name: chartId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional chart ID to scope provider filter extraction
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [Medication, Document, Imaging, Vitals, "Lab Results", Encounter]
 *         description: Filter by document type
 *       - in: query
 *         name: encounterType
 *         schema:
 *           type: string
 *           enum: [Telehealth, "Office Visit", Emergency, Inpatient, Procedure]
 *         description: Filter by encounter type
 *       - in: query
 *         name: providerIds
 *         schema:
 *           type: string
 *         description: Comma separated provider IDs
 *       - in: query
 *         name: hedisRelevant
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: structuredRelevant
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Clinical timeline evidence retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                 availableProviders:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get("/:patientId/clinical-timeline", chartController.getClinicalTimeline);

/**
 * @swagger
 * /api/charts/{chartId}/abstraction-summary:
 *   get:
 *     summary: Retrieve summary data for a loaded chart abstraction workspace
 *     tags: [Patients, AI Integration]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chart summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chart_id:
 *                       type: string
 *                     measureName:
 *                       type: string
 *                     eligibilityStatus:
 *                       type: string
 *                     availableEvidenceCount:
 *                       type: integer
 *                     missingEvidenceCount:
 *                       type: integer
 *                     missingEvidenceList:
 *                       type: array
 *                       items:
 *                         type: string
 *                     gapToCloseDetails:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Chart or patient not found
 *       500:
 *         description: Internal server error
 */
router.get("/charts/:chartId/abstraction-summary", chartController.getChartAbstractionSummary);

/**
 * @swagger
 * /api/charts/{chartId}/save-draft:
 *   post:
 *     summary: Save chart abstraction as draft
 *     tags: [Abstraction Workflow]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_date:
 *                 type: string
 *                 format: date
 *               screening_type:
 *                 type: string
 *               evidence_type:
 *                 type: string
 *               systolic:
 *                 type: integer
 *               diastolic:
 *                 type: integer
 *               cpt_code:
 *                 type: string
 *               icd_10_code:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Draft saved
 */
router.post("/charts/:chartId/save-draft", chartController.saveDraft);

/**
 * @swagger
 * /api/charts/{chartId}/mark-not-found:
 *   post:
 *     summary: Mark evidence not found
 *     tags: [Abstraction Workflow]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marked not found
 */
router.post("/charts/:chartId/mark-not-found", chartController.markNotFound);

/**
 * @swagger
 * /api/charts/{chartId}/submit-qa:
 *   post:
 *     summary: Submit abstraction to QA review
 *     tags: [Abstraction Workflow]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_date:
 *                 type: string
 *                 format: date
 *               screening_type:
 *                 type: string
 *               evidence_type:
 *                 type: string
 *               systolic:
 *                 type: integer
 *               diastolic:
 *                 type: integer
 *               cpt_code:
 *                 type: string
 *               icd_10_code:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submitted for QA
 */
router.post("/charts/:chartId/submit-qa", chartController.submitQA);

module.exports = router;
