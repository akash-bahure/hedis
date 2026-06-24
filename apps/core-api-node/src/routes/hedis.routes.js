const express = require("express");
const multer = require("multer");
const hedisController = require("../controllers/hedis.controller");
const router = express.Router();


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
 * /api/hedis/qa-queue/{patientId}:
 *   get:
 *     summary: Fetch QA queue entries for a specific patient with filters and pagination
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID to filter QA queue
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
 *         description: Filter by status (Pending QA, In Review, etc.)
 *     responses:
 *       200:
 *         description: List of QA entries for the patient fetched successfully
 */
/*
router.get("/qa-queue/:id", hedisController.getQAQueue);
*/

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
 * /api/hedis/update-qa-status:
 *   post:
 *     summary: Update QA status for selected QA queue records
 *     tags: [HEDIS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qaQueueIds
 *               - action
 *             properties:
 *               qaQueueIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Selected QA queue record IDs
 *               action:
 *                 type: string
 *                 enum:
 *                   - requestRevision
 *                   - qaFail
 *                   - qaPass
 *               reason:
 *                 type: string
 *                 nullable: true
 *               additionalNotes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: QA status updated successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post("/update-qa-status", hedisController.updateQAStatus);

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

module.exports = router;
