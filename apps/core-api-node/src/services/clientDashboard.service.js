// CREATE V2
exports.createClientV2 = async (db, data) => {
  const crypto = require("crypto");

  // Generate UUID
  if (!data.id) {
    data.id = crypto.randomUUID();
  }

  // Generate Client ID (CL-001)
  const countResult = await db.query(`SELECT COUNT(*) FROM clients`);
  const count = parseInt(countResult.rows[0].count, 10) + 1;
  data.client_id = `CL-${String(count).padStart(3, "0")}`;

  if (!data.created_at) data.created_at = new Date();
  if (!data.updated_at) data.updated_at = new Date();

  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");

  const query = `
    INSERT INTO clients (${columns})
    VALUES (${placeholders})
    RETURNING *;
  `;
  const result = await db.query(query, values);
  return result.rows[0];
};

// GET ALL V2 (with dynamic stats)
exports.getClientsV2 = async (db, queryParams) => {
  const { search, region, status, contract_type, page = 1, limit = 10 } = queryParams;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClauses = [];
  let values = [];
  let valueIndex = 1;

  if (search) {
    whereClauses.push(`
      (
        c.org_name ILIKE $${valueIndex}
        OR c.email ILIKE $${valueIndex}
        OR c.short_code ILIKE $${valueIndex}
        OR c.client_id ILIKE $${valueIndex}
      )
    `);
    values.push(`%${search}%`);
    valueIndex++;
  }

  if (region) {
    whereClauses.push(`c.region = $${valueIndex}`);
    values.push(region);
    valueIndex++;
  }

  if (status) {
    whereClauses.push(`c.status = $${valueIndex}`);
    values.push(status);
    valueIndex++;
  }

  if (contract_type) {
    whereClauses.push(`c.contract_type = $${valueIndex}`);
    values.push(contract_type);
    valueIndex++;
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM clients c ${whereString}`;
  const countResult = await db.query(countQuery, values);
  const total_count = parseInt(countResult.rows[0].count, 10);

  const dataQuery = `
    SELECT
      c.id,
      c.client_id,
      c.org_name,
      c.short_code,
      c.region,
      c.plan_tier,
      c.status,
      c.contract_type,
      c.measure_year,
      c.start_date,
      c.due_date,
      c.primary_contact_name,
      c.email,
      c.phone,
      c.created_at,
      c.updated_at,
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS total_projects,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id) AS total_patients_enrolled,
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS total_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Done', 'Completed')) AS completed_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Assigned', 'In Progress', 'Pending QA', 'QA Returned')) AS active_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage = 'Unassigned') AS pending_charts,
      (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Chart Abstractor') AS total_abstractors,
      (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Quality Analyst') AS total_qa_users
    FROM clients c
    ${whereString}
    ORDER BY c.created_at DESC
    LIMIT $${valueIndex}
    OFFSET $${valueIndex + 1}
  `;

  const dataValues = [...values, Number(limit), offset];
  const dataResult = await db.query(dataQuery, dataValues);
  const totalPages = Math.ceil(total_count / Number(limit));

  return {
    data: dataResult.rows,
    totalCount: total_count,
    currentPage: Number(page),
    totalPages: totalPages,
    pageSize: Number(limit)
  };
};

// GET STATS V2
exports.getClientStatsV2 = async (db) => {
  const result = await db.query(`
    WITH ClientStats AS (
      SELECT
        c.id,
        c.status,
        (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS total_projects,
        (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id) AS total_patients_enrolled,
        (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS total_charts,
        (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Done', 'Completed')) AS completed_charts,
        (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Assigned', 'In Progress', 'Pending QA', 'QA Returned')) AS active_charts,
        (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage = 'Unassigned') AS pending_charts,
        (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Chart Abstractor') AS total_abstractors,
        (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Quality Analyst') AS total_qa_users
      FROM clients c
    )
    SELECT
      COUNT(*) AS total_clients,
      COUNT(*) FILTER (WHERE status = 'Active') AS active_clients,
      COUNT(*) FILTER (WHERE status = 'Inactive') AS inactive_clients,
      COALESCE(SUM(total_projects), 0) AS total_projects,
      COALESCE(SUM(total_patients_enrolled), 0) AS total_patients,
      COALESCE(SUM(total_charts), 0) AS total_charts,
      COALESCE(SUM(completed_charts), 0) AS completed_charts,
      COALESCE(SUM(active_charts), 0) AS active_charts,
      COALESCE(SUM(pending_charts), 0) AS pending_charts,
      COALESCE(SUM(total_abstractors), 0) AS total_abstractors,
      COALESCE(SUM(total_qa_users), 0) AS total_qa_users
    FROM ClientStats
  `);

  const row = result.rows[0];
  return {
    total_clients: parseInt(row.total_clients, 10),
    active_clients: parseInt(row.active_clients, 10),
    inactive_clients: parseInt(row.inactive_clients, 10),
    total_patients: parseInt(row.total_patients, 10),
    total_charts: parseInt(row.total_charts, 10),
    active_charts: parseInt(row.active_charts, 10),
    completed_charts: parseInt(row.completed_charts, 10),
    pending_charts: parseInt(row.pending_charts, 10),
    total_projects: parseInt(row.total_projects, 10),
    total_abstractors: parseInt(row.total_abstractors, 10),
    total_qa_users: parseInt(row.total_qa_users, 10)
  };
};

// GET ONE V2
exports.getClientByIdV2 = async (db, id) => {
  const query = `
    SELECT
      c.id,
      c.client_id,
      c.org_name,
      c.short_code,
      c.region,
      c.plan_tier,
      c.status,
      c.contract_type,
      c.measure_year,
      c.start_date,
      c.due_date,
      c.primary_contact_name,
      c.email,
      c.phone,
      c.created_at,
      c.updated_at,
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS total_projects,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id) AS total_patients_enrolled,
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS total_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Done', 'Completed')) AS completed_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage IN ('Assigned', 'In Progress', 'Pending QA', 'QA Returned')) AS active_charts,
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id AND pat.stage = 'Unassigned') AS pending_charts,
      (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Chart Abstractor') AS total_abstractors,
      (SELECT COUNT(DISTINCT ca.assigned_to) FROM chart_assignments ca JOIN patient_charts pc ON ca.patient_chart_id = pc.id JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND ca.assigned_role = 'Quality Analyst') AS total_qa_users
    FROM clients c
    WHERE c.id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};
