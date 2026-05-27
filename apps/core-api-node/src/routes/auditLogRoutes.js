const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLogController");

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         user_name:
 *           type: string
 *         event_type:
 *           type: string
 *         details:
 *           type: string
 *         ip_address:
 *           type: string
 *         device:
 *           type: string
 *         location:
 *           type: string
 *         risk_level:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         status:
 *           type: string
 *           enum: [Success, Failed, Warning]
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Retrieve audit logs for the current tenant
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: risk_level
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by risk level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Success, Failed, Warning]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user name or details
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
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
 *         description: A list of audit logs
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
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/", auditLogController.getAllAuditLogs);

/**
 * @swagger
 * /api/audit-logs/export:
 *   get:
 *     summary: Export audit logs as CSV
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *         description: Filter by event type
 *
 *       - in: query
 *         name: risk_level
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by risk level
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Success, Failed, Warning]
 *         description: Filter by status
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user name or details
 *
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date
 *
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date
 *
 *     responses:
 *       200:
 *         description: CSV file exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *
 *       500:
 *         description: Server error
 */
router.get("/export", auditLogController.exportAuditLogs);

module.exports = router;
