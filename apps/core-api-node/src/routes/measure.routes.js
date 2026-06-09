const express = require("express");
const router = express.Router();
const measureController = require("../controllers/measure.controller");

/**
 * @swagger
 * tags:
 *   name: Measures
 *   description: HEDIS Measure Library Export APIs
 */

/**
 * @swagger
 * /api/measures/export-specs:
 *   get:
 *     summary: Export HEDIS measures specs list
 *     tags: [Measures]
 *     description: Export all HEDIS measures or apply filters (Measurement Year, Product Line, Category, Search Text, Status) and download as a CSV or JSON file.
 *     parameters:
 *       - in: query
 *         name: measureYear
 *         schema:
 *           type: string
 *         description: Filter by measurement year (e.g. MY2025, 2025)
 *       - in: query
 *         name: productLine
 *         schema:
 *           type: string
 *         description: Filter by product line (e.g. Commercial, Medicaid, Medicare)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by measure category (e.g. Cardiovascular, Respiratory)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text matching measure code, name, or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by active/inactive status
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Export file format
 *     responses:
 *       200:
 *         description: Downloadable HEDIS measures specification file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: No measures found matching criteria
 *       500:
 *         description: Server error
 */
router.get("/export-specs", measureController.exportSpecs);

/**
 * @swagger
 * /api/measures/{measureId}/export:
 *   get:
 *     summary: Export complete single HEDIS measure details
 *     tags: [Measures]
 *     description: Export complete specifications for a single HEDIS measure including metadata, eligibility rules, denominator/numerator logic, exclusions, clinical codes, and documentation criteria.
 *     parameters:
 *       - in: path
 *         name: measureId
 *         required: true
 *         schema:
 *           type: string
 *         description: Numeric ID (e.g. 1) or string code (e.g. CBP) of the measure
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: json
 *         description: Export file format
 *     responses:
 *       200:
 *         description: Complete single HEDIS measure specification file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: Measure not found
 *       500:
 *         description: Server error
 */
router.get("/:measureId/export", measureController.exportSingleMeasure);

module.exports = router;
