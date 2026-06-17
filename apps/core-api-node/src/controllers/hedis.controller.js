const hedisService = require("../services/hedis.service");
const { v4: uuidv4 } = require("uuid");

exports.evaluateChart = async (req, res) => {
  try {
    const { id: patientId } = req.params;
    const { subdomain } = req.tenant;

    if (!req.file) {
      return res.status(400).json({ error: "No chart file uploaded." });
    }

    console.log(
      `Evaluating chart for patient ${patientId} in tenant ${subdomain}`
    );

    // Verify patient exists before proceeding
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`,
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
      evaluations,
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
        error: `Patient with ID ${patientId} not found in this organization.`,
      });
    }

    const evaluations = await hedisService.getEvaluations(req.db, patientId);

    res.json({
      patient_id: patientId,
      evaluations,
    });
  } catch (err) {
    console.error("Get HEDIS Evaluations Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.sendToQA = async (req, res) => {
  try {
    const { patientId, chartId, measureCode, measureName, notes } = req.body;

    // Fetch patient details and assigned QA
    const patientResult = await req.db.query(
      `SELECT id, first_name, last_name, qa_id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found.`,
      });
    }

    const patient = patientResult.rows[0];
    const patientName = `${patient.first_name} ${patient.last_name}`;
    const qa_assignee = patient.qa_id;

    if (!qa_assignee) {
      return res.status(400).json({
        error:
          "No Quality Analyst assigned to this patient. Please assign a QA before sending to QA queue.",
      });
    }

    const query = `
      INSERT INTO hedis_qa_queue (
        id, patient_id, patient_name, chart_id, 
        measure_code, measure_name, status, 
        qa_assignee, notes, sent_by
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Pending QA', $7, $8, $9)
      RETURNING *
    `;

    const values = [
      uuidv4(),
      patientId,
      patientName,
      chartId || null,
      measureCode,
      measureName,
      qa_assignee,
      notes || null,
      req.user?.id || null,
    ];

    const result = await req.db.query(query, values);

    res.status(201).json({
      message: "Measure successfully sent to QA",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Send to QA Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.markAsReviewed = async (req, res) => {
  try {
    const { patientId, measureCode, notes } = req.body;

    // Find the most recent record that is not already reviewed/in-review
    const findQuery = `
      SELECT id FROM hedis_qa_queue 
      WHERE patient_id = $1 AND measure_code = $2 
      AND status = 'Pending QA'
      ORDER BY sent_at DESC LIMIT 1
    `;
    const findResult = await req.db.query(findQuery, [patientId, measureCode]);

    if (findResult.rows.length === 0) {
      // If no pending record, create a new one as In Review
      const insertQuery = `
        INSERT INTO hedis_qa_queue (
          id, patient_id, measure_code, status, notes, reviewed_by, reviewed_at
        ) VALUES ($1, $2, $3, 'In Review', $4, $5, NOW())
        RETURNING *
      `;
      const insertResult = await req.db.query(insertQuery, [
        uuidv4(),
        patientId,
        measureCode,
        notes || null,
        req.user?.id || null,
      ]);
      return res.json({
        message: "Measure marked as in review",
        data: insertResult.rows[0],
      });
    }

    const updateQuery = `
      UPDATE hedis_qa_queue 
      SET status = 'In Review', 
          reviewed_at = NOW(), 
          reviewed_by = $1,
          notes = COALESCE($2, notes),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await req.db.query(updateQuery, [
      req.user?.id || null,
      notes || null,
      findResult.rows[0].id,
    ]);

    res.json({
      message: "Measure marked as in review",
      data: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Mark as Reviewed Error (Setting to In Review):", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getQAQueue = async (req, res) => {
  try {
    const { id: patientId } = req.params; // Now required as path
    const { page = 1, limit = 10, search = "", status = "" } = req.query;
    const offset = (page - 1) * limit;

    // Verify patient exists
    const patientCheck = await req.db.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        error: `Patient with ID ${patientId} not found in this organization.`,
      });
    }

    let query = `
      SELECT *, COUNT(*) OVER() as total_count
      FROM hedis_qa_queue
      WHERE patient_id = $1
    `;
    const values = [patientId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (patient_name ILIKE $${paramIndex} OR measure_code ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status !== "All") {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    query += ` ORDER BY sent_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await req.db.query(query, values);

    const data = result.rows;
    const total = data.length > 0 ? parseInt(data[0].total_count) : 0;
    const pages = Math.ceil(total / limit);

    res.json({
      patient_id: patientId,
      data,
      metadata: {
        total,
        pages,
        current_page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get QA Queue Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
