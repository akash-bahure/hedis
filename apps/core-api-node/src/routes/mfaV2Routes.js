// routes/mfaV2Routes.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/mfaV2Controller");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Security Dashboard
 *   description: Security dashboard policy and enforcement APIs
 */

/**
 * @swagger
 * /api/security-dashboard/mfa-v2:
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
 * /api/security-dashboard/mfa-v2:
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

module.exports = router;
