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
 *                 example: "Apollo HCC Audit FY26"
 *
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *
 *               project_type:
 *                 type: string
 *                 enum:
 *                   - Inpatient
 *                   - Outpatient
 *                   - ED Visit
 *                   - HCC
 *                 example: "HCC"
 *
 *               specialty:
 *                 type: string
 *                 enum:
 *                   - Multi-Speciality
 *                   - Cardiology
 *                   - Orthopedics
 *                   - Emergency Med.
 *                   - Radiology
 *                   - Oncology
 *                   - Cardiothoracic
 *                   - Pediatrics
 *                 example: "Cardiology"
 *
 *               priority:
 *                 type: string
 *                 enum:
 *                   - High
 *                   - Medium
 *                   - Low
 *                 example: "High"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - Active
 *                   - Completed
 *                   - At Risk
 *                   - On Hold
 *                   - Draft
 *                 example: "Draft"
 *
 *               total_charts:
 *                 type: integer
 *                 example: 1200
 *
 *               completed_charts:
 *                 type: integer
 *                 example: 300
 *
 *               notes:
 *                 type: string
 *                 example: "Priority project for Q2 delivery"
 *
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-01"
 *
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-31"
 *
 *               project_manager_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "34176070-7443-4eb7-b960-e4a45a515482"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *
 *                     project_name:
 *                       type: string
 *
 *                     project_type:
 *                       type: string
 *
 *                     specialty:
 *                       type: string
 *
 *                     priority:
 *                       type: string
 *
 *                     status:
 *                       type: string
 *
 *                     total_charts:
 *                       type: integer
 *
 *                     completed_charts:
 *                       type: integer
 *
 *                     pending_charts:
 *                       type: integer
 *
 *                     start_date:
 *                       type: string
 *                       format: date
 *
 *                     end_date:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", controller.createProject);

/**
 * @swagger
 * /api/projects/stats:
 *   get:
 *     summary: Get Project Statistics for Dashboard
 *     tags: [Projects]
 *     description: Returns aggregate statistics including total projects, status breakdown, chart metrics, and overall completion rate.
 *     responses:
 *       200:
 *         description: Project stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project stats fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalProjects:
 *                       type: integer
 *                       example: 12
 *                     activeProjects:
 *                       type: integer
 *                       example: 8
 *                     atRiskProjects:
 *                       type: integer
 *                       example: 2
 *                     completedProjects:
 *                       type: integer
 *                       example: 2
 *                     totalCharts:
 *                       type: integer
 *                       example: 15420
 *                     completedCharts:
 *                       type: integer
 *                       example: 8730
 *                     inProgressCharts:
 *                       type: integer
 *                       example: 4520
 *                     pendingCharts:
 *                       type: integer
 *                       example: 2170
 *                     overallCompletionRate:
 *                       type: number
 *                       format: float
 *                       example: 56.61
 *       500:
 *         description: Server error
 */
router.get("/stats", controller.getProjectStats);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     description: Retrieve projects with filters, search, charts progress, client details, and pagination
 *
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name or client name
 *
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by client UUID
 *
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum:
 *             - High
 *             - Medium
 *             - Low
 *         description: Filter by project priority
 *
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year
 *         example: HEDIS MY2025
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - Active
 *             - Completed
 *             - At Risk
 *             - On Hold
 *             - Draft
 *         description: Filter by project status
 *
 *       - in: query
 *         name: project_type
 *         schema:
 *           type: string
 *           enum:
 *             - Inpatient
 *             - Outpatient
 *             - ED Visit
 *             - HCC
 *         description: Filter by project type
 *
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *           enum:
 *             - Multi-Speciality
 *             - Cardiology
 *             - Orthopedics
 *             - Emergency Med.
 *             - Radiology
 *             - Oncology
 *             - Cardiothoracic
 *             - Pediatrics
 *         description: Filter by specialty
 *
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page number
 *
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Projects fetched successfully"
 *
 *                 total:
 *                   type: integer
 *                   example: 50
 *
 *                 page_no:
 *                   type: integer
 *                   example: 1
 *
 *                 page_size:
 *                   type: integer
 *                   example: 10
 *
 *                 total_pages:
 *                   type: integer
 *                   example: 5
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *
 *                       project_id:
 *                         type: string
 *                         example: "PR-001"
 *
 *                       project_name:
 *                         type: string
 *                         example: "Apollo HCC Audit FY26"
 *
 *                       project_type:
 *                         type: string
 *                         example: "HCC"
 *
 *                       specialty:
 *                         type: string
 *                         example: "Cardiology"
 *
 *                       priority:
 *                         type: string
 *                         example: "High"
 *
 *                       status:
 *                         type: string
 *                         example: "Active"
 *
 *                       notes:
 *                         type: string
 *
 *                       start_date:
 *                         type: string
 *                         format: date
 *
 *                       end_date:
 *                         type: string
 *                         format: date
 *
 *                       total_charts:
 *                         type: integer
 *                         example: 1200
 *
 *                       completed_charts:
 *                         type: integer
 *                         example: 760
 *
 *                       pending_charts:
 *                         type: integer
 *                         example: 440
 *
 *                       completion_percentage:
 *                         type: integer
 *                         example: 63
 *
 *                       client_uuid:
 *                         type: string
 *                         format: uuid
 *
 *                       client_id:
 *                         type: string
 *                         example: "CL-1001"
 *
 *                       org_name:
 *                         type: string
 *                         example: "Apollo Hospitals"
 *
 *                       short_code:
 *                         type: string
 *                         example: "APH"
 *
 *                       region:
 *                         type: string
 *                         example: "South"
 *
 *                       contract_type:
 *                         type: string
 *                         example: "HEDIS Hybrid"
 *
 *                       client_status:
 *                         type: string
 *                         example: "Active"
 *
 *                       project_manager_uuid:
 *                         type: string
 *                         format: uuid
 *
 *                       project_manager_name:
 *                         type: string
 *                         example: "Rahul Sharma"
 *
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *
 *       500:
 *         description: Internal server error
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
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by department ID
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
