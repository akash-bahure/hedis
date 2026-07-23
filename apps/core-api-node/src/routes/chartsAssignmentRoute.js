const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  bulkAssignCharts,
} = require("../controllers/chartsAssignmentController");

/**
 * @swagger
 * tags:
 *   name: Chart Assignments
 *   description: Bulk Chart Assignment APIs
 */

/**
 * @swagger
 * /api/chart-assignments/bulk-assign:
 *   post:
 *     summary: Bulk Assign Patients/Charts to Abstractor and/or QA
 *     tags: [Chart Assignments]
 *     description: Assign multiple patients to one or more abstractors/QA users. Consistent with single patient assignment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_ids
 *             properties:
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of patient UUIDs (preferred)
 *               chart_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Alternative for chart UUIDs (backward compatibility)
 *               abstractorId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of Chart Abstractor
 *               qaId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of Quality Analyst
 *               priority:
 *                 type: string
 *                 enum: [Urgent, High, Medium, Low]
 *               assignment_note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk assignment successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/bulk-assign", authMiddleware, bulkAssignCharts);

module.exports = router;
