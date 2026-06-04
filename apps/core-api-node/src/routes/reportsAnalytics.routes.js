const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportsAnalytics.controller");

/**
 * @swagger
 * tags:
 *   name: Reports & Analytics
 *   description: Reports and analytics data for productivity and performance
 */

/**
 * @swagger
 * /api/reports-analytics/abstractor-productivity:
 *   get:
 *     summary: Retrieve Abstractor Productivity metrics for the dashboard
 *     tags: [Reports & Analytics]
 *     description: Returns a list of abstractors with their assigned charts, completed charts, average completion time, and QA fail percentage.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measure_year
 *         schema:
 *           type: string
 *           default: MY2026
 *         description: Filter metrics by Measure Year (e.g., MY2026)
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter metrics by Project UUID
 *     responses:
 *       200:
 *         description: Abstractor productivity metrics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       abstractor_id:
 *                         type: string
 *                         format: uuid
 *                       abstractor_name:
 *                         type: string
 *                       assigned:
 *                         type: integer
 *                       completed:
 *                         type: integer
 *                       completed_percentage:
 *                         type: integer
 *                       avg_time:
 *                         type: string
 *                       qa_fail_percentage:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/abstractor-productivity", controller.getAbstractorProductivity);

module.exports = router;
