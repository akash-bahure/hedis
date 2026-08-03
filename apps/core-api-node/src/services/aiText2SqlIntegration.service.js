const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Sends natural language question, schema context, and optional conversation history
 * to ai-service-node for SQL generation via Ollama.
 *
 * @param {string} question
 * @param {string} schemaContext
 * @param {Array} conversationHistory - Array of { question, generated_sql, explanation }
 * @returns {Promise<{ sql: string, explanation: string }>}
 */
async function requestSqlFromAiService(question, schemaContext, conversationHistory = []) {
  try {
    console.log(`[AI-Text2SQL Integration] Requesting SQL generation from ${AI_SERVICE_URL}/api/text2sql/generate`);

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/text2sql/generate`,
      {
        question,
        schemaContext,
        conversationHistory,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // 120 seconds timeout for complex queries
      }
    );

    return response.data;
  } catch (error) {
    console.error("[AI-Text2SQL Integration Error]:", error.message);
    if (error.response && error.response.data) {
      throw new Error(`AI Service Error: ${error.response.data.error || error.response.statusText}`);
    }
    throw error;
  }
}

module.exports = {
  requestSqlFromAiService,
};
