const express = require("express");
const router = express.Router();
const chartController = require("../controllers/patientChart.controller");

/**
 * @swagger
 * /api/timeline/{eventId}/accept:
 *   post:
 *     summary: Accept a timeline event
 *     tags: [Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event accepted
 */
router.post("/:eventId/accept", chartController.acceptEvent);

/**
 * @swagger
 * /api/timeline/{eventId}/reject:
 *   post:
 *     summary: Reject a timeline event
 *     tags: [Timeline]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Event rejected
 */
router.post("/:eventId/reject", chartController.rejectEvent);

/**
 * @swagger
 * /api/timeline/{eventId}:
 *   put:
 *     summary: Edit a timeline event
 *     tags: [Timeline]
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
 *               event_date:
 *                 type: string
 *               provider:
 *                 type: string
 *               measure:
 *                 type: string
 *               evidence:
 *                 type: string
 *               event_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event edited
 */
router.put("/:eventId", chartController.editEvent);

module.exports = router;
