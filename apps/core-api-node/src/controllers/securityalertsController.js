const AuditLog = require("../models/AuditLog");

/**
 * @desc    Get all security alerts
 * @route   GET /api/security-alerts
 * @access  Private (Admin)
 */
exports.getAlerts = async (req, res) => {
  try {
    const { severity, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM security_alerts WHERE 1=1";
    const params = [];

    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await req.db.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) FROM security_alerts WHERE 1=1";
    const countParams = [];
    if (severity) {
      countParams.push(severity);
      countQuery += ` AND severity = $${countParams.length}`;
    }
    if (status) {
      countParams.push(status);
      countQuery += ` AND status = $${countParams.length}`;
    }
    const countResult = await req.db.query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get alert stats
 * @route   GET /api/security-alerts/stats
 * @access  Private (Admin)
 */
exports.getAlertStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE severity = 'Critical') as critical,
        COUNT(*) FILTER (WHERE severity = 'High') as high,
        COUNT(*) FILTER (WHERE severity = 'Medium') as medium,
        COUNT(*) FILTER (WHERE severity = 'Low') as low,
        COUNT(*) FILTER (WHERE status = 'Active') as active_now
      FROM security_alerts;
    `;
    const result = await req.db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Get Alert Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Update alert status
 * @route   PATCH /api/security-alerts/:id/status
 * @access  Private (Admin)
 */
exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, investigation_details } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const query = `
      UPDATE security_alerts 
      SET status = $1, 
          investigation_details = COALESCE($2, investigation_details),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const result = await req.db.query(query, [
      status,
      investigation_details,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Alert not found" });
    }

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "settings",
      details: `Alert ${id} status updated to ${status}`,
      location: req.user?.location || "Unknown",

      ip_address: req.ip,
      risk_level: "Medium",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Alert Status Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Export security alerts CSV
 * @route   GET /api/security-alerts/export
 * @access  Private (Admin)
 */
exports.exportAlerts = async (req, res) => {
  try {
    const { severity, status, search, startDate, endDate } = req.query;

    let query = `
      SELECT 
        id,
        alert_type,
        severity,
        status,
        user_id,
        user_name,
        ip_address,
        description,
        investigation_details,
        metadata,
        created_at,
        updated_at
      FROM security_alerts
      WHERE 1=1
    `;

    const params = [];

    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += `
        AND (
          alert_type ILIKE $${params.length}
          OR user_name ILIKE $${params.length}
          OR description ILIKE $${params.length}
          OR ip_address ILIKE $${params.length}
        )
      `;
    }

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await req.db.query(query, params);

    const headers = [
      "ID",
      "Alert Type",
      "Severity",
      "Status",
      "User ID",
      "User Name",
      "IP Address",
      "Description",
      "Investigation Details",
      "Metadata",
      "Created At",
      "Updated At",
    ];

    const csvRows = [];

    csvRows.push(headers.join(","));

    result.rows.forEach((alert) => {
      const row = [
        alert.id,
        `"${(alert.alert_type || "").replace(/"/g, '""')}"`,
        `"${(alert.severity || "").replace(/"/g, '""')}"`,
        `"${(alert.status || "").replace(/"/g, '""')}"`,
        alert.user_id || "",
        `"${(alert.user_name || "").replace(/"/g, '""')}"`,
        `"${(alert.ip_address || "").replace(/"/g, '""')}"`,
        `"${(alert.description || "").replace(/"/g, '""')}"`,
        `"${(alert.investigation_details || "").replace(/"/g, '""')}"`,
        `"${JSON.stringify(alert.metadata || {}).replace(/"/g, '""')}"`,
        alert.created_at,
        alert.updated_at,
      ];

      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "Security Alerts Export",
      details: `Security alerts exported successfully`,
      location: req.user?.location || "Unknown",

      ip_address: req.ip,
      risk_level: "Low",
      status: "Success",
    });

    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=security_alerts_${Date.now()}.csv`
    );

    return res.status(200).send(csvData);
  } catch (error) {
    console.error("Export Security Alerts Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export security alerts",
      error: error.message,
    });
  }
};

/**
 * @desc    Block user
 * @route   POST /api/security-alerts/block-user
 * @access  Private (Admin)
 */
exports.blockUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Update user status to Suspended
    const updateResult = await req.db.query(
      "UPDATE users SET user_status = 'Suspended', is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, full_name, email",
      [userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const blockedUser = updateResult.rows[0];

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "User Blocked",
      details: `User ${blockedUser.full_name} (${blockedUser.email}) blocked. Reason: ${reason || "N/A"}`,
      location: req.user?.location || "Unknown",

      ip_address: req.ip,
      risk_level: "Critical",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      message: `User ${blockedUser.full_name} has been blocked successfully.`,
      data: blockedUser,
    });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).json({ error: error.message });
  }
};
