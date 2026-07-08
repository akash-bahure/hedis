const recentActivityService = require("../services/recentActivity.service");

/**
 * Get Recent Activities - Project Wide (for Admin / Program Manager)
 */
exports.getRecentActivities = async (req, res) => {
  try {
    const { schema_name: schema } = req.tenant;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const result = await recentActivityService.getRecentActivities(
      req.db,
      schema,
      { page, limit }
    );

    return res.status(200).json({
      success: true,
      message: "Recent activities fetched successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("Get Recent Activities Error:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching recent activities.",
    });
  }
};
