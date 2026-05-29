const express = require("express");
const router = express.Router();
const securityalertsController = require("../controllers/securityalertsController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Security Alerts
 *   description: Security alerts management and monitoring
 */

/**
 * @swagger
 * /api/security-alerts:
 *   get:
 *     summary: Get all security alerts
 *     tags: [Security Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Critical, High, Medium, Low]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Investigating, Resolved]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved alerts
 */
router.get("/", authMiddleware, securityalertsController.getAlerts);

/**
 * @swagger
 * /api/security-alerts/stats:
 *   get:
 *     summary: Get alert stats
 *     tags: [Security Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved stats
 */
router.get("/stats", authMiddleware, securityalertsController.getAlertStats);

/**
 * @swagger
 * /api/security-alerts/{id}/status:
 *   patch:
 *     summary: Update alert status
 *     tags: [Security Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Investigating, Resolved]
 *               investigation_details:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", authMiddleware, securityalertsController.updateAlertStatus);

/**
 * @swagger
 * /api/security-alerts/export:
 *   get:
 *     summary: Export security alerts CSV
 *     tags: [Security Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV exported successfully
 */

router.get("/export", authMiddleware, securityalertsController.exportAlerts);

/**
 * @swagger
 * /api/security-alerts/block-user:
 *   post:
 *     summary: Block a user
 *     tags: [Security Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User blocked
 */
router.post("/block-user", authMiddleware, securityalertsController.blockUser);

module.exports = router;
