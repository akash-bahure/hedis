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
 *         description: Chart uploaded and processed successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/:patientId/charts/upload", upload.single("file"), chartController.uploadChart);

/**
 * @swagger
 * /api/patients/{patientId}/timeline:
 *   get:
 *     summary: Retrieve patient timeline evidence from AI service (Unprotected for testing)
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
 *         description: Timeline evidence retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/:patientId/timeline", chartController.getTimelineEvidence);

module.exports = router;
