const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await req.db.query("SELECT * FROM org_users WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const userData = result.rows[0];
    
    // Split full_name for the UI
    const nameParts = (userData.full_name || "").split(" ");
    userData.first_name = nameParts[0] || "";
    userData.last_name = nameParts.slice(1).join(" ") || "";

    res.json({ message: "Profile fetched successfully", data: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      department,
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
      UPDATE org_users 
      SET 
        full_name = COALESCE($1, full_name),
        credentials = COALESCE($2, credentials),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        mobile_phone = COALESCE($5, mobile_phone),
        department = COALESCE($6, department),
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
      department,
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
      UPDATE org_users 
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
      UPDATE org_users 
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

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  updateNotifications,
};
