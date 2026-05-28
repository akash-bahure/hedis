// controllers/sessionManagementV2Controller.js

// Enum definitions for Session Management
const SESSION_TIMEOUT_ENUM = ["30", "15minutes", "1hr", "2hr"];
const MAX_CONCURRENT_ENUM = ["1 session", "2 sessions", "5 sessions"];

/**
 * GET Session Management Settings (v2)
 * Returns current session timeout, max concurrent sessions, and boolean settings.
 */
exports.getSessionManagement = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const result = await req.db.query(
      `SELECT session_timeout, max_concurrent_sessions, idle_session_logout, session_ip_binding, remember_me FROM ${schema}.session_management_policies LIMIT 1`
    );
    if (result.rows.length === 0) {
      // Insert default if missing
      await req.db.query(`INSERT INTO ${schema}.session_management_policies (session_timeout, max_concurrent_sessions) VALUES ('30', '1 session')`);
      const fresh = await req.db.query(`SELECT session_timeout, max_concurrent_sessions FROM ${schema}.session_management_policies LIMIT 1`);
      return res.status(200).json({ success: true, message: "Session management settings fetched", data: fresh.rows[0] });
    }
    return res.status(200).json({ success: true, message: "Session management settings fetched", data: result.rows[0] });
  } catch (err) {
    console.error("GET Session Management Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

/**
 * UPDATE Session Management Settings (v2)
 * Allows updating session_timeout, max_concurrent_sessions, idle_session_logout, session_ip_binding, and remember_me.
 */
exports.updateSessionManagement = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { session_timeout, max_concurrent_sessions, idle_session_logout, session_ip_binding, remember_me } = req.body;
    // Validation for enums
    if (session_timeout && !SESSION_TIMEOUT_ENUM.includes(session_timeout)) {
      return res.status(400).json({ success: false, message: `Invalid session_timeout. Allowed: ${SESSION_TIMEOUT_ENUM.join(", ")}` });
    }
    if (max_concurrent_sessions && !MAX_CONCURRENT_ENUM.includes(max_concurrent_sessions)) {
      return res.status(400).json({ success: false, message: `Invalid max_concurrent_sessions. Allowed: ${MAX_CONCURRENT_ENUM.join(", ")}` });
    }
    const check = await req.db.query(`SELECT id FROM ${schema}.session_management_policies LIMIT 1`);
    let result;
    if (check.rows.length === 0) {
      const query = `INSERT INTO ${schema}.session_management_policies (session_timeout, max_concurrent_sessions, idle_session_logout, session_ip_binding, remember_me, updated_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`;
      result = await req.db.query(query, [session_timeout || null, max_concurrent_sessions || null, idle_session_logout ?? false, session_ip_binding ?? false, remember_me ?? false]);
    } else {
      const id = check.rows[0].id;
      const query = `UPDATE ${schema}.session_management_policies SET session_timeout = COALESCE($1, session_timeout), max_concurrent_sessions = COALESCE($2, max_concurrent_sessions), idle_session_logout = COALESCE($3, idle_session_logout), session_ip_binding = COALESCE($4, session_ip_binding), remember_me = COALESCE($5, remember_me), updated_at = NOW() WHERE id = $6 RETURNING *`;
      result = await req.db.query(query, [session_timeout || null, max_concurrent_sessions || null, idle_session_logout ?? null, session_ip_binding ?? null, remember_me ?? null, id]);
    }
    return res.status(200).json({ success: true, message: "Session management settings updated", data: result.rows[0] });
  } catch (err) {
    console.error("UPDATE Session Management Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};
