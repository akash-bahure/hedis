/**
 * Text-to-SQL Conversation History Service
 *
 * CRUD operations for text2sql_conversations and text2sql_messages tables.
 * Provides ChatGPT-like conversation thread persistence.
 */

/**
 * Creates a new conversation thread.
 * Auto-generates title from the first question (truncated to 100 chars).
 */
async function createConversation(dbClient, userId, title = "New Conversation") {
  const result = await dbClient.query(
    `INSERT INTO text2sql_conversations (user_id, title, status)
     VALUES ($1, $2, 'active')
     RETURNING id, user_id, title, status, created_at, updated_at`,
    [userId || null, title]
  );
  return result.rows[0];
}

/**
 * Returns a paginated list of the user's conversations (most recent first).
 * Includes the message count and last message timestamp for each.
 */
async function getConversations(dbClient, userId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;

  const countResult = await dbClient.query(
    `SELECT COUNT(*) AS total
     FROM text2sql_conversations
     WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const result = await dbClient.query(
    `SELECT
       c.id,
       c.title,
       c.status,
       c.created_at,
       c.updated_at,
       COUNT(m.id)::INTEGER AS message_count,
       MAX(m.created_at) AS last_message_at
     FROM text2sql_conversations c
     LEFT JOIN text2sql_messages m ON m.conversation_id = c.id
     WHERE c.user_id = $1 AND c.status = 'active'
     GROUP BY c.id
     ORDER BY c.updated_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    conversations: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Returns a single conversation with all its messages.
 */
async function getConversationById(dbClient, conversationId) {
  const convResult = await dbClient.query(
    `SELECT id, user_id, title, status, created_at, updated_at
     FROM text2sql_conversations
     WHERE id = $1`,
    [conversationId]
  );

  if (convResult.rows.length === 0) {
    return null;
  }

  const messagesResult = await dbClient.query(
    `SELECT id, question, generated_sql, explanation, result_data,
            row_count, execution_time_ms, success, error, created_at
     FROM text2sql_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return {
    ...convResult.rows[0],
    messages: messagesResult.rows,
  };
}

/**
 * Adds a Q&A message to an existing conversation.
 */
async function addMessage(dbClient, conversationId, messageData) {
  const {
    question,
    generatedSql = null,
    explanation = null,
    resultData = [],
    rowCount = 0,
    executionTimeMs = 0,
    success = true,
    error = null,
  } = messageData;

  const result = await dbClient.query(
    `INSERT INTO text2sql_messages
       (conversation_id, question, generated_sql, explanation,
        result_data, row_count, execution_time_ms, success, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, conversation_id, question, generated_sql, explanation,
               row_count, execution_time_ms, success, error, created_at`,
    [
      conversationId,
      question,
      generatedSql,
      explanation,
      JSON.stringify(resultData),
      rowCount,
      executionTimeMs,
      success,
      error,
    ]
  );

  // Update conversation's updated_at and auto-title from first message
  await dbClient.query(
    `UPDATE text2sql_conversations
     SET updated_at = CURRENT_TIMESTAMP,
         title = CASE
           WHEN title = 'New Conversation'
           THEN LEFT($2, 100)
           ELSE title
         END
     WHERE id = $1`,
    [conversationId, question]
  );

  return result.rows[0];
}

/**
 * Retrieves the last N messages for a conversation (for LLM context).
 */
async function getConversationContext(dbClient, conversationId, limit = 5) {
  const result = await dbClient.query(
    `SELECT question, generated_sql, explanation
     FROM text2sql_messages
     WHERE conversation_id = $1 AND success = TRUE
     ORDER BY created_at DESC
     LIMIT $2`,
    [conversationId, limit]
  );

  // Reverse to get chronological order
  return result.rows.reverse();
}

/**
 * Archives (soft-deletes) a conversation.
 */
async function deleteConversation(dbClient, conversationId) {
  const result = await dbClient.query(
    `UPDATE text2sql_conversations
     SET status = 'archived', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, status`,
    [conversationId]
  );
  return result.rows[0] || null;
}

/**
 * Updates a conversation title.
 */
async function updateConversationTitle(dbClient, conversationId, title) {
  const result = await dbClient.query(
    `UPDATE text2sql_conversations
     SET title = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, title, updated_at`,
    [conversationId, title]
  );
  return result.rows[0] || null;
}

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  addMessage,
  getConversationContext,
  deleteConversation,
  updateConversationTitle,
};
