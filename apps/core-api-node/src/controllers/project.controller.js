exports.createProject = async (req, res) => {
  try {
    const {
      project_name,
      client_id,
      project_type,
      specialty,
      priority,
      status,
      assigned_charts,
      completed_charts,
      notes,
      start_date,
      end_date,
      project_manager_id,
    } = req.body;

    // Required Fields Validation
    if (!project_name || !client_id || !start_date || !end_date) {
      return res.status(400).json({
        error:
          "Missing required fields: project_name, client_id, start_date, end_date",
      });
    }

    const pending_charts =
      (total_charts || 0) - (completed_charts || 0);

   const query = `
      INSERT INTO projects (
        project_name,
        client_id,
        project_type,
        specialty,
        priority,
        status,
        assigned_charts,
        completed_charts,
        notes,
        start_date,
        end_date,
        project_manager_id
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *;
    `;

    const values = [
      project_name,
      client_id,
      project_type || null,
      specialty || null,
      priority || "High",
      status || "Draft",
      assigned_charts || 0,
      completed_charts || 0,
      notes || null,
      start_date,
      end_date,
      project_manager_id || null,
    ];

    const result = await req.db.query(query, values);

    res.status(201).json({
      message: "Project created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const {
      search,
      client_id,
      priority,
      status,
      project_type,
      specialty,
      page_no = 1,
      page_size = 10,
    } = req.query;

    const offset = (page_no - 1) * page_size;

    let query = `
      SELECT
        p.id,
        p.project_name,
        p.project_type,
        p.specialty,
        p.priority,
        p.status,
        p.start_date,
        p.end_date,
        p.assigned_charts,
        p.completed_charts,

        (p.assigned_charts - p.completed_charts) AS pending_charts,

        CASE
          WHEN p.assigned_charts = 0 THEN 0
          ELSE ROUND(
            (p.completed_charts::decimal / p.assigned_charts) * 100,
            0
          )
        END AS completion_percentage,

        c.id as client_uuid,
        c.client_id,
        c.org_name,
        c.short_code,
        c.region,
        c.contract_type

      FROM projects p
      LEFT JOIN clients c
        ON p.client_id = c.id

      WHERE 1=1
    `;

    const values = [];

    // Search Project Name
    if (search) {
      values.push(`%${search}%`);

      query += `
        AND (
          p.project_name ILIKE $${values.length}
        )
      `;
    }

    // Client Filter
    if (client_id) {
      values.push(client_id);

      query += `
        AND p.client_id = $${values.length}
      `;
    }

    // Status Filter
    if (status) {
      values.push(status);

      query += `
        AND p.status = $${values.length}
      `;
    }

    // Project Type Filter
    if (project_type) {
      values.push(project_type);

      query += `
        AND p.project_type = $${values.length}
      `;
    }

    // Total Count
    const countQuery = `
      SELECT COUNT(*) FROM (
        ${query}
      ) AS total_projects
    `;

    const countResult = await req.db.query(countQuery, values);

    const total = parseInt(countResult.rows[0].count, 10);

    // Pagination
     values.push(page_size);

    query += `
      ORDER BY p.created_at DESC
      LIMIT $${values.length}
    `;

    values.push(offset);

    query += `
      OFFSET $${values.length}
    `;

    const result = await req.db.query(query, values);

    res.json({
      message: "Projects fetched successfully",

      total,

      page_no: parseInt(page_no, 10),

      page_size: parseInt(page_size, 10),

      total_pages: Math.ceil(total / page_size),

      data: result.rows,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
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

exports.getProjectAccessAll = async (req, res) => {
  try {
    const { department_id } = req.query;
    let whereClause = "WHERE 1=1";
    const values = [];

    if (department_id) {
      whereClause += ` AND u.department_id = $1`;
      values.push(department_id);
    }

    const query = `
      SELECT 
          u.id as uid, 
          u.full_name, 
          ur.name as role, 
          d.name as department,
          json_agg(
              json_build_object(
                  'project_id', p.id,
                  'project_name', p.project_name,
                  'access_level', COALESCE(upa.access_level, CASE WHEN p.id = ANY(u.project_access) THEN 'Full' ELSE 'None' END)
              )
          ) as project_access
      FROM users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      LEFT JOIN departments d ON u.department_id = d.id
      CROSS JOIN projects p
      LEFT JOIN user_project_access upa ON upa.user_id = u.id AND upa.project_id = p.id
      ${whereClause}
      GROUP BY u.id, ur.name, d.name
      ORDER BY u.full_name;
    `;

    const result = await req.db.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Get Project Access Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProjectAccess = async (req, res) => {
  const client = req.db;
  const { id: projectId } = req.params;
  const { user_id, access_level } = req.body;

  if (!user_id || !access_level) {
    return res.status(400).json({ error: "Missing required fields: user_id and access_level are required." });
  }

  try {
    await client.query("BEGIN");

    // 1. Upsert into user_project_access
    const upsertQuery = `
      INSERT INTO user_project_access (user_id, project_id, access_level)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, project_id)
      DO UPDATE SET access_level = EXCLUDED.access_level, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    await client.query(upsertQuery, [user_id, projectId, access_level]);

    // 2. Sync with users.project_access array
    if (access_level === 'None') {
      // Remove from array
      await client.query(
        "UPDATE users SET project_access = array_remove(project_access, $1) WHERE id = $2",
        [projectId, user_id]
      );
    } else {
      // Add to array if not present
      await client.query(
        "UPDATE users SET project_access = array_append(project_access, $1) WHERE id = $2 AND NOT ($1 = ANY(project_access))",
        [projectId, user_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Project access updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Project Access Error:", err);
    res.status(500).json({ error: err.message });
  }
};
