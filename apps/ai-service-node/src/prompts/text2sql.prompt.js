/**
 * Text-to-SQL Prompt Builder for Ollama (gemma4:31b-cloud)
 *
 * Constructs a system/user prompt for translating natural language questions
 * into valid PostgreSQL SELECT queries based on the provided schema context.
 * Supports conversation history for ChatGPT-like follow-up context.
 */

/**
 * Formats conversation history into a context block for the LLM.
 */
function formatConversationHistory(history) {
  if (!history || history.length === 0) return "";

  const entries = history
    .map(
      (msg, idx) =>
        `Turn ${idx + 1}:\n  User Question: "${msg.question}"\n  Generated SQL: ${msg.generated_sql || "N/A"}`
    )
    .join("\n\n");

  return `
=== CONVERSATION HISTORY (Previous Q&A for Context) ===
The user is continuing a conversation. Use the previous questions and SQL queries below to understand context for follow-up questions (e.g., "break that down by gender" refers to the previous query's result set).

${entries}

IMPORTANT: When the user asks a follow-up like "now show by X", "break that down", "filter that", "sort by", "add Y to that", etc., modify the SQL from the most recent turn accordingly. Do NOT ignore conversation context.
`;
}

function buildText2SqlPrompt({ question, schemaContext, conversationHistory = [] }) {
  const historyBlock = formatConversationHistory(conversationHistory);

  return `You are an expert PostgreSQL DBA and data analyst specializing in HEDIS healthcare quality measures, patient charts, compliance tracking, and database reporting.

Your goal is to translate a user's natural language question into a syntactically correct, highly efficient PostgreSQL SELECT query based ONLY on the database schema provided below.

=== DATABASE SCHEMA CONTEXT ===
${schemaContext}

=== INSTRUCTIONS & RULES ===
1. Return ONLY a valid JSON object matching this exact schema:
{
  "sql": "SELECT ...",
  "explanation": "Short summary explaining what the query computes and which tables/columns are joined."
}

2. CRITICAL SAFETY RULES:
   - ALLOWED: ONLY read-only queries starting with SELECT or WITH ... SELECT.
   - ALLOWED SQL features: SELECT, FROM, JOIN, INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET, COUNT, SUM, AVG, MIN, MAX, COALESCE, NULLIF, CASE WHEN, EXTRACT, DATE_TRUNC, DATE_PART, CAST, TO_CHAR, CONCAT, STRING_AGG, ARRAY_AGG, DISTINCT, BETWEEN, IN, NOT IN, EXISTS, NOT EXISTS, LIKE, ILIKE, IS NULL, IS NOT NULL, subqueries, CTEs (WITH clauses), window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, OVER, PARTITION BY).
   - FORBIDDEN: NEVER output INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, GRANT, REVOKE, EXEC, COPY, RENAME, or any schema/data modification commands.
   - FORBIDDEN: Do NOT use multiple SQL statements separated by semicolons. Output exactly ONE single SQL query.
   - Do NOT wrap your JSON response in extra markdown headers outside of standard JSON output.

3. SCHEMA QUERYING RULES:
   - Use table names and column names EXACTLY as defined in the Database Schema Context.
   - Pay attention to foreign keys when joining tables:
     * patients.project_id -> projects.id
     * patients.client_id -> clients.id
     * patients.assigned_to -> users.id
     * patients.abstractor_id -> users.id
     * patients.qa_id -> users.id
     * hedis_evaluations.patient_id -> patients.id
     * patient_charts.patient_id -> patients.id
     * clinical_timeline_events.patient_id -> patients.id
     * clinical_timeline_events.chart_id -> patient_charts.id
     * chart_assignments.patient_chart_id -> patient_charts.id
     * chart_assignments.assigned_to -> users.id
     * manual_chart_abstractions.patient_id -> patients.id
     * manual_chart_abstractions.patient_chart_id -> patient_charts.id
     * projects.client_id -> clients.id
     * projects.project_manager_id -> users.id
     * users.user_role_id -> user_roles.id
     * users.department_id -> departments.id
     * hedis_qa_measure_decisions.patient_id -> patients.id
     * hedis_measure_evidence.patient_id -> patients.id
   - PostgreSQL column and table names are case-sensitive if double-quoted, so prefer standard lowercase unquoted column names as declared in schema.
   - Always add a default LIMIT 100 if the query retrieves individual rows without an explicit aggregate, to ensure fast performance.
   - For analytical queries with GROUP BY, use LIMIT 50 by default.
   - When counting or aggregating, use explicit column aliases for clarity.

4. QUERY QUALITY RULES:
   - For "top N" or "most/least" queries, always include ORDER BY with appropriate direction (DESC for most, ASC for least).
   - For date-based queries, use DATE_TRUNC or EXTRACT appropriately.
   - Use LEFT JOIN when the related record might not exist (e.g., a patient might not have evaluations).
   - Use COALESCE for nullable numeric columns in aggregations (e.g., COALESCE(completed_charts, 0)).
   - Use meaningful column aliases in the SELECT clause.
${historyBlock}
=== USER QUESTION ===
"${question}"

Generate the JSON response now:`;
}

module.exports = {
  buildText2SqlPrompt,
};
