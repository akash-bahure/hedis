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

    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.assignPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId and role" });
    }

    let column;
    if (role.toLowerCase() === "quality analyst") {
      column = "qa_id";
    } else if (role.toLowerCase() === "chart abstractor") {
      column = "abstractor_id";
    } else {
      return res
        .status(400)
        .json({ error: "Invalid role. Use 'QA' or 'Abstractor'" });
    }

    const query = `
          UPDATE patients 
          SET ${column} = $1, updated_at = NOW() 
          WHERE id = $2 
          RETURNING *
        `;
    const result = await req.db.query(query, [userId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      message: `Patient successfully assigned to ${role}`,
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
