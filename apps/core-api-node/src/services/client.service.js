const crypto = require("crypto");

// CREATE
exports.createClient = async (db, data) => {
  // Generate UUID
  if (!data.id) {
    data.id = crypto.randomUUID();
  }

  // Generate Client ID (CL-001)
  const countResult = await db.query(`
    SELECT COUNT(*) FROM clients
  `);

  const count = parseInt(countResult.rows[0].count, 10) + 1;

  data.client_id = `CL-${String(count).padStart(3, "0")}`;

  if (!data.created_at) {
    data.created_at = new Date();
  }

  if (!data.updated_at) {
    data.updated_at = new Date();
  }

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

// C:\Users\akash\vervelo-solutions-hedis\apps\core-api-node\src\services\hedisClient.service.js

/**
 * GET ALL CLIENTS with dynamic calculations, filtering, sorting, and pagination
 */
exports.getClients = async (db, queryParams) => {
  const {
    search,
    region,
    status,
    contract_type,
    measure_year,
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

  // SEARCH FILTER (matches org_name, client_id/code, and short_code)
  if (search) {
    whereClauses.push(`(
      c.org_name ILIKE $${valueIndex}
      OR c.client_id ILIKE $${valueIndex}
      OR c.short_code ILIKE $${valueIndex}
    )`);
    queryValues.push(`%${search}%`);
    valueIndex++;
  }

  // STATUS FILTER
  if (status) {
    whereClauses.push(`c.status = $${valueIndex}`);
    queryValues.push(status);
    valueIndex++;
  }

  // REGION FILTER
  if (region) {
    whereClauses.push(`c.region = $${valueIndex}`);
    queryValues.push(region);
    valueIndex++;
  }

  // MEASURE YEAR FILTER
  if (measure_year) {
    whereClauses.push(`c.measure_year = $${valueIndex}`);
    queryValues.push(measure_year);
    valueIndex++;
  }

  // CONTRACT TYPE FILTER
  if (contract_type) {
    whereClauses.push(`c.contract_type = $${valueIndex}`);
    queryValues.push(contract_type);
    valueIndex++;
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // TOTAL COUNT
  const countQuery = `
    SELECT COUNT(*) 
    FROM clients c
    ${whereString}
  `;
  const countResult = await db.query(countQuery, queryValues);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  // SORTING VALIDATION & SANITIZATION (Prevents SQL Injection)
  const allowedSortFields = {
    id: "c.id",
    client_id: "c.client_id",
    org_name: "c.org_name",
    short_code: "c.short_code",
    region: "c.region",
    status: "c.status",
    contract_type: "c.contract_type",
    measure_year: "c.measure_year",
    plan_tier: "c.plan_tier",
    start_date: "c.start_date",
    due_date: "c.due_date",
    created_at: "c.created_at",
    updated_at: "c.updated_at",
    total_charts: "total_charts",
    completed_charts: "completed_charts",
    completion_percentage: "completion_percentage",
    active_patient_count: "active_patient_count",
  };

  const sortColumn = allowedSortFields[sortBy] || "c.created_at";
  const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // MAIN RUN QUERY WITH CALCULATIONS
  const dataQuery = `
    SELECT
      c.id,
      c.client_id,
      c.org_name,
      c.short_code,
      c.region,
      c.status,
      c.contract_type,
      c.measure_year,
      c.plan_tier,
      c.primary_contact_name AS primary_contact,
      c.email,
      c.phone,
      c.start_date,
      c.due_date,
      c.updated_at AS last_updated,
      c.created_at,
      
      -- Total projects for client
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS total_projects,

      -- Total Charts: total patient charts for the client
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS total_charts,

      -- Completed Charts: completed charts based on patient workflow stage ('QA Passed')
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'QA Passed') AS completed_charts,

      -- Completion Percentage: Completed Charts / Total Charts
      COALESCE(
        CASE 
          WHEN (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) > 0
          THEN ROUND((
            (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'QA Passed')::numeric / 
            (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id)::numeric
          ) * 100)
          ELSE 0 
        END, 0
      ) AS completion_percentage,

    -- Abstractors
(
  SELECT COUNT(DISTINCT pat.abstractor_id)
  FROM patients pat
  WHERE pat.client_id = c.id
    AND pat.abstractor_id IS NOT NULL
) AS abstractors_assigned,

(
  SELECT COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.full_name
      )
    ) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  )
  FROM patients pat
  JOIN users u ON u.id = pat.abstractor_id
  WHERE pat.client_id = c.id
) AS abstractors,

-- QA Users
(
  SELECT COUNT(DISTINCT pat.qa_id)
  FROM patients pat
  WHERE pat.client_id = c.id
    AND pat.qa_id IS NOT NULL
) AS qa_assigned_count,

(
  SELECT COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.full_name
      )
    ) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  )
  FROM patients pat
  JOIN users u ON u.id = pat.qa_id
  WHERE pat.client_id = c.id
) AS qa_users,

      -- Active Patient Count: patients linked to the client
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id) AS active_patient_count,

      -- Extra dashboard/profile workflow metrics
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'Unassigned') AS pending_charts,
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage NOT IN ('QA Passed', 'Unassigned')) AS active_charts

    FROM clients c
    ${whereString}
    ORDER BY ${sortColumn} ${direction}
    LIMIT $${valueIndex}
    OFFSET $${valueIndex + 1}
  `;

  const dataValues = [...queryValues, parsedLimit, offset];
  const result = await db.query(dataQuery, dataValues);

  // Cast calculations properly to numbers
  const formattedRows = result.rows.map((row) => ({
    ...row,
    total_projects: parseInt(row.total_projects, 10),
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
 * GET CLIENT STATS (Total Clients, Active, At Risk, Total Charts, Target Completion Rate)
 */
exports.getClientStats = async (db) => {
  const query = `
    WITH client_metrics AS (
      SELECT
        c.id,
        c.status,
        (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS tc,
        (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'QA Passed') AS cc
      FROM clients c
    )
    SELECT
      COUNT(*) AS total_clients,
      COUNT(*) FILTER (WHERE status = 'Active') AS active_clients,
      COUNT(*) FILTER (WHERE status = 'At Risk') AS at_risk_clients,
      COALESCE(SUM(tc), 0) AS charts_assigned,
      COALESCE(SUM(cc), 0) AS completed_charts
    FROM client_metrics
  `;

  const result = await db.query(query);
  const row = result.rows[0];

  const totalClients = parseInt(row.total_clients, 10);
  const activeClients = parseInt(row.active_clients, 10);
  const atRiskClients = parseInt(row.at_risk_clients, 10);
  const chartsAssigned = parseInt(row.charts_assigned, 10);
  const completedCharts = parseInt(row.completed_charts, 10);

  const completionRate =
    chartsAssigned > 0
      ? Math.round((completedCharts / chartsAssigned) * 100)
      : 0;

  return {
    totalClients,
    activeClients,
    chartsAssigned,
    completedCharts,
    completionRate,
    atRiskClients,
  };
};

/**
 * GET SINGLE CLIENT BY ID with calculations
 */
exports.getClientById = async (db, id) => {
  const query = `
    SELECT
      c.id,
      c.client_id,
      c.org_name,
      c.short_code,
      c.region,
      c.status,
      c.contract_type,
      c.measure_year,
      c.plan_tier,
      c.primary_contact_name AS primary_contact,
      c.email,
      c.phone,
      c.start_date,
      c.due_date,
      c.updated_at AS last_updated,
      c.created_at,
      
      -- Total projects for client
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS total_projects,

      -- Total Charts
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) AS total_charts,

      -- Completed Charts
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'QA Passed') AS completed_charts,

      -- Completion Percentage
      COALESCE(
        CASE 
          WHEN (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id) > 0
          THEN ROUND((
            (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'QA Passed')::numeric / 
            (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id)::numeric
          ) * 100)
          ELSE 0 
        END, 0
      ) AS completion_percentage,
-- Abstractors
(
  SELECT COUNT(DISTINCT pat.abstractor_id)
  FROM patients pat
  WHERE pat.client_id = c.id
    AND pat.abstractor_id IS NOT NULL
) AS abstractors_assigned,

(
  SELECT COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.full_name
      )
    ) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  )
  FROM patients pat
  JOIN users u ON u.id = pat.abstractor_id
  WHERE pat.client_id = c.id
) AS abstractors,


-- QA Users
(
  SELECT COUNT(DISTINCT pat.qa_id)
  FROM patients pat
  WHERE pat.client_id = c.id
    AND pat.qa_id IS NOT NULL
) AS qa_assigned_count,

(
  SELECT COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', u.id,
        'name', u.full_name
      )
    ) FILTER (WHERE u.id IS NOT NULL),
    '[]'::json
  )
  FROM patients pat
  JOIN users u ON u.id = pat.qa_id
  WHERE pat.client_id = c.id
) AS qa_users,

      -- Active Patients
      (SELECT COUNT(*) FROM patients pat WHERE pat.client_id = c.id) AS active_patient_count,

      -- Extra workflow metrics
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage = 'Unassigned') AS pending_charts,
      (SELECT COUNT(*) FROM patient_charts pc JOIN patients pat ON pc.patient_id = pat.id WHERE pat.client_id = c.id AND pat.stage NOT IN ('QA Passed', 'Unassigned')) AS active_charts

    FROM clients c
    WHERE c.id = $1
  `;

  const result = await db.query(query, [id]);
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...row,
    total_projects: parseInt(row.total_projects, 10),
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
  };
};

/**
 * Get HEDIS measure progress summary for a selected client.
 * Calculates Total Assigned (patient charts), Total Completed (QA_PASS decisions),
 * progress percentage, and status, grouped by measure_code.
 */
exports.getClientMeasureProgress = async (db, clientId, queryParams) => {
  const { page = 1, limit = 10 } = queryParams;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedPage = parseInt(page, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;

  // Total distinct measures
  const countQuery = `
    SELECT COUNT(DISTINCT he.measure_code) AS count
    FROM hedis_evaluations he
    INNER JOIN patients pat
      ON pat.id = he.patient_id
    WHERE pat.client_id = $1
  `;

  const countRes = await db.query(countQuery, [clientId]);
  const totalCount = Number(countRes.rows[0].count);

  // Measure Progress
  const dataQuery = `
    SELECT
      he.measure_code,
      MAX(he.measure_name) AS measure_name,

      COUNT(DISTINCT he.id) AS total_assigned,

      COUNT(
        DISTINCT CASE
          WHEN qd.qa_status = 'QA_PASS'
          THEN he.id
        END
      ) AS total_completed

    FROM hedis_evaluations he

    INNER JOIN patients pat
      ON pat.id = he.patient_id

    LEFT JOIN hedis_qa_measure_decisions qd
      ON qd.measure_id = he.id

    WHERE pat.client_id = $1

    GROUP BY he.measure_code

    ORDER BY he.measure_code

    LIMIT $2
    OFFSET $3
  `;

  const { rows } = await db.query(dataQuery, [clientId, parsedLimit, offset]);

  const data = rows.map((row) => {
    const assigned = Number(row.total_assigned);
    const done = Number(row.total_completed);

    const progress = assigned > 0 ? Math.round((done / assigned) * 100) : 0;

    let status = "Pending";

    if (done === assigned && assigned > 0) {
      status = "Completed";
    } else if (done > 0) {
      status = "In Progress";
    }

    return {
      measure_code: row.measure_code,
      measure_name: row.measure_name,
      assigned,
      done,
      progress,
      status,
    };
  });

  return {
    data,
    totalCount,
    currentPage: parsedPage,
    totalPages: Math.ceil(totalCount / parsedLimit),
    pageSize: parsedLimit,
  };
};

// EXPORT ALL (CSV / PDF)
exports.exportClients = async (db, format) => {
  const query = `
    SELECT * FROM clients
    ORDER BY created_at DESC
  `;

  const result = await db.query(query);

  const rows = result.rows;

  const fields = [
    "client_id",
    "org_name",
    "short_code",
    "region",
    "plan_tier",
    "status",
    "contract_type",
    "measure_year",
    "total_charts",
    "completed_charts",
    "start_date",
    "due_date",
    "primary_contact_name",
    "email",
    "phone",
    "abstractors_assigned",
  ];

  // PDF
  if (format === "pdf") {
    const PDFDocument = require("pdfkit-table");

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 30,
          size: "A4",
          layout: "landscape",
        });

        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));

        doc.on("end", () => resolve(Buffer.concat(buffers)));

        const table = {
          title: "Clients Export",

          headers: [
            "Client ID",
            "Org Name",
            "Region",
            "Status",
            "Contract",
            "Email",
          ],

          rows: rows.map((row) => [
            row.client_id || "",
            row.org_name || "",
            row.region || "",
            row.status || "",
            row.contract_type || "",
            row.email || "",
          ]),
        };

        doc.table(table, { width: 750 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Default to CSV
  const csvRows = [];

  csvRows.push(fields.join(","));

  for (const row of rows) {
    const values = fields.map((field) => {
      let val = row[field];

      if (val === null || val === undefined) {
        val = "";
      }

      val = val.toString().replace(/"/g, '""');

      return `"${val}"`;
    });

    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

//UPDATE
exports.updateClient = async (db, id, data) => {
  const existingResult = await db.query(`SELECT * FROM clients WHERE id = $1`, [
    id,
  ]);

  const client = existingResult.rows[0];

  if (!client) {
    throw new Error("Client not found");
  }

  data.updated_at = new Date();

  const keys = Object.keys(data);

  const values = Object.values(data);

  const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE clients
    SET ${setString}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;

  const result = await db.query(query, [...values, id]);

  return result.rows[0];
};

// DELETE
exports.deleteClient = async (db, id) => {
  const existingResult = await db.query(`SELECT * FROM clients WHERE id = $1`, [
    id,
  ]);

  const client = existingResult.rows[0];

  if (!client) {
    throw new Error("Client not found");
  }

  const query = `
    DELETE FROM clients
    WHERE id = $1
  `;

  await db.query(query, [id]);
};

/**
 * Get recent chart workflow activity for a selected client.
 * Returns chart-level activities only (not measure-level).
 */
exports.getClientRecentActivity = async (db, clientId, queryParams) => {
  const { page = 1, limit = 15 } = queryParams;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 15;
  const offset = (parsedPage - 1) * parsedLimit;

  const query = `
    WITH activities AS (

      ------------------------------------------------------------------
      -- 1. New Patient Added
      ------------------------------------------------------------------
      SELECT
        pat.id::text || '-patient' AS id,
        'New Patient' AS activity_type,
        'New patient added' AS title,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient')
          || ' added to client.' AS description,
        pat.id AS patient_id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient') AS patient_name,
        NULL::uuid AS chart_id,
        'System' AS performed_by,
        pat.created_at AS activity_time,
        'patient' AS icon_type

      FROM patients pat
      WHERE pat.client_id = $1

      UNION ALL

      ------------------------------------------------------------------
      -- 2. Chart Uploaded
      ------------------------------------------------------------------
      SELECT
        pc.id::text || '-chart',
        'Chart Uploaded',
        'Chart uploaded',
        'Chart uploaded for '
          || COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pat.id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pc.id,
        'System',
        pc.created_at,
        'chart'

      FROM patient_charts pc
      JOIN patients pat
        ON pc.patient_id = pat.id
      WHERE pat.client_id = $1

      UNION ALL

      ------------------------------------------------------------------
      -- 3. Abstractor Assigned
      ------------------------------------------------------------------
      SELECT
        pat.id::text || '-abstractor',
        'Abstractor Assigned',
        'Abstractor assigned',
        COALESCE(u.full_name,'Abstractor')
          || ' assigned to '
          || COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pat.id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        NULL::uuid,
        COALESCE(u.full_name,'System'),
        pat.updated_at,
        'assignment'

      FROM patients pat
      LEFT JOIN users u
        ON pat.abstractor_id = u.id
      WHERE pat.client_id = $1
        AND pat.abstractor_id IS NOT NULL

      UNION ALL

      ------------------------------------------------------------------
      -- 4. QA Assigned
      ------------------------------------------------------------------
      SELECT
        pat.id::text || '-qa',
        'QA Assigned',
        'QA assigned',
        COALESCE(u.full_name,'QA')
          || ' assigned for '
          || COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pat.id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        NULL::uuid,
        COALESCE(u.full_name,'System'),
        pat.updated_at,
        'assignment'

      FROM patients pat
      LEFT JOIN users u
        ON pat.qa_id = u.id
      WHERE pat.client_id = $1
        AND pat.qa_id IS NOT NULL

      UNION ALL

      ------------------------------------------------------------------
      -- 5. QA Stage Completed
      ------------------------------------------------------------------
      SELECT
        pat.id::text || '-qa-stage',
        'QA Completed',
        'QA review completed',
        'QA completed for '
          || COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pat.id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        NULL::uuid,
        'QA Reviewer',
        pat.updated_at,
        'qa'

      FROM patients pat
      WHERE pat.client_id = $1
        AND pat.stage = 'QA Passed'

      UNION ALL

      ------------------------------------------------------------------
      -- 6. Audit Completed
      ------------------------------------------------------------------
      SELECT
        pat.id::text || '-audit-stage',
        'Audit Completed',
        'Audit review completed',
        'Audit completed for '
          || COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        pat.id,
        COALESCE(pat.first_name || ' ' || pat.last_name,'Unknown Patient'),
        NULL::uuid,
        'Auditor',
        pat.updated_at,
        'audit'

      FROM patients pat
      WHERE pat.client_id = $1
        AND pat.audit_reviewed = TRUE

    )

    SELECT *,
           COUNT(*) OVER() total_count
    FROM activities
    ORDER BY activity_time DESC
    LIMIT $2 OFFSET $3;
  `;

  const result = await db.query(query, [clientId, parsedLimit, offset]);

  const rows = result.rows;

  return {
    data: rows.map((r) => ({
      id: r.id,
      activityType: r.activity_type,
      title: r.title,
      description: r.description,
      patientId: r.patient_id,
      patientName: r.patient_name,
      chartId: r.chart_id,
      performedBy: r.performed_by,
      timestamp: r.activity_time,
      iconType: r.icon_type,
    })),
    totalCount: rows.length ? Number(rows[0].total_count) : 0,
    currentPage: parsedPage,
    totalPages: Math.ceil(
      (rows.length ? Number(rows[0].total_count) : 0) / parsedLimit
    ),
    pageSize: parsedLimit,
  };
};

/**
 * EXPORT FULL CLIENT PROFILE REPORT as CSV
 * Client ID is REQUIRED - Generates comprehensive report for one specific client
 */
exports.exportClientReport = async (db, clientId) => {
  if (!clientId) {
    throw new Error("Client ID is required for full profile export");
  }

  const csvRows = [];

  csvRows.push([`HEDIS CLIENT FULL PROFILE REPORT`]);
  csvRows.push([`Generated on: ${new Date().toISOString().split("T")[0]}`]);
  csvRows.push([`Report For Client ID: ${clientId}`]);
  csvRows.push([]); // Empty line for readability

  // 1. Fetch Client Basic Details
  const clientQuery = `SELECT * FROM clients WHERE id = $1`;
  const clientRes = await db.query(clientQuery, [clientId]);
  const client = clientRes.rows[0];

  if (!client) {
    throw new Error(`Client with ID ${clientId} not found`);
  }

  // Client Details Section
  csvRows.push(["=== CLIENT DETAILS ==="]);
  csvRows.push(["Field", "Value"]);
  csvRows.push(["Client ID", client.client_id || ""]);
  csvRows.push(["Organization Name", client.org_name || ""]);
  csvRows.push(["Short Code", client.short_code || ""]);
  csvRows.push(["Region", client.region || ""]);
  csvRows.push(["Status", client.status || ""]);
  csvRows.push(["Contract Type", client.contract_type || ""]);
  csvRows.push(["Measure Year", client.measure_year || ""]);
  csvRows.push(["Plan Tier", client.plan_tier || ""]);
  csvRows.push(["Primary Contact", client.primary_contact_name || ""]);
  csvRows.push(["Email", client.email || ""]);
  csvRows.push(["Phone", client.phone || ""]);
  csvRows.push(["Start Date", client.start_date || ""]);
  csvRows.push(["Due Date", client.due_date || ""]);
  csvRows.push([]); // separator

  // 2. Summary Metrics
  csvRows.push(["=== SUMMARY METRICS ==="]);
  csvRows.push(["Metric", "Value"]);

  const metrics = await getSummaryMetrics(db, clientId);
  Object.entries(metrics).forEach(([key, value]) => {
    csvRows.push([key.replace(/_/g, " ").toUpperCase(), value.toString()]);
  });
  csvRows.push([]); // separator

  // 3. Measure Progress Breakdown
  csvRows.push(["=== MEASURE PROGRESS BREAKDOWN ==="]);
  csvRows.push([
    "Measure Code",
    "Measure Name",
    "Assigned",
    "Completed",
    "Progress %",
    "Status",
  ]);

  const measures = await getMeasureProgress(db, clientId);
  measures.forEach((m) => {
    csvRows.push([
      m.measure_code || "",
      m.measure_name || "",
      m.assigned.toString(),
      m.completed.toString(),
      m.progress + "%",
      m.status,
    ]);
  });
  csvRows.push([]); // separator

  // 4. Recent Activity (Last 30 records)
  csvRows.push(["=== RECENT ACTIVITY (Last 30) ==="]);
  csvRows.push([
    "Timestamp",
    "Activity Type",
    "Title",
    "Description",
    "Patient Name",
    "Performed By",
  ]);

  const activities = await getRecentActivity(db, clientId, 30);
  activities.forEach((act) => {
    csvRows.push([
      act.timestamp ? act.timestamp.toISOString() : "",
      act.activityType || "",
      act.title || "",
      act.description || "",
      act.patientName || "",
      act.performedBy || "",
    ]);
  });

  return csvRows
    .map((row) =>
      row
        .map((cell) => {
          const val = (cell ?? "").toString().replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    )
    .join("\n");
};

// ====================== HELPER FUNCTIONS ======================

async function getSummaryMetrics(db, clientId) {
  const query = `
    SELECT
      COUNT(DISTINCT p.id) AS total_patients,
      COUNT(DISTINCT pc.id) AS total_charts,
      COUNT(DISTINCT CASE WHEN p.stage = 'QA Passed' THEN pc.id END) AS completed_charts,
      COUNT(DISTINCT p.abstractor_id) FILTER (WHERE p.abstractor_id IS NOT NULL) AS abstractors_assigned,
      COUNT(DISTINCT p.qa_id) FILTER (WHERE p.qa_id IS NOT NULL) AS qa_assigned
    FROM patients p
    LEFT JOIN patient_charts pc ON pc.patient_id = p.id
    WHERE p.client_id = $1
  `;

  const res = await db.query(query, [clientId]);
  const row = res.rows[0] || {};

  const totalCharts = Number(row.total_charts) || 0;
  const completed = Number(row.completed_charts) || 0;

  return {
    total_patients: Number(row.total_patients) || 0,
    total_charts: totalCharts,
    completed_charts: completed,
    completion_percentage:
      totalCharts > 0 ? Math.round((completed / totalCharts) * 100) : 0,
    abstractors_assigned: Number(row.abstractors_assigned) || 0,
    qa_assigned: Number(row.qa_assigned) || 0,
  };
}

async function getMeasureProgress(db, clientId) {
  const query = `
    SELECT
      he.measure_code,
      MAX(he.measure_name) AS measure_name,
      COUNT(DISTINCT he.id) AS assigned,
      COUNT(DISTINCT CASE WHEN qd.qa_status = 'QA_PASS' THEN he.id END) AS completed
    FROM hedis_evaluations he
    INNER JOIN patients pat ON pat.id = he.patient_id
    LEFT JOIN hedis_qa_measure_decisions qd ON qd.measure_id = he.id
    WHERE pat.client_id = $1
    GROUP BY he.measure_code
    ORDER BY he.measure_code
  `;

  const { rows } = await db.query(query, [clientId]);

  return rows.map((row) => {
    const assigned = Number(row.assigned) || 0;
    const completed = Number(row.completed) || 0;
    const progress =
      assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

    let status = "Pending";
    if (completed === assigned && assigned > 0) status = "Completed";
    else if (completed > 0) status = "In Progress";

    return {
      measure_code: row.measure_code,
      measure_name: row.measure_name,
      assigned,
      completed,
      progress,
      status,
    };
  });
}

async function getRecentActivity(db, clientId, limit = 30) {
  const query = `
    WITH activities AS (
      SELECT 
        pat.created_at AS timestamp,
        'New Patient' AS activity_type,
        'Patient Added' AS title,
        COALESCE(pat.first_name || ' ' || pat.last_name, 'Unknown') AS patient_name,
        'System' AS performed_by,
        'New patient added' AS description
      FROM patients pat WHERE pat.client_id = $1

      UNION ALL

      SELECT 
        pc.created_at,
        'Chart Uploaded',
        'Chart Upload',
        COALESCE(pat.first_name || ' ' || pat.last_name, 'Unknown'),
        'System',
        'Chart uploaded for patient'
      FROM patient_charts pc
      JOIN patients pat ON pc.patient_id = pat.id
      WHERE pat.client_id = $1

      UNION ALL

      SELECT 
        pat.updated_at,
        'QA Completed',
        'QA Review Completed',
        COALESCE(pat.first_name || ' ' || pat.last_name, 'Unknown'),
        'QA Team',
        'QA stage marked as passed'
      FROM patients pat 
      WHERE pat.client_id = $1 AND pat.stage = 'QA Passed'
    )
    SELECT * FROM activities
    ORDER BY timestamp DESC
    LIMIT $2
  `;

  const { rows } = await db.query(query, [clientId, limit]);
  return rows;
}
