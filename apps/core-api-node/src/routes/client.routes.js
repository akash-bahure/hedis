const express = require("express");
const router = express.Router();

const controller = require("../controllers/client.controller");

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Client APIs (Organization + Contract + Contact)
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - org_name
 *               - short_code
 *               - region
 *               - contract_type
 *               - measure_year
 *               - total_charts
 *               - start_date
 *               - due_date
 *               - primary_contact_name
 *               - email
 *             properties:
 *               org_name:
 *                 type: string
 *                 example: ABC Healthcare
 *               short_code:
 *                 type: string
 *                 example: ABC001
 *               region:
 *                 type: string
 *                 enum: [West, South, Northeast, Southeast, Mountain, Midwest, Southwest]
 *               plan_tier:
 *                 type: string
 *                 enum: [Basic, Professional, Enterprise]
 *               status:
 *                 type: string
 *                 enum: [Onboarding, Active, Inactive, At Risk]
 *
 *               contract_type:
 *                 type: string
 *                 enum: [HEDIS Hybrid, HEDIS Administrative, HEDIS Electronic, Multi-Measure]
 *               measure_year:
 *                 type: string
 *                 enum: [MY2024, MY2025, MY2026, MY2027]
 *               total_charts:
 *                 type: integer
 *                 example: 100
 *               start_date:
 *                 type: string
 *                 format: date
 *               due_date:
 *                 type: string
 *                 format: date
 *               primary_contact_name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@email.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               abstractors_assigned:
 *                 type: integer
 *                 example: 5
 *
 *     responses:
 *       201:
 *         description: Client created successfully
 *       500:
 *         description: Server error
 */
router.post("/", controller.createClient);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients with filters & pagination
 *     tags: [Clients]
 *     description: Retrieve clients with search, filters, and pagination
 *
 *     parameters:
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by org_name, email, short_code, client_id, or corresponding patient name/measure
 *         example: ABC
 *
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year
 *         example: HEDIS MY2025
 *
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum:
 *             - South
 *             - West
 *             - Northeast
 *             - Southeast
 *             - Mountain
 *             - Midwest
 *             - Southwest
 *         description: Filter by region
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - Onboarding
 *             - Active
 *             - Inactive
 *             - At Risk
 *         description: Filter by status
 *
 *       - in: query
 *         name: contract_type
 *         schema:
 *           type: string
 *           enum:
 *             - HEDIS Hybrid
 *             - HEDIS Administrative
 *             - HEDIS Electronic
 *             - Multi-Measure
 *         description: Filter by contract type
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *
 *     responses:
 *
 *       200:
 *         description: Clients fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *
 *                 message:
 *                   type: string
 *                   example: Clients fetched successfully
 *
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *
 *                 totalCount:
 *                   type: integer
 *                   example: 100
 *
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *
 *                 data:
 *                   type: array
 *
 *                   items:
 *                     type: object
 *
 *                     properties:
 *
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *
 *                       client_id:
 *                         type: string
 *                         example: CL-001
 *
 *                       org_name:
 *                         type: string
 *                         example: ABC Healthcare
 *
 *                       short_code:
 *                         type: string
 *                         example: ABC001
 *
 *                       region:
 *                         type: string
 *                         example: West
 *
 *                       plan_tier:
 *                         type: string
 *                         example: Professional
 *
 *                       status:
 *                         type: string
 *                         example: Active
 *
 *                       contract_type:
 *                         type: string
 *                         example: HEDIS Hybrid
 *
 *                       measure_year:
 *                         type: string
 *                         example: MY2025
 *
 *                       total_charts:
 *                         type: integer
 *                         example: 1000
 *
 *                       completed_charts:
 *                         type: integer
 *                         example: 750
 *
 *                       start_date:
 *                         type: string
 *                         format: date
 *                         example: 2026-05-01
 *
 *                       due_date:
 *                         type: string
 *                         format: date
 *                         example: 2026-12-31
 *
 *                       primary_contact_name:
 *                         type: string
 *                         example: John Doe
 *
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *
 *                       phone:
 *                         type: string
 *                         example: 9876543210
 *
 *                       abstractors_assigned:
 *                         type: integer
 *                         example: 5
 *
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *
 *       500:
 *         description: Internal server error
 */
router.get("/", controller.getClients);

