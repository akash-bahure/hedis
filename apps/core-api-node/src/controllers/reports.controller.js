const reportsService = require("../services/reports.service");

exports.getPlanPerformance = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const data = await reportsService.getPlanPerformance(req.db, schema);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Plan Performance Error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve plan performance data" });
  }
};

exports.getQaOutcomes = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const data = await reportsService.getQaOutcomes(req.db, schema);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("QA Outcomes Error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve QA outcomes data" });
  }
};