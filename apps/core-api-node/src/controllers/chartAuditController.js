// controllers/chartAuditController.js

/**
 * GET Chart Audit information
 * Returns metadata about chart processing including user name, role, timestamp, duration, IP address, project name, chart id, and patient id.
 */
exports.getChartAudit = async (req, res) => {
  try {
    const startTime = Date.now();
    // Extract user info set by auth middleware (assumes req.user contains name and role)
    const userName = req.user?.name || "unknown";
    const userRole = req.user?.role || "unknown";
    // IP address (handling proxies)
    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    // Timestamp when the request is processed
    const timestamp = new Date().toISOString();
    // Example: project, chart, patient IDs may come from query parameters
    const projectName = req.query.project || "unknown";
    const chartId = req.query.chartId || "unknown";
    const patientId = req.query.patientId || "unknown";
    // Simulate fetching additional data (placeholder)
    const additionalData = {
      // In a real implementation you would query the DB for these entities.
    };
    const durationMs = Date.now() - startTime;
    const response = {
      userName,
      userRole,
      ipAddress,
      timestamp,
      durationMs,
      projectName,
      chartId,
      patientId,
      ...additionalData
    };
    return res.status(200).json({ success: true, message: "Chart audit data fetched", data: response });
  } catch (err) {
    console.error("Chart Audit Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};
