const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const rbacMiddleware = require("../middlewares/rbacMiddleware");

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     description: Creates a new user with extensive profile information
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Priya Sharma
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@healthsys.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               department_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               job_title:
 *                 type: string
 *                 example: Senior Auditor
 *               shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General, Off]
 *                 example: Morning
 *               user_type:
 *                 type: string
 *                 enum: [Local, Azure]
 *                 example: Local
 *               address:
 *                 type: object
 *                 properties:
 *                   address_line_1:
 *                     type: string
 *                   address_line_2:
 *                     type: string
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *               bio:
 *                 type: string
 *               organization:
 *                 type: string
 *                 format: uuid
 *               user_role:
 *                 type: string
 *                 format: uuid
 *               send_email:
 *                 type: boolean
 *                 default: true
 *               two_fa_auth:
 *                 type: boolean
 *                 default: false
 *               project_access:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
router.post("/", userController.createUser);

// router.post("/", rbacMiddleware(["Admin"]), userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users with filtering and pagination
 *     tags: [Users]
 *     description: Returns a paginated list of users with nested role information
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by full name or email
 *       - in: query
 *         name: user_role
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user role ID
 *       - in: query
 *         name: user_status
 *         schema:
 *           type: string
 *           enum: [Pending, Active, Inactive, Suspended]
 *         description: Filter by user status
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 next:
 *                   type: string
 *                   nullable: true
 *                 previous:
 *                   type: string
 *                   nullable: true
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get("/", userController.getUsers);

/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Export users (CSV or PDF)
 *     tags: [Users]
 *     description: Export all users data in CSV or PDF format
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *         description: Export format (default csv)
 *     responses:
 *       200:
 *         description: File download
 *       500:
 *         description: Server error
 */
router.get("/export", userController.exportUsers);

/**
 * @swagger
 * /api/users/deactivate:
 *   post:
 *     summary: Deactivate multiple users
 *     tags: [Users]
 *     description: Sets the status of multiple users to 'Inactive' and disables their ability to log in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440011"]
 *     responses:
 *       200:
 *         description: Users deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deactivated_user_ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *       400:
 *         description: Invalid input or no user IDs provided
 *       500:
 *         description: Server error
 */
router.post("/deactivate", userController.deactivateUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     description: Returns aggregated stats of users
 *     responses:
 *       200:
 *         description: User stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_users:
 *                       type: integer
 *                     active_users:
 *                       type: integer
 *                     inactive_users:
 *                       type: integer
 *                     two_fa_enabled:
 *                       type: integer
 *                     sso_users:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get("/stats", userController.getUserStats);

/**
 * @swagger
 * /api/users/shifts:
 *   get:
 *     summary: Get user shift management matrix
 *     tags: [Users]
 *     description: Returns a paginated list of users with their weekly shift schedule matrix
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by full name or email
 *       - in: query
 *         name: shift
 *         schema:
 *           type: string
 *           enum: [Morning, Afternoon, Night, General, Off]
 *         description: Filter by default shift
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Week offset (0=current, -1=prev, 1=next)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *       - in: query
 *         name: full_name
 *         schema:
 *           type: string
 *         description: Filter by full name
 *       - in: query
 *         name: is_super_administrator
 *         schema:
 *           type: boolean
 *         description: Filter by super admin status
 *       - in: query
 *         name: job_title
 *         schema:
 *           type: string
 *         description: Filter by job title
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone
 *       - in: query
 *         name: user_role
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user role ID
 *       - in: query
 *         name: user_status
 *         schema:
 *           type: string
 *           enum: [Pending, Active, Inactive, Suspended]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: Paginated shift schedule matrix
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 week:
 *                   type: string
 *                   example: "Week of May 18 - 24, 2026"
 *                 week_offset:
 *                   type: integer
 *                 dates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       day: { type: string }
 *                       day_num: { type: string }
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ShiftScheduleMatrix'
 *                 count:
 *                   type: integer
 *                 next:
 *                   type: string
 *                   nullable: true
 *                 previous:
 *                   type: string
 *                   nullable: true
 *       500:
 *         description: Server error
 */
router.get("/shifts", userController.getUserShifts);

/**
 * @swagger
 * /api/users/shifts:
 *   patch:
 *     summary: Bulk update user shifts
 *     tags: [Users]
 *     description: Updates individual shifts for multiple users and dates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   format: uuid
 *                   example: 985d105f-c8a4-4fa6-9c91-1e7902424f38
 *                 schedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2026-05-05"
 *                       shift:
 *                         type: string
 *                         enum: [Morning, Afternoon, Night, General, Off]
 *                         example: "General"
 *     responses:
 *       200:
 *         description: User shifts updated successfully
 *       400:
 *         description: Invalid payload or format
 *       500:
 *         description: Server error
 */
router.patch("/shifts", userController.updateUserShifts);

/**
 * @swagger
 * /api/users/shifts/stats:
 *   get:
 *     summary: Get shift statistics
 *     tags: [Users]
 *     description: Returns the count of users for each shift type along with their predefined times
 *     responses:
 *       200:
 *         description: Array of shift statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   shift:
 *                     type: string
 *                   time:
 *                     type: string
 *                   count:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get("/shifts/stats", userController.getShiftStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     ShiftScheduleMatrix:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         full_name:
 *           type: string
 *         initials:
 *           type: string
 *         role:
 *           type: string
 *         default_shift:
 *           type: string
 *         schedule:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date: { type: string }
 *               day: { type: string }
 *               shift: { type: string }
 */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update an existing user
 *     tags: [Users]
 *     description: Updates any field of an existing user profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               department_id:
 *                 type: string
 *                 format: uuid
 *               job_title:
 *                 type: string
 *               shift:
 *                 type: string
 *                 enum: [Morning, Afternoon, Night, General, Off]
 *               user_type:
 *                 type: string
 *                 enum: [Local, Azure]
 *               user_status:
 *                 type: string
 *                 enum: [Pending, Active, Inactive, Suspended]
 *               address:
 *                 type: object
 *                 properties:
 *                   address_line_1:
 *                     type: string
 *                   address_line_2:
 *                     type: string
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *               bio:
 *                 type: string
 *               organization:
 *                 type: string
 *                 format: uuid
 *               user_role:
 *                 type: string
 *                 format: uuid
 *               send_email:
 *                 type: boolean
 *               two_fa_auth:
 *                 type: boolean
 *               project_access:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or user already exists
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", userController.updateUser);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         full_name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         department_id:
 *           type: string
 *           format: uuid
 *         department_name:
 *           type: string
 *         job_title:
 *           type: string
 *         shift:
 *           type: string
 *         user_type:
 *           type: string
 *         user_status:
 *           type: string
 *         is_active:
 *           type: boolean
 *         is_superuser:
 *           type: boolean
 *         is_staff:
 *           type: boolean
 *         last_login:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         user_role:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             active:
 *               type: boolean
 *             system_role:
 *               type: boolean
 *             users:
 *               type: integer
 *             permissions_count:
 *               type: integer
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     description: Deletes a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", userController.deleteUser);

module.exports = router;
