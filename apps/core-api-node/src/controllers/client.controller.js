const clientService = require("../services/client.service");

// CREATE
exports.createClient = async (req, res) => {
  try {
    const requiredFields = [
      "org_name", "short_code", "region", "contract_type", "measure_year",
      "total_charts", "start_date", "due_date", "primary_contact_name", "email"
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const data = await clientService.createClient(req.db, req.body);
    res.status(201).json({ message: "Client created Successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL (with filters)
exports.getClients = async (req, res) => {
  try {
    const data = await clientService.getClients(req.db, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT ALL (CSV / PDF)
exports.exportClients = async (req, res) => {
  try {
    const format = req.query.format || "csv";
    const exportData = await clientService.exportClients(req.db, format);
    
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="clients.pdf"');
      res.send(exportData);
    } else {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="clients.csv"');
      res.send(exportData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
exports.getClientById = async (req, res) => {
  try {
    const data = await clientService.getClientById(req.db, req.params.id);
    if (!data) return res.status(404).json({ message: "Client not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateClient = async (req, res) => {
  try {
    const data = await clientService.updateClient(req.db, req.params.id, req.body);
    res.json({ message: "Client updated Successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteClient = async (req, res) => {
  try {
    await clientService.deleteClient(req.db, req.params.id);
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};