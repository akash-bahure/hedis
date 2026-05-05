const Client = require("../models/client.model");

// CREATE
exports.createClient = async (db, body) => {
  const client = await Client.create(db, body);
  return client;
};

// GET ALL (with filters + pagination)
exports.getClients = async (db, query) => {
  const {
    search,
    region,
    status,
    contract_type,
    page = 1,
    limit = 10,
  } = query;

  const offset = (page - 1) * limit;

  const { count, rows } = await Client.findAndCountAll(db, {
    search,
    region,
    status,
    contract_type,
    limit: Number(limit),
    offset: Number(offset),
  });

  return {
    total: count,
    page: Number(page),
    limit: Number(limit),
    data: rows,
  };
};

// EXPORT ALL (CSV / PDF)
exports.exportClients = async (db, format) => {
  // Use findAll to get all clients without filters (as requested)
  const rows = await Client.findAll(db, {});

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
  return await Client.findByPk(db, id);
};

//UPDATE
exports.updateClient = async (db, id, body) => {
  const client = await Client.findByPk(db, id);

  if (!client) throw new Error("Client not found");

  const updatedClient = await Client.update(db, id, body);
  return updatedClient;
};

// DELETE
exports.deleteClient = async (db, id) => {
  const client = await Client.findByPk(db, id);

  if (!client) throw new Error("Client not found");

  await Client.destroy(db, id);
};