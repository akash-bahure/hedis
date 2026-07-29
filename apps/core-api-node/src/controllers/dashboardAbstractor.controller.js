const service = require("../services/dashboardAbstractor.service");

class DashboardAbstractorController {
  /**
   * GET /api/dashboard/abstractor/stats
   * Returns the 4 KPI cards for the Chart Abstractor Dashboard.
   */
  async getAbstractorStats(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const userId = req.user?.id || req.user?.userId || null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user identity could not be resolved.",
        });
      }

      const { measurementYear, search } = req.query;
      const filters = {
        measurementYear: measurementYear?.trim() || null,
        search: search?.trim() || null,
      };

      const data = await service.getAbstractorStats(
        db,
        schema,
        filters,
        userId
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(
        "[DashboardAbstractorController.getAbstractorStats] Error:",
        err
      );
      return res.status(500).json({
        success: false,
        error: "Failed to fetch abstractor stats",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/abstractor/velocity
   * Returns daily Charts Done vs AI-Assisted for the current week.
   */
  async getAbstractionVelocity(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const userId = req.user?.id || req.user?.userId || null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user identity could not be resolved.",
        });
      }

      const { measurementYear, search } = req.query;
      const filters = {
        measurementYear: measurementYear?.trim() || null,
        search: search?.trim() || null,
      };

      const data = await service.getAbstractionVelocity(
        db,
        schema,
        filters,
        userId
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(
        "[DashboardAbstractorController.getAbstractionVelocity] Error:",
        err
      );
      return res.status(500).json({
        success: false,
        error: "Failed to fetch abstraction velocity data",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/abstractor/ai-findings
   * Returns top AI-detected clinical findings for this abstractor's charts.
   */
  async getAIPreAnalysis(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const userId = req.user?.id || req.user?.userId || null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user identity could not be resolved.",
        });
      }

      const { measurementYear, search, limit = 10 } = req.query;
      const filters = {
        measurementYear: measurementYear?.trim() || null,
        search: search?.trim() || null,
      };

      const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);

      const data = await service.getAIPreAnalysis(
        db,
        schema,
        filters,
        userId,
        parsedLimit
      );
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(
        "[DashboardAbstractorController.getAIPreAnalysis] Error:",
        err
      );
      return res.status(500).json({
        success: false,
        error: "Failed to fetch AI pre-analysis findings",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/qa/user-queue
   * Flat patient queue for the authenticated user.
   */
  async getUserQueue(req, res) {
    try {
      const { page_no = 1, page_size = 10 } = req.query;
      const page = parseInt(page_no, 10);
      const limit = parseInt(page_size, 10);

      if (isNaN(page) || page < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid query parameter 'page_no'. Must be a positive integer.",
        });
      }
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid query parameter 'page_size'. Must be between 1 and 100.",
        });
      }

      const userId = req.user?.id || req.user?.userId || null;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: user identity could not be resolved.",
        });
      }

      const { measurementYear, search } = req.query;
      const filters = {
        measurementYear: measurementYear?.trim() || null,
        search: search?.trim() || null,
      };

      const result = await service.getUserQueue(
        req.db,
        req.tenant.schema_name,
        { page, limit, filters, userId }
      );

      return res.status(200).json({
        success: true,
        message: "User queue retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      console.error("Get User Queue Error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  }
}

module.exports = new DashboardAbstractorController();
