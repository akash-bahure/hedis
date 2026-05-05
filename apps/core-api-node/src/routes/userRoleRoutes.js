const express = require("express");
const router = express.Router();
const userRoleController = require("../controllers/userRoleController");

/**
 * @swagger
 * /api/user-roles:
 *   post:
 *     summary: Create a new user role with permissions
 *     tags: [User Roles]
 *     description: Creates a new user role and its associated module permissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin
 *                 minLength: 1
 *                 maxLength: 150
 *               description:
 *                 type: string
 *                 example: System Administrator with full access
 *               level:
 *                 type: integer
 *                 example: 1
 *               active:
 *                 type: boolean
 *                 example: true            
 *               role_permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - module
 *                   properties:
 *                     module:
 *                       type: string
 *                       enum: [Dashboard, Projects, Patients & Charts, Work Queue, Coding, Auditing, Exceptions, Reports, Analytics, Users & Roles, Security & Compliance, AI Optimization, Settings]
 *                       example: Dashboard
 *                     can_view:
 *                       type: boolean
 *                       example: true
 *                     can_edit:
 *                       type: boolean
 *                       example: false
 *                     can_assign:
 *                       type: boolean
 *                       example: false
 *                     can_approve:
 *                       type: boolean
 *                       example: false
 *                     can_reject:
 *                       type: boolean
 *                       example: false
 *                     can_export:
 *                       type: boolean
 *                       example: true
 *                     can_override:
 *                       type: boolean
 *                       example: false
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", userRoleController.createUserRole);

/**
 * @swagger
 * /api/user-roles:
 *   get:
 *     summary: List all user roles
 *     tags: [User Roles]
 *     description: Returns a list of all user roles with counts
 *     responses:
 *       200:
 *         description: List of roles
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       active:
 *                         type: boolean
 *                       level:
 *                         type: integer
 *                       permissions_count:
 *                         type: integer
 *       500:
 *         description: Server error
 */
router.get("/", userRoleController.getUserRoles);

/**
 * @swagger
 * /api/user-roles/{id}:
 *   patch:
 *     summary: Update a user role
 *     tags: [User Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               level:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               role_permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - module
 *                   properties:
 *                     module:
 *                       type: string
 *                     can_view:
 *                       type: boolean
 *                     can_edit:
 *                       type: boolean
 *                     can_assign:
 *                       type: boolean
 *                     can_approve:
 *                       type: boolean
 *                     can_reject:
 *                       type: boolean
 *                     can_export:
 *                       type: boolean
 *                     can_override:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", userRoleController.updateUserRole);

/**
 * @swagger
 * /api/user-roles/{id}:
 *   get:
 *     summary: Get user role by ID
 *     tags: [User Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user role ID
 *     responses:
 *       200:
 *         description: User role details with grouped permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 level:
 *                   type: integer
 *                 active:
 *                   type: boolean
 *                 users_count:
 *                   type: integer
 *                 permissions_count:
 *                   type: integer
 *                 permissions_all:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       group:
 *                         type: string
 *                       modules:
 *                         type: array
 *                         items:
 *                           type: object
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get("/:id", userRoleController.getUserRoleById);

module.exports = router;
