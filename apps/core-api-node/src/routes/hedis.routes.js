const express = require("express");
const multer = require("multer");
const hedisController = require("../controllers/hedis.controller");
const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

/**
 * @swagger
 * /api/hedis/evaluate/{id}:
 *   post:
 *     summary: Evaluate a patient's chart for HEDIS measures
 *     tags: [HEDIS]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Evaluation completed
 */
router.post("/evaluate/:id", upload.single("file"), hedisController.evaluateChart);

/**
 * @swagger
 * /api/hedis/evaluations/{id}:
 *   get:
 *     summary: Get HEDIS evaluations for a patient
 *     tags: [HEDIS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evaluations fetched
 */
router.get("/evaluations/:id", hedisController.getEvaluations);

module.exports = router;
