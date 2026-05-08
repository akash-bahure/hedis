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
 *                 enum: [North, South, East, West]
 *               plan_tier:
 *                 type: string
 *                 enum: [Basic, Professional, Enterprise]
 *               status:
 *                 type: string
 *                 enum: [Onboarding, Active, Inactive]
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
 *
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
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by org_name, email, or short_code
 *         example: ABC
 *
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           enum: [North, South, East, West]
 *         description: Filter by region
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Onboarding, Active, Inactive]
 *         description: Filter by status
 *
 *       - in: query
 *         name: contract_type
 *         schema:
 *           type: string
 *           enum: [HEDIS Hybrid, HEDIS Administrative, HEDIS Electronic, Multi-Measure]
 *         description: Filter by contract type
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *
 *     responses:
 *       200:
 *         description: Clients fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       org_name:
 *                         type: string
 *                       short_code:
 *                         type: string
 *                       region:
 *                         type: string
 *                       plan_tier:
 *                         type: string
 *                       status:
 *                         type: string
 *                       contract_type:
 *                         type: string
 *                       measure_year:
 *                         type: string
 *                       total_charts:
 *                         type: integer
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       due_date:
 *                         type: string
 *                         format: date
 *                       primary_contact_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       abstractors_assigned:
 *                         type: integer
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

module.exports = router;