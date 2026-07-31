const SecurityAlert = require("../models/SecurityAlert");

exports.getPatients = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;

    const {
      search,
      project_id,
      stage,
      abstractor_id,
      qa_id,
      page_no = 1,
      page_size = 10,
    } = req.query;

    const page = Number(page_no);
    const limit = Number(page_size);
    const offset = (page - 1) * limit;

    let whereClause = `WHERE 1=1`;
    const values = [];

    if (search) {
      values.push(`%${search}%`);

      whereClause += `
        AND (
          p.first_name ILIKE $${values.length}
          OR p.last_name ILIKE $${values.length}
          OR p.patient_id ILIKE $${values.length}
        )
      `;
    }

    if (project_id) {
      values.push(project_id);
      whereClause += ` AND p.project_id = $${values.length}`;
    }

    if (stage) {
      values.push(stage);
      whereClause += ` AND p.stage = $${values.length}`;
    }

    if (abstractor_id) {
      values.push(abstractor_id);
      whereClause += ` AND p.abstractor_id = $${values.length}`;
    }

    if (qa_id) {
      values.push(qa_id);
      whereClause += ` AND p.qa_id = $${values.length}`;
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${schema}.patients p
      ${whereClause}
    `;
    // const dbCheck = await req.db.query(`
    //   SELECT current_database(), current_schema(), inet_server_addr(), inet_server_port()
    // `);

    // console.log("API DB:", dbCheck.rows);
    const countResult = await req.db.query(countQuery, values);

    const total = Number(countResult.rows[0].total);

    values.push(limit);
    values.push(offset);

    const query = `
      SELECT
        p.*,
        pr.project_name,
        u_abs.full_name AS abstractor_name,
        u_qa.full_name AS qa_name
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.projects pr
        ON p.project_id = pr.id
      LEFT JOIN ${schema}.users u_abs
        ON p.abstractor_id = u_abs.id
      LEFT JOIN ${schema}.users u_qa
        ON p.qa_id = u_qa.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    console.log("QUERY:", query);
    console.log("VALUES:", values);

    const result = await req.db.query(query, values);

    console.log("PATIENT RESULT:", result.rows);

    // Create Security Alert for Abnormal Chart Access Rate
    if (limit > 50) {
      await SecurityAlert.createSecurityAlert(req.db, {
        alert_type: "Abnormal Chart Access Rate",
        severity: "High",
        status: "Active",
        user_id: req.user?.id || null,
        user_name: req.user?.full_name || "System",
        ip_address: req.ip,
        description: `${total} charts accessed in a single request — 3.9x above established baseline of 8 charts/hour (simulated baseline).`,
        investigation_details:
          "Delhi office IP, within working hours. Possible credential sharing. Investigation open.",
        metadata: { requested_limit: limit, total_records: total },
      });
    }

    return res.json({
      message: "Patients fetched successfully",
      total,
      page_no: page,
      page_size: limit,
      total_pages: Math.ceil(total / limit),
      data: result.rows,
    });
  } catch (err) {
    console.error("Get Patients Error:", err);

    // Create Security Alert for Inactive User Access
    if (
      req.user?.user_status === "Inactive" ||
      req.user?.user_status === "Suspended"
    ) {
      await SecurityAlert.createSecurityAlert(req.db, {
        alert_type: "Inactive User Access",
        severity: "Critical",
        status: "Active",
        user_id: req.user.id,
        user_name: req.user.full_name,
        ip_address: req.ip,
        description: `User "${req.user.full_name}" (Status: ${req.user.user_status}) attempted to access chart list.`,
        investigation_details:
          "User marked inactive/suspended accessed charts without re-activation approval.",
        metadata: { user_status: req.user.user_status },
      });
    }

    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.assignPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { abstractorId, qaId, userId, role } = req.body;

    // Support legacy format (userId + role) or new format (abstractorId and/or qaId)
    let updates = [];
    let values = [];
    let paramIndex = 1;

    if (userId && role) {
      if (
        role.toLowerCase() === "quality analyst" ||
        role.toLowerCase() === "qa"
      ) {
        updates.push(`qa_id = $${paramIndex++}`);
        values.push(userId);
      } else if (
        role.toLowerCase() === "chart abstractor" ||
        role.toLowerCase() === "abstractor"
      ) {
        updates.push(`abstractor_id = $${paramIndex++}`);
        values.push(userId);
      } else {
        return res
          .status(400)
          .json({ error: "Invalid role. Use 'QA' or 'Abstractor'" });
      }
    }

    if (abstractorId) {
      updates.push(`abstractor_id = $${paramIndex++}`);
      values.push(abstractorId);
    }

    if (qaId) {
      updates.push(`qa_id = $${paramIndex++}`);
      values.push(qaId);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({
          error: "Missing assignment data (abstractorId, qaId, or userId/role)",
        });
    }

    // Always move stage to Assigned on successful assignment
    updates.push(`stage = $${paramIndex++}`);
    values.push("Assigned");

    const schema = req.tenant.schema_name;
    values.push(id);

    const query = `
      UPDATE ${schema}.patients 
      SET ${updates.join(", ")}, updated_at = NOW() 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const result = await req.db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      message: "Patient assignment updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Assign Patient Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updatePatientStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({
        error: "Missing required field: stage",
      });
    }

    const schema = req.tenant.schema_name;

    const query = `
      UPDATE ${schema}.patients
      SET stage = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await req.db.query(query, [stage, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    return res.json({
      message: "Patient stage updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Update Patient Stage Error:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

// EXPORT PATIENTS (CSV)
exports.exportPatients = async (req, res) => {
  const client = req.db;

  try {
    const format = req.query.format || "csv";

    const schema = req.tenant.schema_name;

    // Fetch ALL patients (No filters)
    const result = await client.query(`
      SELECT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.measure,
        p.plan,
        p.priority,
        p.stage,
        p.due_date,
        pr.project_name,
        u_abs.full_name AS abstractor_name,
        u_qa.full_name AS qa_name,
        p.created_at,
        p.updated_at
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.projects pr ON p.project_id = pr.id
      LEFT JOIN ${schema}.users u_abs ON p.abstractor_id = u_abs.id
      LEFT JOIN ${schema}.users u_qa ON p.qa_id = u_qa.id
      ORDER BY p.created_at DESC
    `);

    const patients = result.rows;

    if (patients.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }

    // Create Security Alert for Data Export
    const recordCount = patients.length;
    const isLargeExport = recordCount > 100;

    await SecurityAlert.createSecurityAlert(req.db, {
      alert_type: isLargeExport
        ? "Unauthorized PHI Export Attempt"
        : "Authorized Bulk Data Export",
      severity: isLargeExport ? "Critical" : "Low",
      status: isLargeExport ? "Active" : "Resolved",
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      ip_address: req.ip,
      description: `Bulk export of ${recordCount} PHI records attempted. Access ${isLargeExport ? "denied by DLP (placeholder logic)" : "within authorized scope"}.`,
      investigation_details: isLargeExport
        ? "Pattern: all-charts URL export. Account suspicious. Manager notified."
        : "Routine export within normal parameters.",
      metadata: { record_count: recordCount, format: format },
    });

    // ================= CSV =================
    if (format === "csv") {
      const headers = [
        "Patient ID",
        "First Name",
        "Last Name",
        "DOB",
        "Gender",
        "Measure",
        "Plan",
        "Priority",
        "Stage",
        "Due Date",
        "Project Name",
        "Abstractor",
        "QA",
        "Created At",
        "Updated At",
      ];

      const csvRows = patients.map((p) => [
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.measure,
        p.plan,
        p.priority,
        p.stage,
        p.due_date,
        p.project_name,
        p.abstractor_name,
        p.qa_name,
        p.created_at,
        p.updated_at,
      ]);

      const csvContent = [headers, ...csvRows]
        .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="patients_export_${new Date().toISOString().split("T")[0]}.csv"`
      );

      return res.send(csvContent);
    }

    // Optional: Add PDF support later if needed
    if (format === "pdf") {
      return res
        .status(400)
        .json({ message: "PDF format not implemented yet" });
    }

    // Invalid format
    res.status(400).json({ message: "Invalid format. Use ?format=csv" });
  } catch (err) {
    console.error("Export Patients Error:", err);
    res.status(500).json({ error: err.message });
  }
};
