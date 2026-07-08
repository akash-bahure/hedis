const clientDashboardService = require("../services/clientDashboard.service");

// CREATE
exports.createClientV2 = async (req, res) => {
  try {
    const db = req.db;
    
    // Map Frontend Modal fields to DB Schema fields
    const {
      client_name,
      plan_type,
      contract_id,
      program_year,
      contact_name,
      contact_email
    } = req.body;

    if (!client_name || !contact_email) {
      return res.status(400).json({ error: "Missing required fields: client_name, contact_email" });
    }

    const mappedData = {
      org_name: client_name,
      short_code: contract_id || "N/A", // Map Contract ID to short_code
      plan_tier: "Professional", // Defaulting as plan_type doesn't match constraint
      contract_type: plan_type === "Medicare" ? "HEDIS Electronic" : "HEDIS Hybrid", // Example mapping
      measure_year: program_year || "MY2026",
      primary_contact_name: contact_name || "N/A",
      email: contact_email,
      status: "Onboarding",
      region: "West", // Required by DB
      total_charts: 0, // Required by DB
      start_date: new Date().toISOString().split("T")[0], // Required by DB
      due_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0], // Required by DB
    };

    const newClient = await clientDashboardService.createClientV2(db, mappedData);
    res.status(201).json({ message: "Client created successfully", data: newClient });
  } catch (error) {
    console.error("Create Client V2 Error:", error);
    res.status(500).json({ error: error.message });
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
