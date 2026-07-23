const express = require("express");
const router = express.Router();
const controller = require("../controllers/workQueue.controller");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Work Queue
 *   description: Work Queue Management and Stage Filtering APIs
 */

/**
 * @swagger
 * /api/work-queue:
 *   get:
 *     summary: Retrieve Work Queue list and dynamically aggregated stage counts
 *     tags: [Work Queue]
 *     description: Fetch detailed charts and patient information matching search, plan, project, or priority filters, optionally filtered by tabs/workflow stages. Returns full record schemas and real-time tab counts for the dashboard tabs.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tab
 *         schema:
 *           type: string
 *           enum: [all, my-work, not-started, assigned, in-progress, pending-qa, qa-returned, rework, completed, audit-sample, submission-ready]
 *           default: all
 *         description: Filters dataset by specified work queue tab
 *       - in: query
 *         name: measurementYear
 *         schema:
 *           type: string
 *           enum: [HEDIS MY2025, HEDIS MY2026]
 *         description: Filter by HEDIS Measurement Year (matches patients.measure column)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching patient first name, last name, MRN, Chart ID, or measure code (case-insensitive)
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter charts by Project UUID
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by Client UUID (used when user selects a client from the sidebar)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Filter charts by Payer/Health Plan (e.g. Medicare, Medicaid, Commercial)
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter charts by Priority (Urgent, High, Medium, Low)
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Work Queue and counts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 page_no:
 *                   type: integer
 *                 page_size:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *                 counts:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: integer
 *                     myWork:
 *                       type: integer
 *                     notStarted:
 *                       type: integer
 *                     assigned:
 *                       type: integer
 *                     inProgress:
 *                       type: integer
 *                     pendingQa:
 *                       type: integer
 *                     qaReturned:
 *                       type: integer
 *                     rework:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     auditSample:
 *                       type: integer
 *                     submissionReady:
 *                       type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       patient_uuid:
 *                         type: string
 *                         format: uuid
 *                       mrn:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       dob:
 *                         type: string
 *                         format: date
 *                       gender:
 *                         type: string
 *                       measure:
 *                         type: string
 *                       plan:
 *                         type: string
 *                       patient_priority:
 *                         type: string
 *                       stage:
 *                         type: string
 *                       patient_due_date:
 *                         type: string
 *                         format: date-time
 *                       assigned_to:
 *                         type: string
 *                         format: uuid
 *                       abstractor_id:
 *                         type: string
 *                         format: uuid
 *                       qa_id:
 *                         type: string
 *                         format: uuid
 *                       chart_uuid:
 *                         type: string
 *                         format: uuid
 *                       chart_id:
 *                         type: string
 *                       chart_status:
 *                         type: string
 *                       encounter_type:
 *                         type: string
 *                       specialty:
 *                         type: string
 *                       facility:
 *                         type: string
 *                       encounter_date:
 *                         type: string
 *                         format: date
 *                       admission_date:
 *                         type: string
 *                         format: date
 *                       discharge_date:
 *                         type: string
 *                         format: date
 *                       chart_priority:
 *                         type: string
 *                       chart_document:
 *                         type: object
 *                       coding_notes:
 *                         type: string
 *                       sla_deadline:
 *                         type: string
 *                         format: date-time
 *                       project_name:
 *                         type: string
 *                       project_display_id:
 *                         type: string
 *                       client_name:
 *                         type: string
 *                       client_display_id:
 *                         type: string
 *                       abstractor_name:
 *                         type: string
 *                       qa_name:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/", authMiddleware, controller.getWorkQueue);

module.exports = router;
