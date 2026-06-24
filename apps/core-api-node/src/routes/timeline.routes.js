const express = require("express");
const router = express.Router();
const chartController = require("../controllers/patientChart.controller");

/**
 * @swagger
 * /api/clinical-timeline/evidence/{eventId}/review-evidence:
 *   get:
 *     summary: Retrieve detailed evidence for review screen
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Evidence details retrieved successfully
 */
router.get("/:eventId/review-evidence", chartController.getReviewEvidence);

/**
 * @swagger
 * /api/clinical-timeline/evidence/{eventId}:
 *   put:
 *     summary: Edit an existing clinical timeline event review
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               comment:
 *                 type: string
 *               reviewedBy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event edited successfully
 */
router.put("/:eventId", chartController.editEvent);

/**
 * @swagger
 * /api/clinical-timeline/evidence/{eventId}/accept:
 *   post:
 *     summary: Accept a timeline event
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               reviewedBy:
 *                 type: string
 *               comment:
 *                 type: string
 *               sourceExcerpt:
 *                 type: string
 *               extractedEvidence:
 *                 type: object
 *     responses:
 *       200:
 *         description: Event accepted
 */
router.post("/:eventId/accept", chartController.acceptEvent);

/**
 * @swagger
 * /api/clinical-timeline/evidence/{eventId}/reject:
 *   post:
 *     summary: Reject a timeline event
 *     tags: [Clinical Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               reviewedBy:
 *                 type: string
 *               reason:
 *                 type: string
 *               sourceExcerpt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event rejected
 */
router.post("/:eventId/reject", chartController.rejectEvent);

module.exports = router;
