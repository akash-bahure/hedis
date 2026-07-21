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
 * /api/dashboard/abstraction-deadlines:
 *   get:
 *     summary: Retrieve upcoming abstraction deadlines grouped by HEDIS measure
 *     description: >
 *       Returns open (incomplete) HEDIS measure gaps grouped by measure code.
 *       Only measures with at least one open patient-evaluation are included.
 *       For each measure provides: total open charts, total completed charts,
 *       nearest SLA due date among open patients, remaining calendar days to that
 *       date (negative values indicate overdue), and overall completion percentage.
 *       Ordered by nearest due date ascending so the most urgent measures appear first.
 *       Supports pagination and the same global filters used by all dashboard APIs.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure column)
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
 *         description: Upcoming abstraction deadlines retrieved successfully.
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
 *                   example: Upcoming abstraction deadlines retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measureCode:
 *                         type: string
 *                         example: "COL"
 *                       measureName:
 *                         type: string
 *                         example: "Colorectal Cancer Screening"
 *                       totalOpen:
 *                         type: integer
 *                         description: Number of patient-evaluations where stage/status is still open
 *                         example: 61
 *                       totalDone:
 *                         type: integer
 *                         description: Number of patient-evaluations where stage/status is completed
 *                         example: 42
 *                       nearestDueDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         description: ISO date of the earliest due_date among open patients for this measure
 *                         example: "2026-02-28"
 *                       remainingDays:
 *                         type: integer
 *                         nullable: true
 *                         description: Calendar days from today to nearestDueDate (negative = overdue)
 *                         example: 4
 *                       completionPercentage:
 *                         type: integer
 *                         description: Percentage of charts completed out of total (open + done)
 *                         example: 41
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 8
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request. Invalid pagination parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/abstraction-deadlines", controller.getAbstractionDeadlines);

/**
 * @swagger
 * /api/dashboard/my-queue:
 *   get:
 *     summary: Retrieve the authenticated user's assigned patient queue
 *     description: >
 *       Returns all patient-evaluation rows assigned to the currently authenticated
 *       user (matched via patients.assigned_to or patients.abstractor_id).
 *       The "measure" field returns the full HEDIS year string stored in the
 *       patients.measure column (e.g. "HEDIS MY2025"), not the measure code.
 *       The "measureCode" field returns the individual HEDIS measure code (e.g. "CDC").
 *       chartStatus is derived from the patient stage and the latest QA decision:
 *         Not Started → stage is Unassigned / Not Started / Assigned;
 *         In Progress → stage is In Progress, Rework, Pending QA, QA Returned, etc.;
 *         QA Pending  → stage is completed but latest qa_status is REQUEST_REVISION;
 *         Completed   → stage is Completed / QA Approved / QA Passed / Submission Ready.
 *       progress is 100 for completed eval status or QA_PASS, otherwise derived from stage.
 *       Sorted by due_date ascending (most urgent first), then by priority and last name.
 *       Supports pagination and the same global filters used by all dashboard APIs.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure column)
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
 *         description: Number of patient queue rows per page
 *     responses:
 *       200:
 *         description: My queue retrieved successfully.
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
 *                   example: My queue retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       patientId:
 *                         type: string
 *                         format: uuid
 *                         description: Internal patient UUID
 *                         example: "d2f3e4a1-0001-4b2c-9a1f-abcdef123456"
 *                       memberId:
 *                         type: string
 *                         description: External member/patient display ID (patients.patient_id)
 *                         example: "MBR-789456"
 *                       firstName:
 *                         type: string
 *                         example: "Jennifer"
 *                       lastName:
 *                         type: string
 *                         example: "Anderson"
 *                       measure:
 *                         type: string
 *                         nullable: true
 *                         description: Full HEDIS year string stored in patients.measure (e.g. HEDIS MY2025)
 *                         example: "HEDIS MY2025"
 *                       measureCode:
 *                         type: string
 *                         description: HEDIS measure code from hedis_evaluations
 *                         example: "CDC"
 *                       measureName:
 *                         type: string
 *                         description: Full HEDIS measure name
 *                         example: "Comprehensive Diabetes Care"
 *                       chartStatus:
 *                         type: string
 *                         enum: ["Not Started", "In Progress", "QA Pending", "Completed"]
 *                         description: Derived UI badge status from patient stage and QA decision
 *                         example: "In Progress"
 *                       stage:
 *                         type: string
 *                         description: Raw patient stage value from the patients table
 *                         example: "In Progress"
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2026-02-28"
 *                       priority:
 *                         type: string
 *                         nullable: true
 *                         example: "High"
 *                       progress:
 *                         type: integer
 *                         description: Completion percentage (0–100) derived from stage or eval status
 *                         example: 70
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request. Invalid pagination parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/my-queue", controller.getMyQueue);

/**
 * @swagger
 * /api/dashboard/user-queue:
 *   get:
 *     summary: Retrieve the authenticated user's flat patient queue
 *     description: >
 *       Returns a flat list of patients assigned to the currently authenticated user.
 *       One row per patient — NOT expanded per HEDIS measure or evaluation.
 *       The "measure" field returns the full HEDIS year string from patients.measure
 *       (e.g. "HEDIS MY2025"), directly from the patient record.
 *       No measureCode or measureName fields are included.
 *       chartStatus is derived from patients.stage and the most-recent QA decision:
 *         Not Started  → stage is Unassigned / Not Started / Assigned;
 *         In Progress  → stage is In Progress, Rework, Pending QA, QA Returned, etc.;
 *         QA Pending   → completed stage but latest qa_status is REQUEST_REVISION;
 *         Completed    → stage is Completed / QA Approved / QA Passed / Submission Ready.
 *       progress (0–100) is derived from stage or 100 if QA_PASS.
 *       Matches patients where assigned_to, abstractor_id, or qa_id = current user.
 *       Sorted by due_date ascending (most urgent first), then priority, then last name.
 *     tags: [Dashboard Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure column)
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
 *         description: Number of patient rows per page
 *     responses:
 *       200:
 *         description: User queue retrieved successfully.
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
 *                   example: User queue retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       patientId:
 *                         type: string
 *                         format: uuid
 *                         description: Internal patient UUID
 *                         example: "d2f3e4a1-0001-4b2c-9a1f-abcdef123456"
 *                       memberId:
 *                         type: string
 *                         description: External member display ID (patients.patient_id)
 *                         example: "MBR-789456"
 *                       firstName:
 *                         type: string
 *                         example: "Jennifer"
 *                       lastName:
 *                         type: string
 *                         example: "Anderson"
 *                       measure:
 *                         type: string
 *                         nullable: true
 *                         description: Full HEDIS year string from patients.measure (e.g. HEDIS MY2025)
 *                         example: "HEDIS MY2025"
 *                       stage:
 *                         type: string
 *                         description: Raw patient stage from the patients table
 *                         example: "In Progress"
 *                       chartStatus:
 *                         type: string
 *                         enum: ["Not Started", "In Progress", "QA Pending", "Completed"]
 *                         description: Derived UI badge status
 *                         example: "In Progress"
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2026-02-28"
 *                       priority:
 *                         type: string
 *                         nullable: true
 *                         example: "High"
 *                       progress:
 *                         type: integer
 *                         description: Completion percentage (0–100) from stage or QA status
 *                         example: 40
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request. Invalid pagination parameters.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Internal server error.
 */
router.get("/user-queue", controller.getUserQueue);

module.exports = router;
