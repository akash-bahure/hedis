const express = require("express");
const controller = require("../controllers/measureLibrary.controller");

const router = express.Router();

/**
 * @swagger
 * /api/measure-library:
 *   get:
 *     summary: Get all measures with pagination and filters
 *     tags:
 *       - Measure Library
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by measure name or code
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: productLine
 *         schema: { type: string }
 *       - in: query
 *         name: measurementYear
 *         schema: { type: string }
 *       - in: query
 *         name: active
 *         schema: { type: boolean, default: true }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", controller.getMeasures);

/**
 * @swagger
 * /api/measure-library/{id}:
 *   get:
 *     summary: Get measure details and rules
 *     description: Retrieve complete measure information including eligibility, numerator, denominator, exclusions, and documentation.
 *     tags:
 *       - Measure Library
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Measure UUID or Measure Code (e.g. BCS, CCS)
 *
 *     responses:
 *       200:
 *         description: Measure details fetched successfully
 *       404:
 *         description: Measure not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", controller.getMeasureRules);

module.exports = router;
