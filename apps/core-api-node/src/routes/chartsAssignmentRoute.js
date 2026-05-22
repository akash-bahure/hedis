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
 *     summary: Bulk Assign Charts to QA & Chart Abstractor Users
 *     tags: [Chart Assignments]
 *     description: Assign multiple charts to multiple QA and Chart Abstractor users with priority and assignment notes.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - chart_ids
 *               - assigned_users
 *
 *             properties:
 *
 *               chart_ids:
 *                 type: array
 *                 description: Selected Chart IDs
 *                 items:
 *                   type: string
 *                   format: uuid
 *
 *               assigned_users:
 *                 type: array
 *
 *                 items:
 *                   type: object
 *
 *                   required:
 *                     - user_id
 *                     - assigned_role
 *
 *                   properties:
 *
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *
 *                     assigned_role:
 *                       type: string
 *                       enum:
 *                         - Chart Abstractor
 *                         - Quality Analyst
 *
 *               priority:
 *                 type: string
 *                 enum:
 *                   - Urgent
 *                   - High
 *                   - Medium
 *                   - Low
 *
 *               assignment_note:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Charts assigned successfully
 *
 *       400:
 *         description: Validation Error
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal Server Error
 */

router.post(
  "/bulk-assign",
  authMiddleware,
  bulkAssignCharts
);

module.exports = router;