const crypto = require("crypto");

// CREATE
exports.createClient = async (db, data) => {
  if (!data.id) {
    data.id = crypto.randomUUID();
  }
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

// GET ALL (with filters + pagination)
exports.getClients = async (db, queryParams) => {
  const {
    search,
    region,
    status,
    contract_type,
    page = 1,
    limit = 10,
  } = queryParams;

  const offset = (page - 1) * limit;

  let whereClauses = [];
  let values = [];
  let valueIndex = 1;

  if (search) {
    whereClauses.push(`(org_name ILIKE $${valueIndex} OR email ILIKE $${valueIndex} OR short_code ILIKE $${valueIndex})`);
    values.push(`%${search}%`);
    valueIndex++;
  }

  if (region) {
    whereClauses.push(`region = $${valueIndex}`);
    values.push(region);
    valueIndex++;
  }

  if (status) {
    whereClauses.push(`status = $${valueIndex}`);
    values.push(status);
    valueIndex++;
  }

  if (contract_type) {
    whereClauses.push(`contract_type = $${valueIndex}`);
    values.push(contract_type);
    valueIndex++;
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM clients ${whereString}`;
  const countResult = await db.query(countQuery, values);
  const count = parseInt(countResult.rows[0].count, 10);

  const dataQuery = `
    SELECT * FROM clients 
    ${whereString}
    ORDER BY created_at DESC
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;
  const dataValues = [...values, limit, offset];
  const dataResult = await db.query(dataQuery, dataValues);

  return {
    total: count,
    page: Number(page),
    limit: Number(limit),
    data: dataResult.rows,
  };
};

//GET API
exports.getClientStats = async (db) => {
  const result = await db.query(`
    SELECT 
      COUNT(*) AS total_clients,
      COUNT(*) FILTER (WHERE status = 'Active') AS active_clients,
      COALESCE(SUM(total_charts),0) AS charts_assigned,
      COALESCE(SUM(completed_charts),0) AS completed_charts,
      COUNT(*) FILTER (
        WHERE due_date < CURRENT_DATE 
        AND status != 'Active'
      ) AS at_risk
    FROM clients
  `);

  const row = result.rows[0];

  const total_clients = parseInt(row.total_clients, 10);
  const active_clients = parseInt(row.active_clients, 10);
  const charts_assigned = parseInt(row.charts_assigned, 10);
  const completed_charts = parseInt(row.completed_charts, 10);
  const at_risk = parseInt(row.at_risk, 10);

  const completion_rate =
    charts_assigned > 0
      ? Math.round((completed_charts / charts_assigned) * 100)
      : 0;

  return {
    total_clients,
    active_clients,
    charts_assigned,
    completed_charts,
    completion_rate,
    at_risk
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
    "id", "org_name", "short_code", "region", "plan_tier", "status",
    "contract_type", "measure_year", "total_charts", "start_date",
    "due_date", "primary_contact_name", "email", "phone", "abstractors_assigned"
  ];

  if (format === "pdf") {
    const PDFDocument = require("pdfkit-table");
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        
        const table = {
          title: "Clients Export",
          headers: ["Org Name", "Short Code", "Region", "Status", "Contract", "Email"],
          rows: rows.map(row => [
            row.org_name || "", 
            row.short_code || "", 
            row.region || "", 
            row.status || "", 
            row.contract_type || "",
            row.email || ""
          ])
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
    const values = fields.map(field => {
      let val = row[field];
      if (val === null || val === undefined) val = "";
      val = val.toString().replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

//GET ONE
exports.getClientById = async (db, id) => {
  const query = `SELECT * FROM clients WHERE id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

//UPDATE
exports.updateClient = async (db, id, data) => {
  const existingResult = await db.query(`SELECT * FROM clients WHERE id = $1`, [id]);
  const client = existingResult.rows[0];

  if (!client) throw new Error("Client not found");

  data.updated_at = new Date();
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    UPDATE clients 
    SET ${setString}
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

// DELETE
exports.deleteClient = async (db, id) => {
  const existingResult = await db.query(`SELECT * FROM clients WHERE id = $1`, [id]);
  const client = existingResult.rows[0];

  if (!client) throw new Error("Client not found");

  const query = `DELETE FROM clients WHERE id = $1`;
  await db.query(query, [id]);
};