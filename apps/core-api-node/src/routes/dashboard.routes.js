const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get top-level dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 */
router.get("/summary", dashboardController.getSummary);

/**
 * @swagger
 * /api/dashboard/deadlines:
 *   get:
 *     summary: Get upcoming abstraction SLAs grouped by HEDIS measures
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming abstraction deadlines retrieved successfully
 */
router.get("/deadlines", dashboardController.getUpcomingDeadlines);

/**
 * @swagger
 * /api/dashboard/my-queue:
 *   get:
 *     summary: Get assigned patients and charts for the logged-in user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, MRN, or measure code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by workflow stage
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Sort field (e.g. due_date, priority)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: My queue retrieved successfully
 */
router.get("/my-queue", dashboardController.getMyQueue);

module.exports = router;
