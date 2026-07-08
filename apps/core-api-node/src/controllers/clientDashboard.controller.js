const clientDashboardService = require("../services/clientDashboard.service");

// CREATE
exports.createClientV2 = async (req, res) => {
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
      "abstractors_assigned"
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Phone Validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (req.body.phone && !phoneRegex.test(req.body.phone)) {
      return res.status(400).json({ error: "Invalid phone format" });
    }

    const data = await clientDashboardService.createClientV2(req.db, req.body);

    res.status(201).json({
      message: "Client created successfully",
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL (with filters)
exports.getClientsV2 = async (req, res) => {
  try {
    const data = await clientDashboardService.getClientsV2(req.db, req.query);
    res.json({
      message: "Clients fetched successfully",
      ...data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Stats API
exports.getClientStatsV2 = async (req, res) => {
  try {
    const stats = await clientDashboardService.getClientStatsV2(req.db);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
exports.getClientByIdV2 = async (req, res) => {
  try {
    const data = await clientDashboardService.getClientByIdV2(req.db, req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
