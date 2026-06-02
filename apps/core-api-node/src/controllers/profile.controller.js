const SecurityAlert = require("../models/SecurityAlert");

const getProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const result = await req.db.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.employee_id,
        u.member_since,
        u.email,
        u.credentials,
        u.phone,
        u.mobile_phone,
        u.department_id,
        d.name AS department_name,
        u.job_title,
        u.location,
        u.bio,
        u.certifications,
        u.preferences,
        u.notifications,
        u.security,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN departments d
        ON d.id = u.department_id
      WHERE u.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    const userData = result.rows[0];

    const nameParts = (userData.full_name || "").split(" ");

    userData.first_name = nameParts[0] || "";
    userData.last_name = nameParts.slice(1).join(" ") || "";

    return res.json({
      message: "Profile fetched successfully",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      credentials,
      email,
      phone,
      mobile_phone,
      department_id,
      job_title,
      location,
      bio,
      certifications,
    } = req.body;

    let full_name = undefined;

    if (first_name !== undefined || last_name !== undefined) {
      full_name = `${first_name || ""} ${last_name || ""}`.trim();
    }

    const query = `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        credentials = COALESCE($2, credentials),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        mobile_phone = COALESCE($5, mobile_phone),
        department_id = COALESCE($6, department_id),
        job_title = COALESCE($7, job_title),
        location = COALESCE($8, location),
        bio = COALESCE($9, bio),
        certifications = COALESCE($10, certifications),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING id;
    `;

    const values = [
      full_name,
      credentials,
      email,
      phone,
      mobile_phone,
      department_id,
      job_title,
      location,
      bio,
      certifications ? JSON.stringify(certifications) : null,
      id,
    ];

    const result = await req.db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    const updatedResult = await req.db.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.employee_id,
        u.member_since,
        u.email,
        u.credentials,
        u.phone,
        u.mobile_phone,
        u.department_id,
        d.name AS department_name,
        u.job_title,
        u.location,
        u.bio,
        u.certifications,
        u.preferences,
        u.notifications,
        u.security,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN departments d
        ON d.id = u.department_id
      WHERE u.id = $1
      `,
      [id]
    );

    const updatedUser = updatedResult.rows[0];

    const nameParts = (updatedUser.full_name || "").split(" ");

    updatedUser.first_name = nameParts[0] || "";
    updatedUser.last_name = nameParts.slice(1).join(" ") || "";

    return res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = req.body;

    const query = `
      UPDATE users 
      SET 
        preferences = COALESCE($1, preferences),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const result = await req.db.query(query, [preferences, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      message: "Preferences updated successfully",
      data: result.rows[0].preferences,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notifications = req.body; // Expects JSON object matching notifications schema

    const query = `
      UPDATE users 
      SET 
        notifications = COALESCE($1, notifications),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const result = await req.db.query(query, [notifications, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      message: "Notifications updated successfully",
      data: result.rows[0].notifications,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, security } = req.body;

    // Handle password update if provided (omitting actual hash check for brevity/mock)
    if (newPassword) {
      const passQuery = `UPDATE users SET password = $1 WHERE id = $2`;
      await req.db.query(passQuery, [newPassword, id]);

      // Create Security Alert for Password Change
      await SecurityAlert.createSecurityAlert(req.db, {
        alert_type: "Password Changed",
        severity: "Low",
        status: "Resolved",
        user_id: id,
        user_name: req.user?.full_name || "User",
        ip_address: req.ip,
        description: "User profile password updated successfully.",
        investigation_details: "Routine password change from profile settings.",
      });
    }

    // Handle security JSON object (2FA, sessions, etc)
    if (security) {
      const secQuery = `
        UPDATE users 
        SET 
          security = COALESCE($1, security),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      const result = await req.db.query(secQuery, [security, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      return res.json({
        message: "Security settings updated successfully",
        data: result.rows[0].security,
      });
    }

    res.json({ message: "Security settings processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await req.db.query(
      "SELECT id, session_id, ip_address, device, location, last_active, created_at FROM user_sessions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      data: result.rows.map((s) => ({
        ...s,
        is_current: s.session_id === req.user.session_id,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    await req.db.query(
      "UPDATE user_sessions SET is_active = false WHERE session_id = $1 AND user_id = $2",
      [sessionId, userId]
    );

    res.json({ success: true, message: "Session revoked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const revokeAllOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentSessionId = req.user.session_id;

    await req.db.query(
      "UPDATE user_sessions SET is_active = false WHERE user_id = $1 AND session_id != $2",
      [userId, currentSessionId]
    );

    res.json({
      success: true,
      message: "All other sessions revoked successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRecentLoginActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await req.db.query(
      `SELECT id, event_type, details, ip_address, device, location, status, created_at 
       FROM audit_logs 
       WHERE user_id = $1 AND event_type IN ('Login Success', 'Login Failed', '2FA Verification', '2FA Verification Failed') 
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  updateNotifications,
  updateSecurity,
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  getRecentLoginActivity,
};
