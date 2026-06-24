const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qa.controller");

/**
 * @swagger
 * /api/qa/evidence-requests:
 *   post:
 *     summary: Request additional evidence from QA
 *     tags: [QA Rework]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chartId:
 *                 type: string
 *                 format: uuid
 *               measureCode:
 *                 type: string
 *               requestedEvidenceType:
 *                 type: string
 *               requestedEvidenceSource:
 *                 type: string
 *               requestReason:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evidence request created successfully
 */
router.post("/evidence-requests", qaController.requestEvidence);

/**
 * @swagger
 * /api/charts/{chartId}/qa-approve:
 *   post:
 *     summary: Finalize QA approval for a chart
 *     tags: [QA Rework]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chart fully QA approved
 */
router.post("/charts/:chartId/qa-approve", qaController.approveChart);

module.exports = router;
