const hedisService = require("../services/hedis.service");

exports.evaluateChart = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const { subdomain } = req.tenant;

    if (!req.file) {
      return res.status(400).json({ error: "No chart file uploaded." });
    }

    console.log(`Evaluating chart for patient ${patientId} in tenant ${subdomain}`);

    // Verify patient exists before proceeding
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`
      });
    }

    const evaluations = await hedisService.evaluatePatientChart(
      patientId,
      req.file,
      subdomain,
      req.db
    );

    res.json({
      message: "Chart evaluation completed successfully",
      patient_id: patientId,
      evaluations
    });
  } catch (err) {
    console.error("HEDIS Evaluation Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getEvaluations = async (req, res) => {
  try {
    const { id: patientId } = req.params;

    // Verify patient exists before proceeding
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`
      });
    }

    const evaluations = await hedisService.getEvaluations(req.db, patientId);

    res.json({
      patient_id: patientId,
      evaluations
    });
  } catch (err) {
    console.error("Get HEDIS Evaluations Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
