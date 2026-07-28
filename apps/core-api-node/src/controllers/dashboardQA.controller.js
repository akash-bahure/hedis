const dashboardQAService = require("../services/dashboardQA.service");

class DashboardQAController {
  /**
   * GET /api/dashboard/qa/stats
   * Retrieves QA Dashboard KPI metrics (Pending, Reviewed Today, Returned, Approval Rate).
   */
  async getQAStats(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const filters = {
        measurementYear: req.query.measurementYear,
        search: req.query.search,
      };

      const data = await dashboardQAService.getQAStats(db, schema, filters);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("[DashboardQAController.getQAStats] Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch QA stats",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/qa/throughput
   * Retrieves weekly QA review vs returned throughput chart data.
   */
  async getQAThroughput(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const filters = {
        measurementYear: req.query.measurementYear,
        search: req.query.search,
      };

      const data = await dashboardQAService.getQAThroughput(
        db,
        schema,
        filters
      );
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("[DashboardQAController.getQAThroughput] Error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch QA review throughput data",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/qa/discrepancy-types
   * Retrieves QA discrepancy types breakdown, totals, percentages, and top issue.
   */
  async getQADiscrepancyTypes(req, res) {
    try {
      const db = req.db;
      const schema = req.tenant?.schema_name || "public";
      const filters = {
        measurementYear: req.query.measurementYear,
        search: req.query.search,
      };

      const data = await dashboardQAService.getQADiscrepancyTypes(
        db,
        schema,
        filters
      );
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error(
        "[DashboardQAController.getQADiscrepancyTypes] Error:",
        err
      );
      return res.status(500).json({
        success: false,
        error: "Failed to fetch QA discrepancy types",
        details: err.message,
      });
    }
  }

  /**
   * GET /api/dashboard/qa/user-queue
   * Flat patient queue for the authenticated user.
   * One row per patient — no measure/evaluation expansion.
   * "measure" = patients.measure (HEDIS year string).
   * Extra fields: abstractorName, priority, submittedAt.
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

      const result = await dashboardQAService.getUserQueue(
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

module.exports = new DashboardQAController();
