const express = require("express");
const router = express.Router();
const securityDashboardController = require("../controllers/SecurityDashboardController");
const controller = require("../controllers/mfaV2Controller");
const smController = require("../controllers/sessionManagementV2Controller");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Security Dashboard
 *   description: Security and compliance management
 */

/**
 * @swagger
 * /api/security/password-policy:
 *   get:
 *     summary: Get current password policy
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved password policy
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
 *                     id:
 *                       type: string
 *                     min_length:
 *                       type: integer
 *                     expiry_days:
 *                       type: integer
 *                     history_count:
 *                       type: integer
 *                     require_uppercase:
 *                       type: boolean
 *                     require_lowercase:
 *                       type: boolean
 *                     require_numbers:
 *                       type: boolean
 *                     require_symbols:
 *                       type: boolean
 *                     max_failed_attempts:
 *                       type: integer
 */
router.get("/password-policy", authMiddleware, securityDashboardController.getPasswordPolicy);

/**
 * @swagger
 * /api/security/password-policy:
 *   put:
 *     summary: Update password policy
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               min_length:
 *                 type: integer
 *               expiry_days:
 *                 type: integer
 *               history_count:
 *                 type: integer
 *               require_uppercase:
 *                 type: boolean
 *               require_lowercase:
 *                 type: boolean
 *               require_numbers:
 *                 type: boolean
 *               require_symbols:
 *                 type: boolean
 *               max_failed_attempts:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated password policy
 *       500:
 *         description: Server error
 */
router.put("/password-policy", authMiddleware, securityDashboardController.updatePasswordPolicy);

/**
 * @swagger
 * /api/security/login-activity:
 *   get:
 *     summary: Get login activity for the last 24 hours
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved login activity
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
 *                     hourly:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: string
 *                           successful:
 *                             type: integer
 *                           failed:
 *                             type: integer
 *                     totals:
 *                       type: object
 *                       properties:
 *                         successful:
 *                           type: integer
 *                         failed:
 *                           type: integer
 */
router.get("/login-activity", authMiddleware, securityDashboardController.getLoginActivity);

/**
 * @swagger
 * /api/security/stats:
 *   get:
 *     summary: Get security dashboard stats (cards)
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved security stats
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
 *                     securityScore:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                         label:
 *                           type: string
 *                         posture:
 *                           type: string
 *                         trend:
 *                           type: string
 *                     activeSessions:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         label:
 *                           type: string
 *                         footer:
 *                           type: string
 *                     phiEvents:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         label:
 *                           type: string
 *                         footer:
 *                           type: string
 *                     failedLogins:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: integer
 *                         label:
 *                           type: string
 *                         criticalCount:
 *                           type: integer
 *                         footer:
 *                           type: string
 */
router.get("/stats", authMiddleware, securityDashboardController.getSecurityStats);

/**
 * @swagger
 * /api/security/allowed-ips:
 *   get:
 *     summary: Get all allowed IPs (CIDR ranges)
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved allowed IPs
 */
router.get("/allowed-ips", authMiddleware, securityDashboardController.getAllowedIps);

/**
 * @swagger
 * /api/security/allowed-ips:
 *   post:
 *     summary: Add a new allowed IP
 *     tags: [Security Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cidr:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: IP range added
 */
router.post("/allowed-ips", authMiddleware, securityDashboardController.addAllowedIp);

/**
 * @swagger
 * /api/security/allowed-ips/{id}:
 *   delete:
 *     summary: Delete an allowed IP
 *     tags: [Security Dashboard]
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
 *         description: IP range deleted
 */
router.delete("/allowed-ips/:id", authMiddleware, securityDashboardController.deleteAllowedIp);

/**
 * @swagger
 * /api/security/mfa-v2:
 *   get:
 *     summary: Retrieve MFA (v2) settings
 *     tags: [Security Dashboard]
 *     description: Returns current MFA configuration including grace period with defined enums.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA settings fetched successfully
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
 *                     grace_period:
 *                       type: string
 *                       enum: ["none", "6h", "12h", "24hr", "48hr"]
 *                     require_2fa:
 *                       type: boolean
 *                     totp_authenticator:
 *                       type: boolean
 *                     sms_otp:
 *                       type: boolean
 *                     email_otp:
 *                       type: boolean
 *                     new_device_verify:
 *                       type: boolean
 */
router.get("/mfa-v2", authMiddleware, controller.getMfa);

/**
 * @swagger
 * /api/security/mfa-v2:
 *   put:
 *     summary: Update MFA (v2) settings
 *     tags: [Security Dashboard]
 *     description: Updates MFA configuration. Validates grace_period against allowed enum values.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grace_period:
 *                 type: string
 *                 enum: ["none", "6h", "12h", "24hr", "48hr"]
 *               require_2fa:
 *                 type: boolean
 *               totp_authenticator:
 *                 type: boolean
 *               sms_otp:
 *                 type: boolean
 *               email_otp:
 *                 type: boolean
 *               new_device_verify:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: MFA settings updated successfully
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
router.put("/mfa-v2", authMiddleware, controller.updateMfa);

/**
 * @swagger
 * /api/security/session-management-v2:
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
router.get("/session-management-v2", authMiddleware, smController.getSessionManagement);

/**
 * @swagger
 * /api/security/session-management-v2:
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
router.put("/session-management-v2", authMiddleware, smController.updateSessionManagement);

module.exports = router;
