exports.createProject = async (req, res) => {
  try {
    const {
      project_name,
      client_id,
      project_type,
      specialty,
      priority,
      notes,
      start_date,
      end_date,
      project_manager_id,
    } = req.body;

    // Required Fields Validation
    if (!project_name || !client_id || !start_date || !end_date) {
      return res.status(400).json({
        error: "Missing required fields: project_name, client_id, start_date, end_date are required.",
      });
    }

    const query = `
      INSERT INTO projects (
        project_name, client_id, project_type, specialty, priority, notes, start_date, end_date,
        project_manager_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      project_name,
      client_id,
      project_type || null,
      specialty || null,
      priority || 'High',
      notes || null,
      start_date,
      end_date,
      project_manager_id || null,
    ];

    const result = await req.db.query(query, values);
    res.status(201).json({ message: "Project created successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { search, client_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM projects WHERE 1=1";
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND project_name ILIKE $${values.length}`;
    }

    if (client_id) {
      values.push(client_id);
      query += ` AND client_id = $${values.length}`;
    }

    // Count query
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS temp`;
    const countResult = await req.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Add pagination
    values.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${values.length}`;
    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await req.db.query(query, values);

    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const result = await req.db.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const fields = req.body;
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    let query = "UPDATE projects SET ";
    const values = [];
    const setClauses = [];

    Object.keys(fields).forEach((key, index) => {
      setClauses.push(`${key} = $${index + 1}`);
      values.push(fields[key]);
    });

    query += setClauses.join(", ");
    query += `, updated_at = CURRENT_TIMESTAMP`;

    values.push(req.params.id);
    query += ` WHERE id = $${values.length} RETURNING *`;

    const result = await req.db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project updated successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const result = await req.db.query("DELETE FROM projects WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ message: "Project deleted successfully", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
