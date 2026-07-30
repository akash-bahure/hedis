const text2sqlService = require("../services/text2sql.service");

/**
 * POST /api/text2sql/query
 * Accepts a natural language question, generates safe PostgreSQL SQL via Ollama,
 */
exports.queryText2Sql = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required string parameter 'question'.",
      });
    }

    const tenantSchema = req.tenant?.schema_name || "public";

    console.log(
      `[Text2SQL Controller] Processing question: "${question}" for tenant schema: "${tenantSchema}"`
    );

    const result = await text2sqlService.processQuestion(
      question,
      req.db,
      tenantSchema
    );

    if (
      !result.success &&
      result.error &&
      result.error.includes("SQL Security Error")
    ) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error("[Text2SQL Controller Error]:", error);
    return res.status(500).json({
      success: false,
      error:
        error.message || "Internal server error during Text-to-SQL processing.",
    });
  }
};

/**
 * GET /api/text2sql/schema
 * Returns an overview of database tables and metadata supported by Text-to-SQL.
 */
exports.getSchemaOverview = async (req, res) => {
  try {
    const schemaOverview = text2sqlService.getSchemaOverview();
    return res.json({
      success: true,
      totalTables: schemaOverview.length,
      tables: schemaOverview,
    });
  } catch (error) {
    console.error("[Text2SQL Schema Overview Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve schema overview.",
    });
  }
};
