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
