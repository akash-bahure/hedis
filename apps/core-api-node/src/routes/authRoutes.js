const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - role
 *
 *             properties:
 *
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *
 *               role:
 *                 type: string
 *
 *                 enum:
 *                   - Operations/Program Manager
 *                   - Chart Abstractor
 *                   - Quality Analyst
 *
 *                 example: Operations/Program Manager
 *
 *     responses:
 *
 *       201:
 *         description: User registered successfully
 * *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *
 *                 user:
 *                   type: object
 *
 *                   properties:
 *
 *                     id:
 *                       type: string
 *                       format: uuid
 *
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *
 *                     email:
 *                       type: string
 *                       example: john@email.com
 *
 *                     role:
 *                       type: string
 *                       example: Operations/Program Manager
 *
 *                     user_status:
 *                       type: string
 *                       example: Active
 *
 *                     is_active:
 *                       type: boolean
 *                       example: true
 */
router.post("/register", authController.register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Authenticate user and return JWT token
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - email
 *               - password
 *
 *             properties:
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *
 *     responses:
 *
 *       200:
 *         description: Login successful
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *
 *                 message:
 *                   type: string
 *                   example: Login successful
 *
 *                 token:
 *                   type: string
 *                   example: jwt_token_here
 *
 *                 user:
 *                   type: object
 *
 *                   properties:
 *
 *                     id:
 *                       type: string
 *                       format: uuid
 *
 *                     full_name:
 *                       type: string
 *                       example: John Doe
 *
 *                     email:
 *                       type: string
 *                       example: john@email.com
 *
 *                     role:
 *                       type: string
 *
 *                       enum:
 *                         - Operations/Program Manager
 *                         - Chart Abstractor
 *                         - Quality Analyst
 *
 *                       example: Operations/Program Manager
 *
 *                     user_status:
 *                       type: string
 *                       example: Active
 *
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *
 *       400:
 *         description: Invalid credentials
 *
 *       403:
 *         description: User account is inactive
 *
 *       500:
 *         description: Server error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/set-password:
 *   post:
 *     summary: Set password for invited user
 *     tags: [Auth]
 *     description: Sets the password for a user using an invite token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The invite token sent via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password set successfully
 *       400:
 *         description: Invalid input or token expired/used
 *       404:
 *         description: Token not found
 *       500:
 *         description: Server error
 */
router.post("/set-password", authController.setPassword);

module.exports = router;