/**
 * @swagger
 * /api/clients/export-reports:
 *   get:
 *     summary: Export full detailed profile report for a specific client as CSV
 *     description: >
 *       Exports comprehensive client profile including details, summary metrics,
 *       measure progress breakdown, and recent activity.
 *     tags: [Clients]
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
router.get("/export-reports", controller.exportClientReport);

/**
 * @swagger
 * /api/clients/{clientId}/recent-activity:
 *   get:
 *     summary: Get recent activity timeline for a selected client
 *     description: Returns the latest workflow activities (chart upload, assignments, HEDIS evaluation, QA review, audit review, evidence updates, and stage changes) for all patient charts belonging to the selected client.
 *     tags: [Clients]
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
router.get("/:clientId/recent-activity", controller.getClientRecentActivity);

/**
 * @swagger
 * /api/clients/stats:
 *   get:
 *     summary: Get client dashboard stats
 *     tags: [Clients]
 *     description: Returns overall client statistics for dashboard cards
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_clients:
 *                   type: integer
 *                   example: 6
 *                 active_clients:
 *                   type: integer
 *                   example: 3
 *                 charts_assigned:
 *                   type: integer
 *                   example: 10280
 *                 completed_charts:
 *                   type: integer
 *                   example: 6898
 *                 completion_rate:
 *                   type: integer
 *                   example: 67
 *                   description: Completion percentage
 *                 at_risk:
 *                   type: integer
 *                   example: 1
 */
router.get("/stats", controller.getClientStats);

/**
 * @swagger
 * /api/clients/export:
 *   get:
 *     summary: Export all clients to CSV or PDF
 *     tags: [Clients]
 *     description: Export all clients data as CSV or PDF
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *           default: csv
 *         description: Format of the exported file
 *     responses:
 *       200:
 *         description: A CSV or PDF file containing all clients data
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export", controller.exportClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client data
 *       404:
 *         description: Client not found
 */
router.get("/:id", controller.getClientById);

/**
 * @swagger
 * /api/clients/{clientId}/measure-progress:
 *   get:
 *     summary: Get HEDIS measure progress summary for a selected client
 *     description: Returns aggregated measure progress metrics grouped by measure code for the client
 *     tags: [Clients]
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
router.get("/:clientId/measure-progress", controller.getClientMeasureProgress);

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     summary: Update client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client updated
 */
router.patch("/:id", controller.updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Delete client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted
 */
router.delete("/:id", controller.deleteClient);

const dashboardController = require("../controllers/clientDashboard.controller");

/**
 * @swagger
 * /api/clients/v2:
 *   post:
 *     summary: Create client (V2)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_name
 *               - contact_email
 *             properties:
 *               client_name:
 *                 type: string
 *                 example: "Blue Cross Health Plan"
 *               plan_type:
 *                 type: string
 *                 example: "Medicare"
 *               contract_id:
 *                 type: string
 *                 example: "H1234"
 *               program_year:
 *                 type: string
 *                 example: "MY2026"
 *               contact_name:
 *                 type: string
 *                 example: "Jane Smith"
 *               contact_email:
 *                 type: string
 *                 example: "jane.smith@healthplan.com"
 *     responses:
 *       201:
 *         description: Client created successfully
 */
router.post("/v2", dashboardController.createClientV2);

/**
 * @swagger
 * /api/clients/v2:
 *   get:
 *     summary: Get clients list (V2)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       org_name:
 *                         type: string
 *                         description: "Client Name"
 *                       contract_type:
 *                         type: string
 *                         description: "Plan Type (e.g. Health Plan)"
 *                       status:
 *                         type: string
 *                         description: "Active or Onboarding"
 *                       primary_contact_name:
 *                         type: string
 *                         description: "Contact Person"
 *                       total_patients_enrolled:
 *                         type: integer
 *                         description: "Total Members Count"
 *                       total_charts:
 *                         type: integer
 *                         description: "Total Charts Assigned"
 *                       active_charts:
 *                         type: integer
 *                         description: "Charts currently being worked on"
 *                       completed_charts:
 *                         type: integer
 *                         description: "Charts marked as Done"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total_count:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     current_page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get("/v2", dashboardController.getClientsV2);

/**
 * @swagger
 * /api/clients/v2/stats:
 *   get:
 *     summary: Get clients stats (V2)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_active:
 *                       type: integer
 *                       description: "Total Active Clients"
 *                     total_onboarding:
 *                       type: integer
 *                       description: "Total Onboarding Clients"
 *                     total_cases:
 *                       type: integer
 *                       description: "Total Active Charts/Cases across all clients"
 */
router.get("/v2/stats", dashboardController.getClientStatsV2);

/**
 * @swagger
 * /api/clients/v2/{id}:
 *   get:
 *     summary: Get client by ID (V2)
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 */
router.get("/v2/:id", dashboardController.getClientByIdV2);

module.exports = router;
