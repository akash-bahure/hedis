const express = require("express");
const controller = require("../controllers/dashboardQA.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: QA Dashboard
 *   description: QA Dashboard KPI Stats, Weekly Throughput, and Discrepancy Analytics APIs
 */

/**
 * @swagger
 * /api/dashboard/qa/stats:
 *   get:
 *     summary: Get QA Dashboard KPI Statistics
 *     description: Returns KPI card metrics for QA Analysts including Pending QA Review, Reviewed Today, Returned to Coder, and Approval Rate.
 *     tags: [QA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. MY2025)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search filter for patient name or measure
 *     responses:
 *       200:
 *         description: QA Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     pendingQAReview:
 *                       type: object
 *                     reviewedToday:
 *                       type: object
 *                     returnedToCoder:
 *                       type: object
 *                     approvalRate:
 *                       type: object
 */
router.get("/stats", (req, res) => controller.getQAStats(req, res));
router.get("/qa/stats", (req, res) => controller.getQAStats(req, res));
router.get("/qa-stats", (req, res) => controller.getQAStats(req, res));

/**
 * @swagger
 * /api/dashboard/qa/throughput:
 *   get:
 *     summary: Get QA Review Throughput Chart Data
 *     description: Returns daily QA review and return counts grouped by day for the current week.
 *     tags: [QA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search filter
 *     responses:
 *       200:
 *         description: QA review throughput data retrieved successfully
 */
router.get("/throughput", (req, res) => controller.getQAThroughput(req, res));
router.get("/qa/throughput", (req, res) =>
  controller.getQAThroughput(req, res)
);
router.get("/qa-throughput", (req, res) =>
  controller.getQAThroughput(req, res)
);

/**
 * @swagger
 * /api/dashboard/qa/discrepancy-types:
 *   get:
 *     summary: Get QA Discrepancy Types Breakdown
 *     description: Returns monthly breakdown of QA discrepancy types, percentages, total count, and top discrepancy issue.
 *     tags: [QA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search filter
 *     responses:
 *       200:
 *         description: QA discrepancy types retrieved successfully
 */
router.get("/discrepancy-types", (req, res) =>
  controller.getQADiscrepancyTypes(req, res)
);
router.get("/qa/discrepancy-types", (req, res) =>
  controller.getQADiscrepancyTypes(req, res)
);
router.get("/qa-discrepancies", (req, res) =>
  controller.getQADiscrepancyTypes(req, res)
);

/**
 * @swagger
 * /api/dashboard/qa/user-queue:
 *   get:
 *     summary: Get flat user patient queue
 *     description: |
 *       Returns a paginated flat list of patients assigned to the authenticated user
 *       (as assigned_to, abstractor_id or qa_id). One row per patient.
 *       Includes abstractorName, priority and submittedAt.
 *     tags: [QA Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page size (1–100)
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search on patient name or measure
 *     responses:
 *       200:
 *         description: User queue retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 */
router.get("/user-queue", (req, res) => controller.getUserQueue(req, res));
router.get("/qa/user-queue", (req, res) => controller.getUserQueue(req, res));
router.get("/qa-user-queue", (req, res) => controller.getUserQueue(req, res));

module.exports = router;
