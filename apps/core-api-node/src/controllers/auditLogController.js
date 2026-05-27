const AuditLog = require("../models/AuditLog");

exports.getAllAuditLogs = async (req, res) => {
  try {
    const {
      event_type,
      risk_level,
      status,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filters = {
      event_type,
      risk_level,
      status,
      search,
      startDate,
      endDate,
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const logs = await AuditLog.getAuditLogs(req.db, filters, pagination);
    const total = await AuditLog.countAuditLogs(req.db, filters);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};

/**
 * Export Audit Logs CSV
 */
exports.exportAuditLogs = async (req, res) => {
  try {
    const { event_type, risk_level, status, search, startDate, endDate } =
      req.query;

    const filters = {
      event_type,
      risk_level,
      status,
      search,
      startDate,
      endDate,
    };

    // fetch all logs without pagination
    const logs = await AuditLog.getAuditLogs(req.db, filters, {
      page: 1,
      limit: 100000,
    });

    const headers = [
      "ID",
      "User ID",
      "User Name",
      "Event Type",
      "Details",
      "IP Address",
      "Device",
      "Location",
      "Risk Level",
      "Status",
      "Created At",
    ];

    const csvRows = [];

    csvRows.push(headers.join(","));

    logs.forEach((log) => {
      const row = [
        log.id,
        log.user_id,
        `"${(log.user_name || "").replace(/"/g, '""')}"`,
        `"${(log.event_type || "").replace(/"/g, '""')}"`,
        `"${(log.details || "").replace(/"/g, '""')}"`,
        `"${(log.ip_address || "").replace(/"/g, '""')}"`,
        `"${(log.device || "").replace(/"/g, '""')}"`,
        `"${(log.location || "").replace(/"/g, '""')}"`,
        `"${(log.risk_level || "").replace(/"/g, '""')}"`,
        `"${(log.status || "").replace(/"/g, '""')}"`,
        log.created_at,
      ];

      csvRows.push(row.join(","));
    });

    const csvData = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audit_logs_${Date.now()}.csv`
    );

    return res.status(200).send(csvData);
  } catch (error) {
    console.error("Error exporting audit logs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to export audit logs",
      error: error.message,
    });
  }
};
