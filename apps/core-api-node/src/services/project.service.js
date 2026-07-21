/**
 * GET ALL PROJECTS with dynamic calculations, filtering, sorting, and pagination
 */
exports.getProjects = async (db, queryParams) => {
  const {
    search,
    client_id,
    priority,
    status,
    project_type,
    specialty,
    measurementYear,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = queryParams;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;

  const whereClauses = [];
  const queryValues = [];
  let valueIndex = 1;

  // SEARCH FILTER
  if (search) {
    whereClauses.push(`
        (p.project_name ILIKE $${valueIndex}
         OR p.project_id ILIKE $${valueIndex}
         OR EXISTS (
           SELECT 1 FROM patients pat
           WHERE pat.project_id = p.id
             AND (
               pat.first_name ILIKE $${valueIndex}
               OR pat.last_name ILIKE $${valueIndex}
               OR pat.measure ILIKE $${valueIndex}
             )
         ))
      `);
    queryValues.push(`%${search}%`);
    valueIndex++;
  }

  // CLIENT FILTER
  if (client_id) {
    whereClauses.push(`p.client_id = $${valueIndex}`);
    queryValues.push(client_id);
    valueIndex++;
  }

  // STATUS FILTER
  if (status) {
    whereClauses.push(`p.status = $${valueIndex}`);
    queryValues.push(status);
    valueIndex++;
  }

  // PRIORITY FILTER
  if (priority) {
    whereClauses.push(`p.priority = $${valueIndex}`);
    queryValues.push(priority);
    valueIndex++;
  }

  // PROJECT TYPE FILTER
  if (project_type) {
    whereClauses.push(`p.project_type = $${valueIndex}`);
    queryValues.push(project_type);
    valueIndex++;
  }

  // SPECIALTY FILTER
  if (specialty) {
    whereClauses.push(`p.specialty = $${valueIndex}`);
    queryValues.push(specialty);
    valueIndex++;
  }

  // MEASUREMENT YEAR FILTER (patient level)
  if (measurementYear) {
    whereClauses.push(`
        EXISTS (
          SELECT 1 FROM patients pat
          WHERE pat.project_id = p.id
            AND pat.measure ILIKE $${valueIndex}
        )
      `);
    queryValues.push(`%${measurementYear.trim()}%`);
    valueIndex++;
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // TOTAL COUNT
  const countQuery = `
      SELECT COUNT(*) 
      FROM projects p
      ${whereString}
    `;
  const countResult = await db.query(countQuery, queryValues);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  // SORTING VALIDATION
  const allowedSortFields = {
    id: "p.id",
    project_id: "p.project_id",
    project_name: "p.project_name",
    client_id: "p.client_id",
    project_type: "p.project_type",
    specialty: "p.specialty",
    priority: "p.priority",
    status: "p.status",
    start_date: "p.start_date",
    end_date: "p.end_date",
    created_at: "p.created_at",
    updated_at: "p.updated_at",
    total_charts: "total_charts",
    completed_charts: "completed_charts",
    completion_percentage: "completion_percentage",
  };

  const sortColumn = allowedSortFields[sortBy] || "p.created_at";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // MAIN QUERY WITH DYNAMIC CALCULATIONS
  const dataQuery = `
      SELECT
        p.id,
        p.project_id,
        p.project_name,
        p.project_type,
        p.specialty,
        p.priority,
        p.status,
        p.notes,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        p.project_manager_id,
  
        c.id AS client_uuid,
        c.client_id,
        c.org_name,
        c.short_code,
        c.region,
        c.contract_type,
        c.status AS client_status,
  
        u.id AS project_manager_uuid,
        u.full_name AS project_manager_name,
  
        -- Dynamic Chart Calculations (Most Accurate)
        (SELECT COUNT(*) FROM patient_charts pc 
         JOIN patients pat ON pc.patient_id = pat.id 
         WHERE pat.project_id = p.id) AS total_charts,
  
        (SELECT COUNT(*) FROM patient_charts pc 
         JOIN patients pat ON pc.patient_id = pat.id 
         WHERE pat.project_id = p.id 
           AND pat.stage = 'QA Passed') AS completed_charts,
  
        COALESCE(
          CASE 
            WHEN (SELECT COUNT(*) FROM patient_charts pc 
                  JOIN patients pat ON pc.patient_id = pat.id 
                  WHERE pat.project_id = p.id) > 0
            THEN ROUND((
              (SELECT COUNT(*) FROM patient_charts pc 
               JOIN patients pat ON pc.patient_id = pat.id 
               WHERE pat.project_id = p.id AND pat.stage = 'QA Passed')::numeric / 
              (SELECT COUNT(*) FROM patient_charts pc 
               JOIN patients pat ON pc.patient_id = pat.id 
               WHERE pat.project_id = p.id)::numeric
            ) * 100, 2)
            ELSE 0 
          END, 0
        ) AS completion_percentage,
  
        -- Abstractors
        (SELECT COUNT(DISTINCT pat.abstractor_id)
         FROM patients pat 
         WHERE pat.project_id = p.id AND pat.abstractor_id IS NOT NULL) AS abstractors_assigned,
  
        (SELECT COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.full_name)) 
          FILTER (WHERE u.id IS NOT NULL), '[]'::json
        )
         FROM patients pat 
         JOIN users u ON u.id = pat.abstractor_id
         WHERE pat.project_id = p.id) AS abstractors,
  
        -- QA Users
        (SELECT COUNT(DISTINCT pat.qa_id)
         FROM patients pat 
         WHERE pat.project_id = p.id AND pat.qa_id IS NOT NULL) AS qa_assigned_count,
  
        (SELECT COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.full_name)) 
          FILTER (WHERE u.id IS NOT NULL), '[]'::json
        )
         FROM patients pat 
         JOIN users u ON u.id = pat.qa_id
         WHERE pat.project_id = p.id) AS qa_users,
  
        -- Workflow Metrics
        (SELECT COUNT(*) FROM patients pat 
         WHERE pat.project_id = p.id) AS active_patient_count,
  
        (SELECT COUNT(*) FROM patient_charts pc 
         JOIN patients pat ON pc.patient_id = pat.id 
         WHERE pat.project_id = p.id AND pat.stage = 'Unassigned') AS pending_charts,
  
        (SELECT COUNT(*) FROM patient_charts pc 
         JOIN patients pat ON pc.patient_id = pat.id 
         WHERE pat.project_id = p.id 
           AND pat.stage NOT IN ('QA Passed', 'Unassigned')) AS active_charts
  
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      ${whereString}
      ORDER BY ${sortColumn} ${direction}
      LIMIT $${valueIndex}
      OFFSET $${valueIndex + 1}
    `;

  const dataValues = [...queryValues, parsedLimit, offset];
  const result = await db.query(dataQuery, dataValues);

  // Format numbers
  const formattedRows = result.rows.map((row) => ({
    ...row,
    total_charts: parseInt(row.total_charts, 10),
    completed_charts: parseInt(row.completed_charts, 10),
    completion_percentage: parseFloat(row.completion_percentage),
    abstractors_assigned: parseInt(row.abstractors_assigned, 10),
    qa_assigned_count: parseInt(row.qa_assigned_count, 10),
    active_patient_count: parseInt(row.active_patient_count, 10),
    pending_charts: parseInt(row.pending_charts, 10),
    active_charts: parseInt(row.active_charts, 10),
    abstractors: row.abstractors || [],
    qa_users: row.qa_users || [],
  }));

  const totalPages = Math.ceil(totalCount / parsedLimit);

  return {
    data: formattedRows,
    totalCount,
    currentPage: parsedPage,
    totalPages,
    pageSize: parsedLimit,
  };
};

/**
 * GET PROJECT STATS for Dashboard
 * Returns: Total Projects, Active, At Risk, Completed + Chart Metrics
 */
exports.getProjectStats = async (db) => {
  const query = `
      WITH project_metrics AS (
        SELECT
          p.id,
          p.status,
          -- Total Charts
          (SELECT COUNT(*) 
           FROM patient_charts pc 
           JOIN patients pat ON pc.patient_id = pat.id 
           WHERE pat.project_id = p.id) AS total_charts,
          
          -- Completed Charts
          (SELECT COUNT(*) 
           FROM patient_charts pc 
           JOIN patients pat ON pc.patient_id = pat.id 
           WHERE pat.project_id = p.id 
             AND pat.stage = 'QA Passed') AS completed_charts,
  
          -- In Progress (WIP)
          (SELECT COUNT(*) 
           FROM patient_charts pc 
           JOIN patients pat ON pc.patient_id = pat.id 
           WHERE pat.project_id = p.id 
             AND pat.stage NOT IN ('Unassigned', 'QA Passed')) AS in_progress_charts,
  
          -- Pending
          (SELECT COUNT(*) 
           FROM patient_charts pc 
           JOIN patients pat ON pc.patient_id = pat.id 
           WHERE pat.project_id = p.id 
             AND pat.stage = 'Unassigned') AS pending_charts
  
        FROM projects p
      )
      SELECT
        COUNT(*) AS total_projects,
        COUNT(*) FILTER (WHERE status = 'Active') AS active_projects,
        COUNT(*) FILTER (WHERE status = 'At Risk') AS at_risk_projects,
        COUNT(*) FILTER (WHERE status = 'Completed') AS completed_projects,
        
        COALESCE(SUM(total_charts), 0) AS total_charts,
        COALESCE(SUM(completed_charts), 0) AS completed_charts,
        COALESCE(SUM(in_progress_charts), 0) AS in_progress_charts,
        COALESCE(SUM(pending_charts), 0) AS pending_charts,
  
        CASE 
          WHEN SUM(total_charts) > 0 
          THEN ROUND(
            (SUM(completed_charts)::numeric / SUM(total_charts)::numeric) * 100, 
            2
          )
          ELSE 0 
        END AS overall_completion_rate
  
      FROM project_metrics;
    `;

  const result = await db.query(query);
  const row = result.rows[0];

  return {
    totalProjects: parseInt(row.total_projects, 10),
    activeProjects: parseInt(row.active_projects, 10),
    atRiskProjects: parseInt(row.at_risk_projects, 10),
    completedProjects: parseInt(row.completed_projects, 10),

    totalCharts: parseInt(row.total_charts, 10),
    completedCharts: parseInt(row.completed_charts, 10),
    inProgressCharts: parseInt(row.in_progress_charts, 10),
    pendingCharts: parseInt(row.pending_charts, 10),

    overallCompletionRate: parseFloat(row.overall_completion_rate),
  };
};

/**
 * GET SINGLE PROJECT BY ID - Rich with all dynamic calculations
 */
exports.getProjectById = async (db, id) => {
  const query = `
    WITH project_data AS (
      SELECT
        p.id,
        p.project_id,
        p.project_name,
        p.project_type,
        p.specialty,
        p.priority,
        p.status,
        p.notes,
        p.start_date,
        p.end_date,
        p.created_at,
        p.updated_at,
        p.project_manager_id,

        c.id AS client_uuid,
        c.client_id,
        c.org_name,
        c.short_code,
        c.region,
        c.contract_type,
        c.status AS client_status,

        u.id AS project_manager_uuid,
        u.full_name AS project_manager_name

      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      WHERE p.id = $1
    ),
    chart_metrics AS (
      SELECT
        COUNT(*) AS total_charts,
        COUNT(CASE WHEN pat.stage = 'QA Passed' THEN 1 END) AS completed_charts,
        COUNT(CASE WHEN pat.stage NOT IN ('Unassigned', 'QA Passed') THEN 1 END) AS in_progress_charts,
        COUNT(CASE WHEN pat.stage = 'Unassigned' THEN 1 END) AS pending_charts,
        
        CASE 
          WHEN COUNT(*) > 0 
          THEN ROUND(
            COUNT(CASE WHEN pat.stage = 'QA Passed' THEN 1 END)::numeric / 
            COUNT(*)::numeric * 100, 
            2
          )
          ELSE 0 
        END AS completion_percentage
      FROM patient_charts pc
      JOIN patients pat ON pc.patient_id = pat.id
      WHERE pat.project_id = (SELECT id FROM project_data)
    ),
    team_metrics AS (
      SELECT
        COUNT(DISTINCT abstractor_id) FILTER (WHERE abstractor_id IS NOT NULL) AS coders_count,
        COUNT(DISTINCT qa_id) FILTER (WHERE qa_id IS NOT NULL) AS auditors_count,
        
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', u1.id, 'name', u1.full_name)) 
          FILTER (WHERE u1.id IS NOT NULL), 
          '[]'::json
        ) AS abstractors,
        
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', u2.id, 'name', u2.full_name)) 
          FILTER (WHERE u2.id IS NOT NULL), 
          '[]'::json
        ) AS qa_users
      FROM patients pat
      LEFT JOIN users u1 ON u1.id = pat.abstractor_id
      LEFT JOIN users u2 ON u2.id = pat.qa_id
      WHERE pat.project_id = (SELECT id FROM project_data)
    )
    SELECT
      pd.*,
      cm.total_charts,
      cm.completed_charts,
      cm.in_progress_charts,
      cm.pending_charts,
      cm.completion_percentage,
      tm.coders_count AS coders,
      tm.auditors_count AS auditors,
      92 AS sla_compliance,                    -- Make dynamic later if needed
      tm.abstractors,
      tm.qa_users
    FROM project_data pd
    CROSS JOIN chart_metrics cm
    CROSS JOIN team_metrics tm;
  `;

  const result = await db.query(query, [id]);
  const row = result.rows[0];

  if (!row) return null;

  return {
    ...row,
    total_charts: parseInt(row.total_charts || 0, 10),
    completed_charts: parseInt(row.completed_charts || 0, 10),
    in_progress_charts: parseInt(row.in_progress_charts || 0, 10),
    pending_charts: parseInt(row.pending_charts || 0, 10),
    completion_percentage: parseFloat(row.completion_percentage || 0),
    coders: parseInt(row.coders || 0, 10),
    auditors: parseInt(row.auditors || 0, 10),
    sla_compliance: parseInt(row.sla_compliance || 92, 10),
    abstractors: row.abstractors || [],
    qa_users: row.qa_users || [],
  };
};
