// routes/sessionManagementV2Routes.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionManagementV2Controller");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Security Dashboard
 *   description: Security dashboard policy and enforcement APIs
 */

/**
 * @swagger
 * /api/security-dashboard/session-management-v2:
 *   get:
 *     summary: Retrieve Session Management (v2) settings
 *     tags: [Security Dashboard]
 *     description: Returns current session timeout and max concurrent session settings with defined enums.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session management settings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_timeout:
 *                       type: string
 *                       enum: ["30min", "15min", "1hr", "2hr"]
 *                     max_concurrent_sessions:
 *                       type: string
 *                       enum: ["1 session", "2 sessions", "5 sessions"]
 *                     idle_session_logout:
 *                       type: boolean
 *                     session_ip_binding:
 *                       type: boolean
 *                     remember_me:
 *                       type: boolean
 */
router.get("/session-management-v2", authMiddleware, controller.getSessionManagement);

/**
 * @swagger
 * /api/security-dashboard/session-management-v2:
 *   put:
 *     summary: Update Session Management (v2) settings
 *     tags: [Security Dashboard]
 *     description: Updates session timeout and max concurrent sessions. Validates against allowed enum values.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_timeout:
 *                 type: string
 *                 enum: ["30min", "15min", "1hr", "2hr"]
 *               max_concurrent_sessions:
 *                 type: string
 *                 enum: ["1 session", "2 sessions", "5 sessions"]
 *               idle_session_logout:
 *                 type: boolean
 *               session_ip_binding:
 *                 type: boolean
 *               remember_me:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Session management settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.put("/session-management-v2", authMiddleware, controller.updateSessionManagement);

module.exports = router;
