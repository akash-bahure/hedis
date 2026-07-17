const clientService = require("../services/client.service");

// CREATE
exports.createClient = async (req, res) => {
  try {
    const requiredFields = [
      "org_name",
      "short_code",
      "region",
      "status",
      "contract_type",
      "measure_year",
      "total_charts",
      "start_date",
      "due_date",
      "primary_contact_name",
      "email",
      "phone",
      "abstractors_assigned",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const data = await clientService.createClient(req.db, req.body);

    res.status(201).json({
      message: "Client created successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

//get clinets
exports.getClients = async (req, res) => {
  try {
    const {
      search,
      status,
      region,
      contract_type,
      measure_year,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await clientService.getClients(req.db, {
      search,
      status,
      region,
      contract_type,
      measure_year,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.json({
      message: "Clients fetched successfully",
      ...result,
    });
  } catch (err) {
    console.error("HEDIS Get Clients Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/hedis-clients/:id
 * Single client profile with all dynamic calculations
 */
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(req.db, id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({
      message: "Client fetched successfully",
      data: client,
    });
  } catch (err) {
    console.error("HEDIS Get Client By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/hedis-clients/:clientId/measure-progress
 * Return aggregated measure progress for the selected client.
 */
exports.getClientMeasureProgress = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page, limit } = req.query;

    // Validate client existence in tenant schema
    const clientCheck = await req.db.query(
      `SELECT id FROM clients WHERE id = $1`,
      [clientId]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Client with ID ${clientId} not found.`,
      });
    }

    const result = await clientService.getClientMeasureProgress(
      req.db,
      clientId,
      {
        page,
        limit,
      }
    );

    res.json({
      message: "Client measure progress fetched successfully",
      ...result,
    });
  } catch (err) {
    console.error("HEDIS Get Client Measure Progress Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/hedis-clients/stats
 * Dashboard summary stats (Total Clients, Active, Charts Assigned, Completion Rate, At Risk)
 */
exports.getClientStats = async (req, res) => {
  try {
    const stats = await clientService.getClientStats(req.db);

    res.json({
      message: "Client stats fetched successfully",
      data: stats,
    });
  } catch (err) {
    console.error("HEDIS Get Client Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateClient = async (req, res) => {
  try {
    const data = await clientService.updateClient(
      req.db,
      req.params.id,
      req.body
    );

    res.json({
      message: "Client updated successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// DELETE
exports.deleteClient = async (req, res) => {
  try {
    await clientService.deleteClient(req.db, req.params.id);

    res.json({
      message: "Client deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// EXPORT ALL (CSV / PDF)
exports.exportClients = async (req, res) => {
  try {
    const format = req.query.format || "csv";

    const exportData = await clientService.exportClients(req.db, format);

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="clients.pdf"'
      );

      res.send(exportData);
    } else {
      res.setHeader("Content-Type", "text/csv");

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="clients.csv"'
      );

      res.send(exportData);
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

/**
 * GET /api/hedis-clients/:clientId/recent-activity
 * Return chronological activity timeline for the selected client.
 */
exports.getClientRecentActivity = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page, limit } = req.query;

    // Validate client existence
    const clientCheck = await req.db.query(
      `SELECT id FROM clients WHERE id = $1`,
      [clientId]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Client with ID ${clientId} not found.`,
      });
    }

    const result = await clientService.getClientRecentActivity(
      req.db,
      clientId,
      {
        page,
        limit,
      }
    );

    res.json({
      message: "Client recent activity fetched successfully",
      ...result,
    });
  } catch (err) {
    console.error("HEDIS Get Client Recent Activity Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/hedis-clients/export
 * Export FULL profile report for a specific client
 */
exports.exportClientReport = async (req, res) => {
  try {
    const { clientId } = req.query;

    if (!clientId) {
      return res
        .status(400)
        .json({ error: "clientId query parameter is required" });
    }

    const csvData = await clientService.exportClientReport(req.db, clientId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=client-full-report-${clientId}.csv`
    );
    res.send(csvData);
  } catch (err) {
    console.error("HEDIS Export Client Report Error:", err);
    res.status(500).json({ error: err.message });
  }
};
