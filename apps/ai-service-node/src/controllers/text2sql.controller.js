const { callOllama } = require("../services/ollama.service");
const { buildText2SqlPrompt } = require("../prompts/text2sql.prompt");

/**
 * POST /api/text2sql/generate
 * Generates a PostgreSQL query from a natural language question and schema context.
 */
exports.generateSql = async (req, res) => {
  try {
    const { question, schemaContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    if (!schemaContext) {
      return res.status(400).json({ error: "schemaContext is required" });
    }

    console.log(`[AI Text-to-SQL] Processing question: "${question}"`);

    const prompt = buildText2SqlPrompt({ question, schemaContext });

    const aiResult = await callOllama(prompt);

    if (!aiResult || !aiResult.sql) {
      return res.status(500).json({
        error: "AI failed to generate a valid SQL query.",
        raw: aiResult,
      });
    }

    return res.json({
      sql: aiResult.sql.trim(),
      explanation: aiResult.explanation || "SQL generated successfully.",
    });
  } catch (error) {
    console.error("[AI Text-to-SQL Controller Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate Text-to-SQL query",
    });
  }
};
