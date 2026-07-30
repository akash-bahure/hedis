const express = require("express");
const router = express.Router();
const text2sqlController = require("../controllers/text2sql.controller");

/**
 * @swagger
 * tags:
 *   name: Text-to-SQL
 *   description: Natural Language to PostgreSQL Query Translation & Execution Feature using Ollama Integration
 */

/**
 * @swagger
 * /api/text2sql/query:
 *   post:
 *     summary: Translate natural language question into PostgreSQL query, validate safety, and execute
 *     description: >
 *       Accepts a natural language question about HEDIS platform data (patients, charts, projects, clients,
 *       evaluations, audit logs, user productivity, etc.), translates it into a PostgreSQL SELECT query using
 *       Ollama AI service, validates query safety (ensuring read-only access), executes it against PostgreSQL,
 *       and returns the generated SQL query along with explanation and result set.
 *     tags: [Text-to-SQL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Natural language query question about the database
 *           examples:
 *             TestCase1_Projects:
 *               summary: "Test Case 1: Active Projects & Completed Charts"
 *               value:
 *                 question: "Show all active projects and their total completed charts"
 *             TestCase2_PendingQAPatients:
 *               summary: "Test Case 2: Top 5 Patients in Pending QA Stage"
 *               value:
 *                 question: "List top 5 patients with pending QA stage"
 *             TestCase3_HedisMeasureCounts:
 *               summary: "Test Case 3: Patient Breakdown by HEDIS Measure Code"
 *               value:
 *                 question: "Count of patients grouped by HEDIS measure code"
 *             TestCase4_AbstractorWorkload:
 *               summary: "Test Case 4: Abstractor Chart Assignments"
 *               value:
 *                 question: "Find abstractors assigned to more than 10 charts"
 *             TestCase5_SecurityAuditLogs:
 *               summary: "Test Case 5: High & Critical Security Audit Logs"
 *               value:
 *                 question: "Get recent audit log events with High or Critical risk level"
 *     responses:
 *       200:
 *         description: Query successfully translated, validated, and executed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 question:
 *                   type: string
 *                   example: "Show all active projects and their total completed charts"
 *                 generatedSql:
 *                   type: string
 *                   example: "SELECT project_name, status, total_charts, completed_charts FROM projects WHERE status = 'Active' ORDER BY completed_charts DESC LIMIT 100"
 *                 explanation:
 *                   type: string
 *                   example: "Query retrieves active projects from the projects table along with total and completed chart metrics."
 *                 executionTimeMs:
 *                   type: integer
 *                   example: 245
 *                 rowCount:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *             example:
 *               success: true
 *               question: "Show all active projects and their total completed charts"
 *               generatedSql: "SELECT project_name, status, total_charts, completed_charts FROM projects WHERE status = 'Active' ORDER BY completed_charts DESC LIMIT 100"
 *               explanation: "Queries active projects from the projects table sorted by completed_charts."
 *               executionTimeMs: 182
 *               rowCount: 3
 *               data:
 *                 - project_name: "Apollo Inpatient HEDIS"
 *                   status: "Active"
 *                   total_charts: 450
 *                   completed_charts: 320
 *                 - project_name: "Max Healthcare Outpatient"
 *                   status: "Active"
 *                   total_charts: 200
 *                   completed_charts: 180
 *       400:
 *         description: Missing question or unsafe SQL query detected (rejected by validator)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 question:
 *                   type: string
 *                 generatedSql:
 *                   type: string
 *                 explanation:
 *                   type: string
 *                 error:
 *                   type: string
 *                   example: "SQL Security Error: Unsafe SQL keyword detected: 'DELETE'. Only read-only SELECT queries are allowed."
 *                 executionTimeMs:
 *                   type: integer
 *                   example: 42
 *                 rowCount:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Internal server error or database query execution failure
 */
router.post("/query", text2sqlController.queryText2Sql);

/**
 * @swagger
 * /api/text2sql/schema:
 *   get:
 *     summary: Retrieve supported database tables and metadata dictionary for Text-to-SQL
 *     description: Returns the list of database tables, descriptions, and keywords understood by the Text-to-SQL engine.
 *     tags: [Text-to-SQL]
 *     responses:
 *       200:
 *         description: Schema overview fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalTables:
 *                   type: integer
 *                   example: 16
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tableName:
 *                         type: string
 *                         example: "patients"
 *                       description:
 *                         type: string
 *                         example: "Patient Demographics and HEDIS workflow tracking"
 *                       keywords:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get("/schema", text2sqlController.getSchemaOverview);

module.exports = router;
