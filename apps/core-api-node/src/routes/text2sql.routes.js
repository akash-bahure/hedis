const express = require("express");
const router = express.Router();
const text2sqlController = require("../controllers/text2sql.controller");

/**
 * @swagger
 * tags:
 *   name: Text-to-SQL
 *   description: Natural Language to PostgreSQL Query Translation & Execution with ChatGPT-like Conversation History
 */

/**
 * @swagger
 * /api/text2sql/query:
 *   post:
 *     summary: Translate natural language question into PostgreSQL query, validate safety, execute, and save to conversation history
 *     description: >
 *       Accepts a natural language question about HEDIS platform data, translates it into a PostgreSQL SELECT query using
 *       Ollama AI service, validates query safety (read-only), executes against PostgreSQL, and persists the Q&A to
 *       conversation history. Supports follow-up questions via optional conversationId for ChatGPT-like contextual flow.
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
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional existing conversation ID for follow-up questions. If omitted, a new conversation is created.
 *           examples:
 *             NewConversation:
 *               summary: "New conversation — first question"
 *               value:
 *                 question: "How many patients are in each stage?"
 *             FollowUp:
 *               summary: "Follow-up in existing conversation"
 *               value:
 *                 question: "Now break that down by client"
 *                 conversationId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
 *             TestCase6_ComplexJoin:
 *               summary: "Test Case 6: Complex multi-table analytical query"
 *               value:
 *                 question: "Show top 5 clients with most active projects and their completion rates"
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
 *                 conversationId:
 *                   type: string
 *                   format: uuid
 *                   description: The conversation ID — use this for follow-up questions
 *                 messageId:
 *                   type: string
 *                   format: uuid
 *                   description: The unique message ID for this Q&A pair
 *                 question:
 *                   type: string
 *                 generatedSql:
 *                   type: string
 *                 explanation:
 *                   type: string
 *                 executionTimeMs:
 *                   type: integer
 *                 rowCount:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing question or unsafe SQL query detected
 *       500:
 *         description: Internal server error
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
 *                 tables:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tableName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       keywords:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get("/schema", text2sqlController.getSchemaOverview);

/**
 * @swagger
 * /api/text2sql/conversations:
 *   get:
 *     summary: List user's Text-to-SQL conversation threads
 *     description: >
 *       Returns a paginated list of the authenticated user's conversation threads,
 *       ordered by most recently updated. Each entry includes message count and last activity.
 *     tags: [Text-to-SQL]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Number of conversations per page (max 50)
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 conversations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                         example: "How many patients are in each stage?"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       message_count:
 *                         type: integer
 *                         example: 5
 *                       last_message_at:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get("/conversations", text2sqlController.getConversations);

/**
 * @swagger
 * /api/text2sql/conversations/{id}:
 *   get:
 *     summary: Get a conversation with full message history
 *     description: >
 *       Returns a single conversation thread with all Q&A messages in chronological order.
 *       Each message includes the original question, generated SQL, explanation, results, and execution metadata.
 *     tags: [Text-to-SQL]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Conversation UUID
 *     responses:
 *       200:
 *         description: Conversation with messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           question:
 *                             type: string
 *                           generated_sql:
 *                             type: string
 *                           explanation:
 *                             type: string
 *                           result_data:
 *                             type: array
 *                             items:
 *                               type: object
 *                           row_count:
 *                             type: integer
 *                           execution_time_ms:
 *                             type: integer
 *                           success:
 *                             type: boolean
 *                           error:
 *                             type: string
 *                             nullable: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.get("/conversations/:id", text2sqlController.getConversationHistory);

/**
 * @swagger
 * /api/text2sql/conversations/{id}:
 *   delete:
 *     summary: Archive (soft-delete) a conversation
 *     description: Marks the conversation status as 'archived'. The conversation and messages are retained in the database but excluded from listing.
 *     tags: [Text-to-SQL]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Conversation UUID to archive
 *     responses:
 *       200:
 *         description: Conversation archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conversation archived successfully."
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "archived"
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
router.delete("/conversations/:id", text2sqlController.deleteConversation);

module.exports = router;
