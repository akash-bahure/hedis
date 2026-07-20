const express = require("express");
const controller = require("../controllers/dashboardAnalytics.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard Analytics
 *   description: Dashboard Analytics and Chart Reporting APIs
 */

/**
 * @swagger
 * /api/dashboard/abstraction-velocity:
 *   get:
 *     summary: Retrieve Abstraction Velocity metrics for chart reporting
 *     description: Returns volume metrics showing total patient charts uploaded versus AI-assisted extractions mapped chronologically by date for a duration of 7, 14, or 30 days. Includes a daily target abstraction value.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           enum: [7, 14, 30]
 *           default: 14
 *         description: Number of trailing productivity days to retrieve
 *     responses:
 *       200:
 *         description: Trailing abstraction velocity retrieved successfully.
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
 *                   example: Abstraction velocity data retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2026-07-06"
 *                       totalCharts:
 *                         type: integer
 *                         example: 5
 *                       aiAssisted:
 *                         type: integer
 *                         example: 3
 *                       target:
 *                         type: integer
 *                         example: 40
 *       400:
 *         description: Bad request. Invalid duration value.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/abstraction-velocity", controller.getAbstractionVelocity);

/**
 * @swagger
 * /api/dashboard/queue-by-domain:
 *   get:
 *     summary: Retrieve measure queue counts grouped by HEDIS domain
 *     description: Returns counts and percentage distribution of all active measures (evaluations) grouped into standard HEDIS domains (Preventive, Diabetes, Cardiovascular, Mental Health, Respiratory, Child Health, Other).
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on patient first name, last name, or measure
 *     responses:
 *       200:
 *         description: Domain queue distribution retrieved successfully.
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
 *                   example: Queue by domain distribution retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       domain:
 *                         type: string
 *                         example: "Cardiovascular"
 *                       count:
 *                         type: integer
 *                         example: 12
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         example: 32.4
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/queue-by-domain", controller.getQueueByDomain);

/**
 * @swagger
 * /api/dashboard/measure-rates:
 *   get:
 *     summary: Retrieve HEDIS measure performance statistics
 *     description: >
 *       Returns performance statistics for each HEDIS measure in the system.
 *       Current rate is calculated as numerator / denominator from hedis_evaluations.
 *       Target rate is optional and configurable via environment variables (DASHBOARD_TARGET_RATE_<CODE> or DASHBOARD_TARGET_RATE).
 *       Year-over-year (YOY) compares the current calendar year rate against the prior year.
 *       Benchmark status compares current rate to target rate.
 *       Supports pagination via page_no and page_size.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on patient first name, last name, or measure
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of measure rows per page
 *     responses:
 *       200:
 *         description: HEDIS measure rates retrieved successfully.
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
 *                   example: HEDIS measure rates retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measureCode:
 *                         type: string
 *                         example: "CBP"
 *                       measureName:
 *                         type: string
 *                         example: "Controlling High Blood Pressure"
 *                       domain:
 *                         type: string
 *                         example: "Cardiovascular"
 *                       currentRate:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         example: 72.4
 *                       targetRate:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         example: 76
 *                       yoy:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         example: 1.8
 *                       benchmarkStatus:
 *                         type: string
 *                         nullable: true
 *                         enum: ["Above", "Below", "At Target", null]
 *                         example: "Below"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad request. Invalid pagination parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/measure-rates", controller.getMeasureRates);

/**
 * @swagger
 * /api/dashboard/queue-by-measure:
 *   get:
 *     summary: Retrieve abstraction queue workload grouped by HEDIS measure
 *     description: >
 *       Returns the current abstraction workload broken down per measure code.
 *       Open = patient in Unassigned / Not Started / Assigned stage.
 *       In Progress = patient in In Progress / Rework / Pending QA / QA Returned stages.
 *       Completed = patient in Completed / QA Approved / QA Passed / Submission Ready stages,
 *       or hedis_evaluations.status is Compliant or Complete.
 *       Also returns a summary block with overall totals across all measures.
 *       Supports pagination via page_no and page_size.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on patient first name, last name, or measure
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of measure rows per page
 *     responses:
 *       200:
 *         description: Queue by measure retrieved successfully.
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
 *                   example: Queue by measure retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measureCode:
 *                         type: string
 *                         example: "CDC"
 *                       completionPercentage:
 *                         type: integer
 *                         example: 74
 *                       open:
 *                         type: integer
 *                         example: 84
 *                       inProgress:
 *                         type: integer
 *                         example: 23
 *                       completed:
 *                         type: integer
 *                         example: 312
 *                 summary:
 *                   type: object
 *                   properties:
 *                     completionPercentage:
 *                       type: integer
 *                       example: 74
 *                     totalOpen:
 *                       type: integer
 *                       example: 529
 *                     totalInProgress:
 *                       type: integer
 *                       example: 137
 *                     totalCompleted:
 *                       type: integer
 *                       example: 1873
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 12
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request. Invalid pagination parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/queue-by-measure", controller.getQueueByMeasure);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Retrieve dashboard summary statistics cards
 *     description: >
 *       Returns counts and compliance rates for the dashboard metrics cards:
 *       Open Queue, Completed Today, Overall HEDIS Rate, AI Assist Rate, and SLA Compliance.
 *       Includes calculated trend margins comparing against previous periods/averages.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on patient first name, last name, or measure
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully.
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
 *                   example: Dashboard statistics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     openQueue:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           example: 529
 *                         trend:
 *                           type: string
 *                           nullable: true
 *                           example: "+12 today"
 *                         trendType:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                           example: "up"
 *                     completedToday:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                           example: 52
 *                         trend:
 *                           type: string
 *                           nullable: true
 *                           example: "+30% vs avg"
 *                         trendType:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                           example: "up"
 *                     overallHedisRate:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                           example: 70.2
 *                         trend:
 *                           type: string
 *                           nullable: true
 *                           example: "+1.4% vs MY2025"
 *                         trendType:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                           example: "up"
 *                     aiAssistRate:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                           example: 87.3
 *                         trend:
 *                           type: string
 *                           nullable: true
 *                           example: "+3.1% this wk"
 *                         trendType:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                           example: "up"
 *                     slaCompliance:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                           example: 91.2
 *                         trend:
 *                           type: string
 *                           nullable: true
 *                           example: "-0.8% this wk"
 *                         trendType:
 *                           type: string
 *                           enum: [up, down, neutral]
 *                           example: "down"
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/stats", controller.getDashboardStats);

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
router.get("/summary", controller.getSummary);

/**
 * @swagger
 * /api/dashboard/deadlines:
 *   get:
 *     summary: Get upcoming abstraction SLAs grouped by HEDIS measures
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search on patient first name, last name, or measure
 *     responses:
 *       200:
 *         description: Upcoming abstraction deadlines retrieved successfully
 */
router.get("/deadlines", controller.getUpcomingDeadlines);

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
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year
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
router.get("/my-queue", controller.getMyQueue);
console.log("getSummary", controller.getSummary);
console.log("getUpcomingDeadlines", controller.getUpcomingDeadlines);
console.log("getMyQueue", controller.getMyQueue);

module.exports = router;

