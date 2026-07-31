const pool = require("../config/db");
const text2sqlSchemaService = require("./text2sqlSchema.service");
const aiIntegrationService = require("./aiText2SqlIntegration.service");
const historyService = require("./text2sqlHistory.service");
const { validateSql } = require("../utils/sqlValidator");

/**
 * Executes natural language question translation to SQL, validates query safety,
 * executes on PostgreSQL using the tenant-scoped database client, and returns structured API response.
 * Supports optional conversation history for ChatGPT-like follow-up context.
 *
 * @param {string} question - Natural language question from user
 * @param {Object} [dbClient] - Tenant DB client (from req.db) or default connection pool
 * @param {string} [tenantSchema] - Optional explicit schema name (e.g. req.tenant?.schema_name)
 * @param {Object} [options] - Additional options
 * @param {string} [options.conversationId] - Existing conversation ID for follow-ups
 * @param {string} [options.userId] - Authenticated user ID
 * @returns {Promise<Object>}
 */
async function processQuestion(question, dbClient = null, tenantSchema = null, options = {}) {
  const startTime = Date.now();
  const { conversationId = null, userId = null } = options;

  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Invalid question parameter provided.");
  }

  // Determine database connection
  let clientToUse = dbClient;
  let shouldRelease = false;

  try {
    if (!clientToUse) {
      clientToUse = await pool.connect();
      shouldRelease = true;
    }

    // Set search_path if tenant schema provided
    if (tenantSchema) {
      const safeSchema = tenantSchema.replace(/[^a-zA-Z0-9_]/g, "");
      await clientToUse.query(`SET search_path TO ${safeSchema}, public`);
    }

    // 1. Resolve or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      // Auto-create a new conversation
      const conv = await historyService.createConversation(
        clientToUse,
        userId,
        question.trim().substring(0, 100)
      );
      activeConversationId = conv.id;
      console.log(`[Text2SQL] Created new conversation: ${activeConversationId}`);
    }

    // 2. Load conversation history for context (last 5 successful messages)
    let conversationHistory = [];
    try {
      conversationHistory = await historyService.getConversationContext(
        clientToUse,
        activeConversationId,
        5
      );
    } catch (err) {
      console.warn("[Text2SQL] Could not load conversation context:", err.message);
    }

    // 3. Build relevant schema context
    const schemaContext = text2sqlSchemaService.getRelevantSchema(question);

    // 4. Request SQL generation from AI service (Ollama) with conversation history
    const aiResponse = await aiIntegrationService.requestSqlFromAiService(
      question.trim(),
      schemaContext,
      conversationHistory
    );

    const rawSql = aiResponse.sql;
    const explanation = aiResponse.explanation || "Query generated successfully.";

    // 5. Validate generated SQL for safety (Read-only SELECT queries only)
    const validation = validateSql(rawSql);
    if (!validation.valid) {
      // Save failed message to history
      const messageData = {
        question: question.trim(),
        generatedSql: rawSql,
        explanation,
        resultData: [],
        rowCount: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: `SQL Security Error: ${validation.error}`,
      };

      try {
        await historyService.addMessage(clientToUse, activeConversationId, messageData);
      } catch (err) {
        console.warn("[Text2SQL] Failed to save error message to history:", err.message);
      }

      return {
        success: false,
        conversationId: activeConversationId,
        question,
        generatedSql: rawSql,
        explanation,
        error: `SQL Security Error: ${validation.error}`,
        executionTimeMs: Date.now() - startTime,
        rowCount: 0,
        data: [],
      };
    }

    const safeSql = validation.sql;

    // 6. Execute the validated SQL query
    const dbResult = await clientToUse.query(safeSql);
    const executionTimeMs = Date.now() - startTime;

    // 7. Save successful message to history
    const messageData = {
      question: question.trim(),
      generatedSql: safeSql,
      explanation,
      resultData: dbResult.rows.slice(0, 50), // Store max 50 rows in history
      rowCount: dbResult.rowCount || dbResult.rows.length,
      executionTimeMs,
      success: true,
      error: null,
    };

    let messageId = null;
    try {
      const savedMessage = await historyService.addMessage(
        clientToUse,
        activeConversationId,
        messageData
      );
      messageId = savedMessage.id;
    } catch (err) {
      console.warn("[Text2SQL] Failed to save message to history:", err.message);
    }

    return {
      success: true,
      conversationId: activeConversationId,
      messageId,
      question,
      generatedSql: safeSql,
      explanation,
      executionTimeMs,
      rowCount: dbResult.rowCount || dbResult.rows.length,
      data: dbResult.rows,
    };
  } catch (dbError) {
    const executionTimeMs = Date.now() - startTime;
    console.error("[Text2SQL DB Execution Error]:", dbError.message);

    return {
      success: false,
      conversationId: conversationId || null,
      question,
      generatedSql: "",
      explanation: "",
      error: `Database Query Error: ${dbError.message}`,
      executionTimeMs,
      rowCount: 0,
      data: [],
    };
  } finally {
    if (shouldRelease && clientToUse) {
      clientToUse.release();
    }
  }
}

/**
 * Returns schema metadata overview.
 */
function getSchemaOverview() {
  return text2sqlSchemaService.getAllSchemaOverview();
}

module.exports = {
  processQuestion,
  getSchemaOverview,
};
