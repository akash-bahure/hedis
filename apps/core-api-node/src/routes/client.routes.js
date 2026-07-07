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
 *         description: Search by org_name, email, short_code, or client_id
 *         example: ABC
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