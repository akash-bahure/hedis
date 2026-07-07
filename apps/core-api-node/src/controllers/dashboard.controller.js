// controllers/dashboard.controller.js
const dashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const summary = await dashboardService.getSummary(req.db, schema);
    
    res.status(200).json({
      message: "Dashboard summary retrieved successfully",
      data: summary
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ error: "Failed to retrieve dashboard summary" });
  }
};

exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const deadlines = await dashboardService.getDeadlines(req.db, schema);
    
    res.status(200).json({
      message: "Upcoming abstraction deadlines retrieved successfully",
      data: deadlines
    });
  } catch (error) {
    console.error("Dashboard Deadlines Error:", error);
    res.status(500).json({ error: "Failed to retrieve abstraction deadlines" });
  }
};

exports.getMyQueue = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const userId = req.user.id;
    
    const myQueue = await dashboardService.getMyQueue(req.db, schema, userId, req.query);
    
    res.status(200).json({
      message: "My queue retrieved successfully",
      ...myQueue
    });
  } catch (error) {
    console.error("Dashboard My Queue Error:", error);
    res.status(500).json({ error: "Failed to retrieve my queue" });
  }
};
