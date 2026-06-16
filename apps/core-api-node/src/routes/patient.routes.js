const express = require("express");
const controller = require("../controllers/patient.controller");
const router = express.Router();

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or patient ID
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: abstractor_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: qa_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page_no
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Patients fetched successfully
 */
router.get("/", controller.getPatients);

/**
 * @swagger
 * /api/patients/{id}/assign:
 *   post:
 *     summary: Assign QA or Abstractor to a patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               abstractorId:
 *                 type: string
 *                 format: uuid
 *               qaId:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Legacy field for single assignment
 *               role:
 *                 type: string
 *                 enum: [Abstractor, QA]
 *                 description: Legacy field for single assignment
 *     responses:
 *       200:
 *         description: Patient assigned successfully
 */
router.post("/:id/assign", controller.assignPatient);

/**
 * @swagger
 * /api/patients/{id}/stage:
 *   patch:
 *     summary: Update patient workflow stage
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stage
 *             properties:
 *               stage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stage updated successfully
 */
router.patch("/:id/stage", controller.updatePatientStage);

/**
 * @swagger
 * /api/patients/export:
 *   get:
 *     summary: Export all patients to CSV
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           default: csv
 *         description: Export format (csv)
 *     responses:
 *       200:
 *         description: CSV file downloaded
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/export", controller.exportPatients);

module.exports = router;
