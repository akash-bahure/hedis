const text2sqlService = require("../services/text2sql.service");
const historyService = require("../services/text2sqlHistory.service");

/**
 * POST /api/text2sql/query
 * Accepts a natural language question, generates safe PostgreSQL SQL via Ollama,
 * executes the query, and persists the Q&A to conversation history.
 * Supports optional conversationId for follow-up context.
 */
exports.queryText2Sql = async (req, res) => {
  try {
    const { question, conversationId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required string parameter 'question'.",
      });
    }

    const tenantSchema = req.tenant?.schema_name || "public";
    const userId = req.user?.id || null;

    console.log(
      `[Text2SQL Controller] Question: "${question}" | Schema: "${tenantSchema}" | ConvID: ${conversationId || "new"}`
    );

    const result = await text2sqlService.processQuestion(
      question,
      req.db,
      tenantSchema,
      { conversationId, userId }
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

/**
 * GET /api/text2sql/conversations
 * Returns paginated list of user's conversation threads.
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to access conversation history.",
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const result = await historyService.getConversations(req.db, userId, page, limit);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Text2SQL GetConversations Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve conversations.",
    });
  }
};

/**
 * GET /api/text2sql/conversations/:id
 * Returns a single conversation with all its messages.
 */
exports.getConversationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Conversation ID is required.",
      });
    }

    const conversation = await historyService.getConversationById(req.db, id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("[Text2SQL GetConversationHistory Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve conversation history.",
    });
  }
};

/**
 * DELETE /api/text2sql/conversations/:id
 * Archives (soft-deletes) a conversation.
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Conversation ID is required.",
      });
    }

    const result = await historyService.deleteConversation(req.db, id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    return res.json({
      success: true,
      message: "Conversation archived successfully.",
      conversation: result,
    });
  } catch (error) {
    console.error("[Text2SQL DeleteConversation Error]:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to delete conversation.",
    });
  }
};
