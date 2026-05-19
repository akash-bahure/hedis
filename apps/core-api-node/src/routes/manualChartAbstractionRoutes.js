const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const {
  createManualAbstraction,
} = require("../controllers/manualChartAbstractionController");

/**
 * @swagger
 * tags:
 *   name: Manual Chart Abstraction
 *   description: Manual Chart Abstraction APIs
 */

/**
 * @swagger
 * /api/manual-chart-abstraction:
 *   post:
 *     summary: Create manual chart abstraction
 *     tags: [Manual Chart Abstraction]
 *     security:
 *       - bearerAuth: []
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
 *               - patient_id
 *               - patient_chart_id
 *               - service_date
 *               - screening_type
 *               - evidence_type
 *               - systolic
 *               - diastolic
 *
 *             properties:
 *
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *                 example: "7e9d8010-716d-4a2c-8c55-236ef1093c03"
 *
 *               patient_chart_id:
 *                 type: string
 *                 format: uuid
 *                 example: "8609ce1b-4336-4192-ad6e-674e06a807c1"
 *
 *               service_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-15"
 *
 *               screening_type:
 *                 type: string
 *                 enum:
 *                   - Blood Pressure Screening
 *                   - Hypertension Screening
 *                   - Diabetes Screening
 *                   - Preventive Care Screening
 *                   - Annual Wellness Screening
 *                   - Cardiovascular Screening
 *                   - HEDIS CBP Screening
 *                   - Follow-Up BP Screening
 *                 example: "Blood Pressure Screening"
 *
 *               evidence_type:
 *                 type: string
 *                 enum:
 *                   - Office Visit BP Reading
 *                   - Specialist Consult BP Reading
 *                   - Telehealth Visit BP Reading
 *                   - Home BP Monitoring Record
 *                   - Annual Wellness Visit
 *                   - Emergency Dept. Reading
 *                   - Urgent Care Reading
 *                 example: "Office Visit BP Reading"
 *
 *               systolic:
 *                 type: integer
 *                 example: 120
 *
 *               diastolic:
 *                 type: integer
 *                 example: 80
 *
 *               cpt_code:
 *                 type: string
 *                 enum:
 *                   - "99211"
 *                   - "99212"
 *                   - "99213"
 *                   - "99214"
 *                   - "99215"
 *                   - "99397"
 *                   - "G0438"
 *                   - "G0439"
 *                 example: "99213"
 *
 *               icd_10_code:
 *                 type: string
 *                 enum:
 *                   - I10
 *                   - I11.9
 *                   - I12.9
 *                   - N18.3
 *                   - E11.9
 *                 example: "I10"
 *
 *               source_type:
 *                 type: string
 *                 enum:
 *                   - Electronic Health Record (EHR)
 *                   - Physician Office Chart Note
 *                   - Hospital Medical Record
 *                   - Specialist Consultation Note
 *                   - Telehealth Encounter Record
 *                   - Home BP Monitoring Report
 *                   - Patient-Reported Form
 *                 example: "Electronic Health Record (EHR)"
 *
 *               evidence_source:
 *                 type: string
 *                 example: "Provider Office Clinical Note"
 *
 *               uploaded_document:
 *                 type: object
 *                 properties:
 *                   file_name:
 *                     type: string
 *                   file_url:
 *                     type: string
 *                 example:
 *                   file_name: "bp_reading.pdf"
 *                   file_url: "/uploads/bp_reading.pdf"
 *
 *               notes:
 *                 type: string
 *                 example: "Patient BP is controlled and reviewed."
 *
 *               assigned_qa:
 *                 type: string
 *                 format: uuid
 *                 example: "6bb885e1-845f-4ccd-a90c-0da6dfa90da4"
 *
 *     responses:
 *
 *       201:
 *         description: Manual chart abstraction created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: Patient or chart not found
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware,
  createManualAbstraction
);

module.exports = router;