const pool = require("../config/db");
const text2sqlSchemaService = require("./text2sqlSchema.service");
const aiIntegrationService = require("./aiText2SqlIntegration.service");
const { validateSql } = require("../utils/sqlValidator");

/**
 * Executes natural language question translation to SQL, validates query safety,
 * executes on PostgreSQL using the tenant-scoped database client, and returns structured API response.
 * 
 * @param {string} question - Natural language question from user
 * @param {Object} [dbClient] - Tenant DB client (from req.db) or default connection pool
 * @param {string} [tenantSchema] - Optional explicit schema name (e.g. req.tenant?.schema_name)
 * @returns {Promise<Object>}
 */
async function processQuestion(question, dbClient = null, tenantSchema = null) {
  const startTime = Date.now();

  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Invalid question parameter provided.");
  }

  // 1. Build relevant schema context
  const schemaContext = text2sqlSchemaService.getRelevantSchema(question);

  // 2. Request SQL generation from AI service (Ollama)
  const aiResponse = await aiIntegrationService.requestSqlFromAiService(
    question.trim(),
    schemaContext
  );

  const rawSql = aiResponse.sql;
  const explanation = aiResponse.explanation || "Query generated successfully.";

  // 3. Validate generated SQL for safety (Read-only SELECT queries only)
  const validation = validateSql(rawSql);
  if (!validation.valid) {
    return {
      success: false,
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

  // 4. Determine database connection & set search_path if needed
  let clientToUse = dbClient;
  let shouldRelease = false;

  try {
    if (!clientToUse) {
      clientToUse = await pool.connect();
      shouldRelease = true;
      if (tenantSchema) {
        // Sanitize schema name for security
        const safeSchema = tenantSchema.replace(/[^a-zA-Z0-9_]/g, "");
        await clientToUse.query(`SET search_path TO ${safeSchema}, public`);
      }
    } else if (tenantSchema) {
      // Ensure search_path is set on provided client
      const safeSchema = tenantSchema.replace(/[^a-zA-Z0-9_]/g, "");
      await clientToUse.query(`SET search_path TO ${safeSchema}, public`);
    }

    const dbResult = await clientToUse.query(safeSql);
    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      question,
      generatedSql: safeSql,
      explanation,
      executionTimeMs,
      rowCount: dbResult.rowCount || dbResult.rows.length,
      data: dbResult.rows,
    };
  } catch (dbError) {
    console.error("[Text2SQL DB Execution Error]:", dbError.message);
    return {
      success: false,
      question,
      generatedSql: safeSql,
      explanation,
      error: `Database Query Error: ${dbError.message}`,
      executionTimeMs: Date.now() - startTime,
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
