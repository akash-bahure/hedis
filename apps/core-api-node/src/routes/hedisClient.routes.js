const express = require("express");
const hedisClientController = require("../controllers/hedisClient.controller");
const router = express.Router();

/**
 * @swagger
 * /api/hedis-clients/stats:
 *   get:
 *     summary: Get HEDIS client dashboard statistics
 *     description: Returns aggregate stats — Total Clients, Active Clients, Charts Assigned, Completion Rate, At Risk count
 *     tags: [HEDIS Clients]
 *     responses:
 *       200:
 *         description: Client stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client stats fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalClients:
 *                       type: integer
 *                       example: 5
 *                     activeClients:
 *                       type: integer
 *                       example: 3
 *                     chartsAssigned:
 *                       type: integer
 *                       example: 1000
 *                     completedCharts:
 *                       type: integer
 *                       example: 250
 *                     completionRate:
 *                       type: integer
 *                       example: 25
 *                     atRiskClients:
 *                       type: integer
 *                       example: 1
 *       500:
 *         description: Internal server error
 */
router.get("/stats", hedisClientController.getClientStats);

/**
 * @swagger
 * /api/hedis-clients/export:
 *   get:
 *     summary: Export full detailed profile report for a specific client as CSV
 *     description: >
 *       Exports comprehensive client profile including details, summary metrics, 
 *       measure progress breakdown, and recent activity.
 *     tags: [HEDIS Clients]
 *     parameters:
 *       - in: query
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the client (REQUIRED for full report)
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: clientId query parameter is required
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get("/export", hedisClientController.exportClientReport);

/**
 * @swagger
 * /api/hedis-clients/{clientId}/recent-activity:
 *   get:
 *     summary: Get recent activity timeline for a selected client
 *     description: Returns the latest workflow activities (chart upload, assignments, HEDIS evaluation, QA review, audit review, evidence updates, and stage changes) for all patient charts belonging to the selected client.
 *     tags: [HEDIS Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *     responses:
 *       200:
 *         description: Client recent activity fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       activityType:
 *                         type: string
 *                         example: QA Approved
 *                       title:
 *                         type: string
 *                         example: QA review completed
 *                       description:
 *                         type: string
 *                       patientId:
 *                         type: string
 *                         format: uuid
 *                       patientName:
 *                         type: string
 *                       chartId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       measureCode:
 *                         type: string
 *                         nullable: true
 *                       performedBy:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       iconType:
 *                         type: string
 *                         enum:
 *                           - chart
 *                           - assignment
 *                           - measure
 *                           - qa
 *                           - audit
 *                           - stage
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:clientId/recent-activity",
    hedisClientController.getClientRecentActivity
);

/**
 * @swagger
 * /api/hedis-clients/{id}:
 *   get:
 *     summary: Get a single HEDIS client profile with dynamic calculations
 *     tags: [HEDIS Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the client
 *     responses:
 *       200:
 *         description: Client fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", hedisClientController.getClientById);

/**
 * @swagger
 * /api/hedis-clients:
 *   get:
 *     summary: List all HEDIS clients with dynamic chart calculations, filtering, sorting, and pagination
 *     tags: [HEDIS Clients]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by organization name, client code, short code, or patient name/measure
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year
 *         example: HEDIS MY2025
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Onboarding, At Risk, Inactive]
 *         description: Filter by client status
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [West, South, Northeast, Southeast, Midwest, Mountain]
 *         description: Filter by region
 *       - in: query
 *         name: contract_type
 *         schema:
 *           type: string
 *           enum: [HEDIS Hybrid, HEDIS Administrative, HEDIS Electronic, Multi-Measure]
 *         description: Filter by contract type
 *       - in: query
 *         name: measure_year
 *         schema:
 *           type: string
 *           enum: [MY2024, MY2025, MY2026, MY2027]
 *         description: Filter by measurement year
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
 *         description: Results per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by (e.g. org_name, status, total_charts, completion_percentage)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Clients fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       client_id:
 *                         type: string
 *                         example: "CL-001"
 *                       org_name:
 *                         type: string
 *                       short_code:
 *                         type: string
 *                       region:
 *                         type: string
 *                       status:
 *                         type: string
 *                       contract_type:
 *                         type: string
 *                       measure_year:
 *                         type: string
 *                       plan_tier:
 *                         type: string
 *                       primary_contact:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       due_date:
 *                         type: string
 *                         format: date
 *                       total_charts:
 *                         type: integer
 *                       completed_charts:
 *                         type: integer
 *                       completion_percentage:
 *                         type: number
 *                       abstractors_assigned:
 *                         type: integer
 *                       qa_assigned_count:
 *                         type: integer
 *                       active_patient_count:
 *                         type: integer
 *                       last_updated:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/", hedisClientController.getClients);

/**
 * @swagger
 * /api/hedis-clients/{clientId}/measure-progress:
 *   get:
 *     summary: Get HEDIS measure progress summary for a selected client
 *     description: Returns aggregated measure progress metrics grouped by measure code for the client
 *     tags: [HEDIS Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the client
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
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Client measure progress fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measure_code:
 *                         type: string
 *                       measure_name:
 *                         type: string
 *                       assigned:
 *                         type: integer
 *                       done:
 *                         type: integer
 *                       progress:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [Completed, In Progress, Pending]
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get("/:clientId/measure-progress", hedisClientController.getClientMeasureProgress);

module.exports = router;

