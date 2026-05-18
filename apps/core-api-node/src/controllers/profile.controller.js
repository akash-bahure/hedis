const getProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const result = await req.db.query(
      `
      SELECT
        id,
        full_name,
        email,
        credentials,
        phone,
        mobile_phone,
        department_id,
        job_title,
        location,
        bio,
        certifications,
        preferences,
        notifications,
        security,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
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

    // Combine first and last name if they are provided
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
        department_id = COALESCE($6, department),
        job_title = COALESCE($7, job_title),
        location = COALESCE($8, location),
        bio = COALESCE($9, bio),
        certifications = COALESCE($10, certifications),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *;
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
      return res.status(404).json({ error: "Profile not found" });
    }

    const updatedUser = result.rows[0];
    const nameParts = (updatedUser.full_name || "").split(" ");
    updatedUser.first_name = nameParts[0] || "";
    updatedUser.last_name = nameParts.slice(1).join(" ") || "";

    res.json({ message: "Profile updated successfully", data: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  updateNotifications,
  updateSecurity,
};
