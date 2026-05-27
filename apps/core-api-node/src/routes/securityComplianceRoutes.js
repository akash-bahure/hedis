const express = require("express");
const router = express.Router();
const controller = require("../controllers/securityController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Security & Compliance
 *   description: Security and compliance policy management APIs
 */

/**
 * @swagger
 * /api/security-compliance/data-retention-policy:
 *   get:
 *     summary: Retrieve Data Retention Policy settings and available options
 *     tags: [Security & Compliance]
 *     description: Fetches current organization data retention durations for HIPAA PHI records, Audit Logs, Session Logs, Export Logs, and Backup Snapshots, along with available options for each field.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retention policy retrieved successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     phi_records:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     audit_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     session_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     export_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     backup_snapshots:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/data-retention-policy", authMiddleware, controller.getDataRetentionPolicy);

/**
 * @swagger
 * /api/security-compliance/data-retention-policy:
 *   put:
 *     summary: Update Data Retention Policy durations
 *     tags: [Security & Compliance]
 *     description: Updates the organization retention periods. Checks that submitted values are within their allowed option sets.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phi_records:
 *                 type: string
 *                 enum: ["6 years", "7 years", "10 years", "15 years"]
 *               audit_logs:
 *                 type: string
 *                 enum: ["3 years", "6 years", "10 years"]
 *               session_logs:
 *                 type: string
 *                 enum: ["90 days", "180 days", "1 year", "2 years"]
 *               export_logs:
 *                 type: string
 *                 enum: ["1 year", "2 years", "5 years"]
 *               backup_snapshots:
 *                 type: string
 *                 enum: ["30 days", "60 days", "90 days", "180 days"]
 *     responses:
 *       200:
 *         description: Retention policy updated successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     phi_records:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     audit_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     session_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     export_logs:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     backup_snapshots:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid selection values
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/data-retention-policy", authMiddleware, controller.updateDataRetentionPolicy);

/**
 * @swagger
 * /api/security-compliance/access-expiry-policy:
 *   get:
 *     summary: Retrieve Access Expiry & Auto-Deprovisioning Policy settings
 *     tags: [Security & Compliance]
 *     description: Fetches inactivity deactivation limits, force re-authentication intervals, auth token lifetimes, and client project access restrictions (evaluated dynamically).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access expiry settings fetched successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     inactivity_deactivation:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     force_reauthentication:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     auth_token_lifetime:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     project_restrictions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           project_name:
 *                             type: string
 *                           status:
 *                             type: string
 *                           end_date:
 *                             type: string
 *                             format: date
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/access-expiry-policy", authMiddleware, controller.getAccessExpiryPolicy);

/**
 * @swagger
 * /api/security-compliance/access-expiry-policy:
 *   put:
 *     summary: Update Access Expiry & Auto-Deprovisioning Policy configurations
 *     tags: [Security & Compliance]
 *     description: Updates inactivity limits, re-authentication periods, and auth token lifetimes.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inactivity_deactivation:
 *                 type: string
 *                 enum: ["30 days", "60 days", "90 days", "180 days"]
 *               force_reauthentication:
 *                 type: string
 *                 enum: ["7 days", "14 days", "30 days", "60 days"]
 *               auth_token_lifetime:
 *                 type: string
 *                 enum: ["1 hour", "8 hours", "24 hours", "48 hours"]
 *     responses:
 *       200:
 *         description: Access expiry settings updated successfully
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     inactivity_deactivation:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     force_reauthentication:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     auth_token_lifetime:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid selection values
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/access-expiry-policy", authMiddleware, controller.updateAccessExpiryPolicy);

module.exports = router;
