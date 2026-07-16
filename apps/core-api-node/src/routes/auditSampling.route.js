const express = require("express");
const auditSamplingController = require("../controllers/auditSampling.controller");

const router = express.Router();

/**
 * @swagger
 * /api/audit/audit-stage:
 *   post:
 *     summary: Update patient stage from Audit / Sampling section
 *     tags: [Audit Sampling]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - action
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               action:
 *                 type: string
 *                 enum: [AUDIT_APPROVE, REQUEST_REWORK, AUDIT_FAIL]
 *               reason:
 *                 type: string
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient audit stage updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/audit-stage", auditSamplingController.updatePatientAuditStage);

/**
 * @swagger
 * /api/audit/decisions:
 *   post:
 *     summary: Submit per-measure audit decisions and update patient stage
 *     tags: [Audit Sampling]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - decisions
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               chartId:
 *                 type: string
 *                 format: uuid
 *               decisions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     measureId:
 *                       type: string
 *                     measureCode:
 *                       type: string
 *                     measureName:
 *                       type: string
 *                     auditStatus:
 *                       type: string
 *                       enum: [AUDIT_APPROVE, REQUEST_REWORK, AUDIT_FAIL]
 *                     reasons:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Audit decisions saved and patient stage updated
 */
router.post("/decisions", auditSamplingController.updateAuditDecisions);

/**
 * @swagger
 * /api/audit/queue:
 *   get:
 *     summary: Get Audit Queue - All QA Reviewed Patients
 *     tags: [Audit Sampling]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name or MRN
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *         description: Filter by patient stage (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Audit queue fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/queue", auditSamplingController.getAuditQueue);

/**
 * @swagger
 * /api/audit/measures/{patientId}:
 *   get:
 *     summary: Get QA Passed Measures for Audit Review (for a specific patient)
 *     tags: [Audit Sampling]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of QA Passed measures for the patient
 *       404:
 *         description: Patient not found
 */
router.get("/measures/:patientId", auditSamplingController.getAuditMeasures);

module.exports = router;
