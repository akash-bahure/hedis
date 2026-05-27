const express = require("express");
const router = express.Router();
const securityDashboardController = require("../controllers/SecurityDashboardController");
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

module.exports = router;
