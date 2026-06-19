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
 *     responses:
 *       200:
 *         description: Clinical timeline evidence retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/:patientId/clinical-timeline", chartController.getClinicalTimeline);

/**
 * @swagger
 * /api/clinical-timeline/{eventId}/review-evidence:
 *   get:
 *     summary: Retrieve detailed evidence for review screen
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
 *         description: Evidence details retrieved successfully
 */
router.get("/clinical-timeline/:eventId/review-evidence", chartController.getReviewEvidence);

/**
 * @swagger
 * /api/clinical-timeline/{eventId}:
 *   put:
 *     summary: Edit an existing clinical timeline event
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_date:
 *                 type: string
 *                 format: date
 *               provider:
 *                 type: string
 *               measure:
 *                 type: string
 *               evidence:
 *                 type: string
 *               event_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event edited successfully
 */
router.put("/clinical-timeline/:eventId", chartController.editEvent);

/**
 * @swagger
 * /api/clinical-timeline/filters:
 *   get:
 *     summary: Get unique filters for the clinical timeline
 *     tags: [Clinical Timeline]
 *     responses:
 *       200:
 *         description: Filters retrieved successfully
 */
router.get("/clinical-timeline/filters", chartController.getClinicalTimelineFilters);

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
 */
router.get("/charts/:chartId/abstraction-summary", chartController.getChartAbstractionSummary);

/**
 * @swagger
 * /api/charts/{chartId}/evidence-timeline:
 *   get:
 *     summary: Retrieve chronological evidence timeline including workflow actions
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evidence timeline retrieved successfully
 */
router.get("/charts/:chartId/evidence-timeline", chartController.getEvidenceTimeline);

/**
 * @swagger
 * /api/charts/{chartId}/save-draft:
 *   post:
 *     summary: Save chart abstraction as draft
 *     tags: [Abstraction Workflow]
 */
router.post("/charts/:chartId/save-draft", chartController.saveDraft);

/**
 * @swagger
 * /api/charts/{chartId}/mark-not-found:
 *   post:
 *     summary: Mark evidence not found
 *     tags: [Abstraction Workflow]
 */
router.post("/charts/:chartId/mark-not-found", chartController.markNotFound);

/**
 * @swagger
 * /api/charts/{chartId}/submit-qa:
 *   post:
 *     summary: Submit abstraction to QA review
 *     tags: [Abstraction Workflow]
 */
router.post("/charts/:chartId/submit-qa", chartController.submitQA);

module.exports = router;
