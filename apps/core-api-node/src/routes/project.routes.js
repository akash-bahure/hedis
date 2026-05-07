const express = require("express");
const router = express.Router();
const controller = require("../controllers/project.controller");

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_name
 *               - client_id
 *               - start_date
 *               - end_date
 *             properties:
 *               project_name:
 *                 type: string
 *                 example: "Medical Coding Project A"
 *               client_id:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               project_type:
 *                 type: string
 *                 example: "Outpatient"
 *               specialty:
 *                 type: string
 *                 example: "Multi-Specialty"
 *               priority:
 *                 type: string
 *                 enum: ["High", "Medium", "Low"]
 *               notes:
 *                 type: string
 *                 example: "Urgent"
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               project_manager_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", controller.createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     description: Retrieve projects with search, filters, and pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *         description: Filter by client
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
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       project_name:
 *                         type: string
 *                       client_id:
 *                         type: string
 *                       start_date:
 *                         type: string
 *                         format: date
 *                       end_date:
 *                         type: string
 *                         format: date
 */
router.get("/", controller.getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project data
 *       404:
 *         description: Project not found
 */
router.get("/:id", controller.getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Update project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project updated
 */
router.patch("/:id", controller.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.delete("/:id", controller.deleteProject);

/**
 * @swagger
 * /api/projects/access/all:
 *   get:
 *     summary: Get all project access levels for all users
 *     tags: [Projects]
 *     description: Returns a grid of users and their access levels for each project.
 *     responses:
 *       200:
 *         description: Project access grid fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   uid:
 *                     type: string
 *                   full_name:
 *                     type: string
 *                   role:
 *                     type: string
 *                   department:
 *                     type: string
 *                   project_access:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         project_id:
 *                           type: string
 *                         project_name:
 *                           type: string
 *                         access_level:
 *                           type: string
 *                           enum: [Full, Edit, View, None]
 */
router.get("/access/all", controller.getProjectAccessAll);

/**
 * @swagger
 * /api/projects/{id}/access:
 *   patch:
 *     summary: Update project access level for a user
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - access_level
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "34176070-7443-4eb7-b960-e4a45a515482"
 *               access_level:
 *                 type: string
 *                 enum: [Full, Edit, View, None]
 *     responses:
 *       200:
 *         description: Project access updated successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.patch("/:id/access", controller.updateProjectAccess);

module.exports = router;
