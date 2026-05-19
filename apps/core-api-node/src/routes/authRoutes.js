const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

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
 *                     credentials:
 *                       type: string
 *                       example: MD
 *
 *                     email:
 *                       type: string
 *                       example: john@email.com
 *
 *                     phone:
 *                       type: string
 *                       example: 9876543210
 *
 *                     mobile_phone:
 *                       type: string
 *                       example: 9999999999
 *
 *                     department_id:
 *                       type: string
 *                       format: uuid
 *
 *                     job_title:
 *                       type: string
 *                       example: Operations Manager
 *
 *                     address_line_1:
 *                       type: string
 *                       example: 221B Baker Street
 *
 *                     address_line_2:
 *                       type: string
 *                       example: Building A
 *
 *                     country:
 *                       type: string
 *                       example: USA
 *
 *                     city:
 *                       type: string
 *                       example: New York
 *
 *                     state:
 *                       type: string
 *                       example: NY
 *
 *                     zip_code:
 *                       type: string
 *                       example: 10001
 *
 *                     location:
 *                       type: string
 *                       example: Headquarters
 *
 *                     bio:
 *                       type: string
 *                       example: Senior healthcare manager
 *
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *
 *                     user_role_id:
 *                       type: string
 *                       format: uuid
 *
 *                     role:
 *                       type: string
 *                       example: Operations/Program Manager
 *
 *                     system_role:
 *                       type: boolean
 *                       example: true
 *
 *                     shift:
 *                       type: string
 *                       example: Morning
 *
 *                     user_type:
 *                       type: string
 *                       example: Local
 *
 *                     send_email:
 *                       type: boolean
 *                       example: true
 *
 *                     two_fa_auth:
 *                       type: boolean
 *                       example: false
 *
 *                     user_status:
 *                       type: string
 *                       example: Active
 *
 *                     is_superuser:
 *                       type: boolean
 *                       example: false
 *
 *                     is_staff:
 *                       type: boolean
 *                       example: false
 *
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *
 *                     is_super_administrator:
 *                       type: boolean
 *                       example: false
 *
 *                     employee_id:
 *                       type: string
 *                       example: EMP001
 *
 *                     project_access:
 *                       type: array
 *
 *                       items:
 *                         type: string
 *                         format: uuid
 *
 *                     preferences:
 *                       type: object
 *                       example: {}
 *
 *                     certifications:
 *                       type: array
 *
 *                       items:
 *                         type: object
 *
 *                     notifications:
 *                       type: object
 *                       example: {}
 *
 *                     security:
 *                       type: object
 *                       example: {}
 *
 *                     last_password_changed:
 *                       type: string
 *                       format: date
 *
 *                     last_login:
 *                       type: string
 *                       format: date-time
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *
 *                     updated_at:
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
 *
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
 *
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword123
 *
 *     responses:
 *       200:
 *         description: Password set successfully
 *
 *       400:
 *         description: Invalid input or token expired/used
 *
 *       404:
 *         description: Token not found
 *
 *       500:
 *         description: Server error
 */
router.post("/set-password", authController.setPassword);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     description: Sends a password reset link to the user's email
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@email.com
 *
 *     responses:
 *       200:
 *         description: Success message
 *
 *       400:
 *         description: Invalid input
 *
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     description: Resets the password using a reset token
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 *       400:
 *         description: Invalid input or token expired
 *
 *       404:
 *         description: Token not found
 *
 *       500:
 *         description: Server error
 */
router.post("/reset-password", authController.resetPassword);

module.exports = router;