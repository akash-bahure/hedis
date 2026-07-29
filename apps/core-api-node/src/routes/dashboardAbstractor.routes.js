const express = require("express");
const controller = require("../controllers/dashboardAbstractor.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Abstractor Dashboard
 *   description: Chart Abstractor Dashboard KPI Stats, Velocity, and AI Pre-Analysis APIs
 */

/**
 * @swagger
 * /api/dashboard/abstractor/stats:
 *   get:
 *     summary: Get Chart Abstractor Dashboard KPI Statistics
 *     description: |
 *       Returns the 4 KPI cards for the authenticated chart abstractor:
 *       My Queue, Completed Today, QA Pending, and My Accuracy.
 *     tags: [Abstractor Dashboard]
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
 *         description: Optional search filter on patient name or measure
 *     responses:
 *       200:
 *         description: Abstractor stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     myQueue:
 *                       type: object
 *                     completedToday:
 *                       type: object
 *                     qaPending:
 *                       type: object
 *                     myAccuracy:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", (req, res) => controller.getAbstractorStats(req, res));

/**
 * @swagger
 * /api/dashboard/abstractor/velocity:
 *   get:
 *     summary: Get My Abstraction Velocity for the current week
 *     description: |
 *       Returns daily Charts Done vs AI-Assisted counts for the current week
 *       (Monday to today), scoped to the authenticated abstractor.
 *     tags: [Abstractor Dashboard]
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
 *         description: Abstraction velocity data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: string
 *                         example: "Mon"
 *                       date:
 *                         type: string
 *                         example: "2026-07-21"
 *                       chartsDone:
 *                         type: integer
 *                       aiAssisted:
 *                         type: integer
 *                       isToday:
 *                         type: boolean
 */
router.get("/velocity", (req, res) =>
  controller.getAbstractionVelocity(req, res)
);

/**
 * @swagger
 * /api/dashboard/abstractor/ai-findings:
 *   get:
 *     summary: Get AI Pre-Analysis high-confidence clinical findings
 *     description: |
 *       Returns the top AI-detected clinical findings for charts assigned to
 *       the authenticated abstractor, ordered by confidence descending.
 *     tags: [Abstractor Dashboard]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Maximum number of findings to return
 *     responses:
 *       200:
 *         description: AI pre-analysis findings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     findings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "CDC · MBR-789456"
 *                           memberId:
 *                             type: string
 *                           measureCode:
 *                             type: string
 *                           confidencePct:
 *                             type: integer
 *                             example: 96
 *                           confidenceLabel:
 *                             type: string
 *                             example: "96% conf."
 *                           findingSummary:
 *                             type: string
 *                     total:
 *                       type: integer
 */
router.get("/ai-findings", (req, res) => controller.getAIPreAnalysis(req, res));

/**
 * @swagger
 * /api/dashboard/abstractor/user-queue:
 *   get:
 *     summary: Get flat user patient queue
 *     description: |
 *       Returns a paginated flat list of patients assigned to the authenticated user
 *       (as assigned_to, abstractor_id or qa_id). One row per patient.
 *       Includes abstractorName, priority and submittedAt.
 *     tags: [Abstractor Dashboard]
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

module.exports = router;
