const express = require("express");
const router = express.Router();

const adminAuthController = require("../controllers/adminAuthController");

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Super admin login
 *     tags: [Super Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", adminAuthController.login);

module.exports = router;
