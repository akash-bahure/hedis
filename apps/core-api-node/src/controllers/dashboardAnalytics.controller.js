const service = require("../services/dashboardAnalytics.service");

/**
 * GET /api/dashboard/abstraction-velocity
 * Retrieves velocity data showing charts abstracted vs AI assisted.
 */
exports.getAbstractionVelocity = async (req, res) => {
  try {
    const { days = 14 } = req.query;
    const daysParsed = parseInt(days, 10);

    if (isNaN(daysParsed) || ![7, 14, 30].includes(daysParsed)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid query parameter 'days'. Allowed values are 7, 14, or 30.",
      });
    }

    const data = await service.getAbstractionVelocity(
      req.db,
      req.tenant.schema_name,
      {
        days: daysParsed,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Abstraction velocity data retrieved successfully",
      data,
    });
  } catch (err) {
    console.error("Get Abstraction Velocity Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/queue-by-domain
 * Retrieves count and percentage of active queue measures grouped by domain.
 */
exports.getQueueByDomain = async (req, res) => {
  try {
    const { measurementYear, search } = req.query;
    const filters = {
      measurementYear: measurementYear?.trim() || null,
      search: search?.trim() || null,
    };

    const data = await service.getQueueByDomain(
      req.db,
      req.tenant.schema_name,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Queue by domain distribution retrieved successfully",
      data,
    });
  } catch (err) {
    console.error("Get Queue By Domain Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/measure-rates
 * Returns HEDIS measure performance statistics: current rate, target rate, YOY, benchmark.
 */
exports.getMeasureRates = async (req, res) => {
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

    const { measurementYear, search } = req.query;
    const filters = {
      measurementYear: measurementYear?.trim() || null,
      search: search?.trim() || null,
    };

    const result = await service.getMeasureRates(
      req.db,
      req.tenant.schema_name,
      { page, limit, filters }
    );

    return res.status(200).json({
      success: true,
      message: "HEDIS measure rates retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get Measure Rates Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/queue-by-measure
 * Returns abstraction queue workload breakdown grouped by HEDIS measure.
 */
exports.getQueueByMeasure = async (req, res) => {
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

    const { measurementYear, search } = req.query;
    const filters = {
      measurementYear: measurementYear?.trim() || null,
      search: search?.trim() || null,
    };

    const result = await service.getQueueByMeasure(
      req.db,
      req.tenant.schema_name,
      { page, limit, filters }
    );

    return res.status(200).json({
      success: true,
      message: "Queue by measure retrieved successfully",
      data: result.data,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get Queue By Measure Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/stats
 * Returns dashboard summary statistics (Open Queue, Completed Today, Overall HEDIS Rate, AI Assist Rate, SLA Compliance)
 * along with trend comparative metrics.
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { measurementYear, search } = req.query;
    const filters = {
      measurementYear: measurementYear?.trim() || null,
      search: search?.trim() || null,
    };

    const data = await service.getDashboardStats(
      req.db,
      req.tenant.schema_name,
      filters
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data,
    });
  } catch (err) {
    console.error("Get Dashboard Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/abstraction-deadlines
 * Returns open HEDIS measure gaps grouped by measure code with SLA deadline tracking.
 * Each measure shows: open count, done count, nearest due date, remaining days, completion %.
 */
exports.getAbstractionDeadlines = async (req, res) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const page = parseInt(page_no, 10);
    const limit = parseInt(page_size, 10);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_no'. Must be a positive integer.",
      });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_size'. Must be between 1 and 100.",
      });
    }

    const { measurementYear, search } = req.query;
    const filters = {
      measurementYear: measurementYear?.trim() || null,
      search: search?.trim() || null,
    };

    const result = await service.getAbstractionDeadlines(
      req.db,
      req.tenant.schema_name,
      { page, limit, filters }
    );

    return res.status(200).json({
      success: true,
      message: "Upcoming abstraction deadlines retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get Abstraction Deadlines Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/my-queue
 * Returns the currently authenticated user's assigned patient/chart queue.
 * Derives chartStatus from patient stage and latest QA decision.
 * Returns patients.measure (full HEDIS year string, e.g. "HEDIS MY2025") as the measure field.
 */
exports.getMyQueue = async (req, res) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const page = parseInt(page_no, 10);
    const limit = parseInt(page_size, 10);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_no'. Must be a positive integer.",
      });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_size'. Must be between 1 and 100.",
      });
    }

    // Extract authenticated user ID from JWT payload (set by auth middleware)
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

    const result = await service.getMyQueue(
      req.db,
      req.tenant.schema_name,
      { page, limit, filters, userId }
    );

    return res.status(200).json({
      success: true,
      message: "My queue retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get My Queue Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * GET /api/dashboard/user-queue
 * Flat patient queue for the authenticated user.
 * One row per patient — no measure/evaluation expansion.
 * "measure" field = patients.measure (HEDIS year string, e.g. "HEDIS MY2025").
 * chartStatus derived from patients.stage + latest QA decision.
 */
exports.getUserQueue = async (req, res) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const page = parseInt(page_no, 10);
    const limit = parseInt(page_size, 10);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_no'. Must be a positive integer.",
      });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page_size'. Must be between 1 and 100.",
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
};
