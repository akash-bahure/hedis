const express = require("express");
const recentActivityController = require("../controllers/recentActivity.controller");
const router = express.Router();

/**
 * @swagger
 * /api/recent-activity:
 *   get:
 *     summary: Fetch chronological recent activities for the logged-in abstractor
 *     description: Returns paginated recent activity logs derived dynamically from database tables representing patient charts, assignments, QA reviews, evaluations, and timeline event changes.
 *     tags: [Recent Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activity records per page
 *     responses:
 *       200:
 *         description: Recent activities fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Recent activities fetched successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "9ea8082d-72a2-b281-0081-8b9cad0e1f20-uploaded"
 *                       activityType:
 *                         type: string
 *                         example: "Measure Assigned"
 *                       description:
 *                         type: string
 *                         example: "BCS measure assigned for patient John Doe."
 *                       measureCode:
 *                         type: string
 *                         example: "BCS"
 *                         nullable: true
 *                       patientId:
 *                         type: string
 *                         format: uuid
 *                         example: "9ea8082d-72a2-b281-0081-8b9cad0e1f20"
 *                       patientName:
 *                         type: string
 *                         example: "John Doe"
 *                       performedBy:
 *                         type: string
 *                         example: "System"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-05T10:15:00Z"
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 1
 *                     current_page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
router.get("/", recentActivityController.getRecentActivities);

module.exports = router;
