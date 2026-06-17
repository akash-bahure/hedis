const express = require("express");
const multer = require("multer");
const hedisController = require("../controllers/hedis.controller");
const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

/**
 * @swagger
 * /api/hedis/evaluate/{id}:
 *   post:
 *     summary: Evaluate a patient's chart for HEDIS measures
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *     responses:
 *       200:
 *         description: Evaluation completed
 */
router.post("/evaluate/:id", upload.single("file"), hedisController.evaluateChart);

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
 * /api/hedis/send-to-qa:
 *   post:
 *     summary: Send a patient's measure to QA queue
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               patientName:
 *                 type: string
 *               chartId:
 *                 type: string
 *               measureCode:
 *                 type: string
 *               measureName:
 *                 type: string
 *               qaAssigneeId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sent to QA
 */
router.post("/send-to-qa", hedisController.sendToQA);

/**
 * @swagger
 * /api/hedis/qa-queue:
 *   get:
 *     summary: Fetch all patient+measure entries in QA queue with filters and pagination
 *     tags: [HEDIS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name or measure code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (Pending QA, In Review, Returned, etc.)
 *     responses:
 *       200:
 *         description: List of QA entries fetched successfully
 */
router.get("/qa-queue", hedisController.getQAQueue);

/**
 * @swagger
 * /api/hedis/mark-as-reviewed:
 *   post:
 *     summary: Mark a patient's measure as reviewed
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               measureCode:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marked as reviewed
 */
router.post("/mark-as-reviewed", hedisController.markAsReviewed);

module.exports = router;
