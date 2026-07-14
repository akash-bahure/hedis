const express = require("express");
const router = express.Router();
const hedisReportController = require("../controllers/hedisReport.controller");

/**
 * @swagger
 * /api/hedis-reports/measure-performance:
 *   get:
 *     summary: Retrieve HEDIS Measure Performance Report
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns paginated and filtered HEDIS measure performance metrics, rates, and benchmark comparison from evaluations.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records to return per page
 *       - in: query
 *         name: measureCode
 *         schema:
 *           type: string
 *         description: Optional HEDIS measure code filter (e.g. BCS, CBP, etc.)
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: Measure performance report retrieved successfully
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           measureCode:
 *                             type: string
 *                           measureName:
 *                             type: string
 *                           numerator:
 *                             type: integer
 *                           denominator:
 *                             type: integer
 *                           exclusion:
 *                             type: integer
 *                           measureRate:
 *                             type: number
 *                           benchmark:
 *                             type: number
 *                           belowBenchmark:
 *                             type: boolean
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/measure-performance",
  hedisReportController.getMeasurePerformanceReport
);

/**
 * @swagger
 * /api/hedis-reports/submission-readiness:
 *   get:
 *     summary: Retrieve HEDIS Submission Readiness Report
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns paginated and filtered submission readiness metrics for each HEDIS measure based on QA completed evaluations.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records to return per page.
 *       - in: query
 *         name: measureCode
 *         schema:
 *           type: string
 *           example: COL
 *         description: Optional HEDIS measure code filter (e.g. COL, BCS, CBP, HBA1C, CIS).
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: Submission Readiness report retrieved successfully.
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           measureCode:
 *                             type: string
 *                             example: COL
 *                           measureName:
 *                             type: string
 *                             example: Colorectal Cancer Screening
 *                           totalEvaluations:
 *                             type: integer
 *                             example: 210
 *                           readyCount:
 *                             type: integer
 *                             example: 138
 *                           readiness:
 *                             type: number
 *                             format: float
 *                             example: 65.7
 *                           target:
 *                             type: number
 *                             example: 80
 *                           difference:
 *                             type: number
 *                             example: -14.3
 *                           aboveTarget:
 *                             type: boolean
 *                             example: false
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       400:
 *         description: Invalid query parameters.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/submission-readiness",
  hedisReportController.getSubmissionReadinessReport
);

/**
 * @swagger
 * /api/hedis-reports/submission-readiness/export:
 *   get:
 *     summary: Export Submission Readiness Report
 *     tags: [Hedis Reports & Analytics]
 *     description: Exports the Submission Readiness report as a CSV file.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measureCode
 *         schema:
 *           type: string
 *           example: COL
 *         description: Optional measure code filter.
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/submission-readiness/export",
  hedisReportController.exportSubmissionReadinessReport
);

/**
 * @swagger
 * /api/hedis-reports/gap-closure-trend:
 *   get:
 *     summary: Retrieve HEDIS Gap Closure Trend Report
 *     tags: [Hedis Reports & Analytics]
 *     description: >
 *       Returns the Open vs Closed gap trend over the last 7 months (monthly view)
 *       or last 4 weeks (weekly view), plus summary cards for the current month:
 *       total open gaps, total closed gaps, and the gap rate delta vs the previous month.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 *         description: Trend granularity — 'monthly' for last 7 months, 'weekly' for last 4 weeks.
 *       - in: query
 *         name: measureCode
 *         schema:
 *           type: string
 *           example: CBP
 *         description: Optional HEDIS measure code filter.
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: Gap Closure Trend report retrieved successfully.
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         openGaps:
 *                           type: integer
 *                           example: 287
 *                           description: Open gap count in the current month.
 *                         closedGaps:
 *                           type: integer
 *                           example: 446
 *                           description: Closed gap count in the current month.
 *                         gapRateDelta:
 *                           type: number
 *                           example: -2.1
 *                           description: Change in gap rate vs the previous month (negative = improving).
 *                     trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: Jan
 *                             description: Month label (monthly) or week start date label (weekly).
 *                           openGaps:
 *                             type: integer
 *                             example: 450
 *                           closedGaps:
 *                             type: integer
 *                             example: 280
 *       400:
 *         description: Invalid query parameter 'view'.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/gap-closure-trend", hedisReportController.getGapClosureTrend);

/**
 * @swagger
 * /api/hedis-reports/dashboard-stats:
 *   get:
 *     summary: Retrieve HEDIS Dashboard KPI Statistics
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns the 5 key dashboard metrics with their values and deltas for comparison.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                     overallGapRate:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           example: 42.3
 *                         delta:
 *                           type: number
 *                           example: -2.1
 *                     numeratorCompliance:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           example: 67.8
 *                         delta:
 *                           type: number
 *                           example: 3.4
 *                     chartsCompleted:
 *                       type: object
 *                       properties:
 *                         completed:
 *                           type: integer
 *                           example: 1847
 *                         total:
 *                           type: integer
 *                           example: 2234
 *                         percentage:
 *                           type: number
 *                           example: 82.7
 *                     qaDisagreementRate:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           example: 6.2
 *                         delta:
 *                           type: number
 *                           example: -0.8
 *                     submissionReadiness:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           example: 74.1
 *                         delta:
 *                           type: number
 *                           example: 5.2
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/dashboard-stats", hedisReportController.getDashboardStatistics);

/**
 * @swagger
 * /api/hedis-reports/abstractor-productivity:
 *   get:
 *     summary: Retrieve Abstractor Productivity Report
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns productivity metrics per Chart Abstractor including assigned, completed, avg completion time, QA fail percentage, and at-risk flag. Includes chart data and summary table.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *     responses:
 *       200:
 *         description: Abstractor productivity report retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAbstractors:
 *                           type: integer
 *                           example: 5
 *                         totalAssigned:
 *                           type: integer
 *                           example: 120
 *                         totalCompleted:
 *                           type: integer
 *                           example: 95
 *                         atRiskCount:
 *                           type: integer
 *                           example: 1
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: Smith
 *                           completed:
 *                             type: integer
 *                             example: 32
 *                     tableData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           abstractorId:
 *                             type: string
 *                             format: uuid
 *                           abstractorName:
 *                             type: string
 *                             example: Sarah Johnson
 *                           assigned:
 *                             type: integer
 *                             example: 30
 *                           completed:
 *                             type: integer
 *                             example: 28
 *                           completedPercentage:
 *                             type: integer
 *                             example: 93
 *                           avgTime:
 *                             type: string
 *                             example: "12.5 min"
 *                           qaFailPercentage:
 *                             type: number
 *                             example: 3.2
 *                           atRisk:
 *                             type: boolean
 *                             example: false
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/abstractor-productivity",
  hedisReportController.getAbstractorProductivity
);

/**
 * @swagger
 * /api/hedis-reports/export:
 *   get:
 *     summary: Export HEDIS Reports Dashboard
 *     tags: [Hedis Reports & Analytics]
 *     description: Exports the complete filtered HEDIS Reports dashboard (KPI Stats, Measure Performance, Submission Readiness, Gap Closure Trend, Abstractor Productivity) in CSV, PDF, or XLSX format.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, pdf, xlsx]
 *         description: Output format for the export (csv, pdf, or xlsx)
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *         description: Optional HEDIS measurement year filter (e.g. HEDIS MY2026)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Optional plan filter (e.g. Medicare, Medicaid, Commercial)
 *       - in: query
 *         name: measureCode
 *         schema:
 *           type: string
 *         description: Optional measure code filter (e.g. BCS, CBP)
 *     responses:
 *       200:
 *         description: Dashboard report exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request (missing or invalid format parameter).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/export", hedisReportController.exportDashboardReport);

/**
 * @swagger
 * /api/hedis-reports/qa-outcomes:
 *   get:
 *     summary: Retrieve QA Outcomes Report
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns QA pass rate, status breakdown, and discrepancy type analysis.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema: { type: string }
 *       - in: query
 *         name: plan
 *         schema: { type: string }
 *       - in: query
 *         name: measureCode
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: QA Outcomes retrieved successfully
 */
router.get("/qa-outcomes", hedisReportController.getQAOutcomesReport);

/**
 * @swagger
 * /api/hedis-reports/plan-level-performance:
 *   get:
 *     summary: Retrieve Plan-Level Performance
 *     tags: [Hedis Reports & Analytics]
 *     description: Returns performance metrics grouped by Plan (Medicare, Medicaid, Commercial)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema: { type: string }
 *       - in: query
 *         name: measureCode
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan level performance retrieved successfully
 */
router.get(
  "/plan-level-performance",
  hedisReportController.getPlanLevelPerformance
);

module.exports = router;
