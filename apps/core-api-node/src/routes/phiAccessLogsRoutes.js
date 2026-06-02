// routes/phiAccessLogsRoutes.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/phiAccessLogsController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Access Monitor
 *   description: PHI Access monitoring and audit trail APIs
 */

/**
 * @swagger
 * /api/access-logs/access-monitor:
 *   get:
 *     summary: Retrieve PHI Access Logs and Access Monitor Stats
 *     tags: [Access Monitor]
 *     description: Returns current active sessions, charts accessed, average duration, and anomalies stats, along with filtered list of PHI access logs.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user, chart ID, or patient name
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project name (e.g., 'Apollo Inpatient', 'Max Healthcare', 'all')
 *       - in: query
 *         name: accessType
 *         schema:
 *           type: string
 *           enum: [all, code, audit, view, export, edit]
 *         description: Filter by access type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: PHI access logs and stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeSessions:
 *                       type: integer
 *                     chartsAccessed24h:
 *                       type: integer
 *                     avgAccessDuration:
 *                       type: string
 *                     anomaliesDetected:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       chartId:
 *                         type: string
 *                       patient:
 *                         type: string
 *                       user:
 *                         type: string
 *                       role:
 *                         type: string
 *                       accessType:
 *                         type: string
 *                       ts:
 *                         type: string
 *                       duration:
 *                         type: string
 *                       ip:
 *                         type: string
 *                       project:
 *                         type: string
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
 */
router.get("/access-monitor", authMiddleware, controller.getPhiAccessLogs);

module.exports = router;
