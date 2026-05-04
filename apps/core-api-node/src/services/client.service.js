const { Op } = require("sequelize");
const Client = require("../models/client.model");

// CREATE
exports.createClient = async (body) => {
  const client = await Client.create(body);
  return client;
};

// GET ALL (with filters + pagination)
exports.getClients = async (query) => {
  const {
    search,
    region,
    status,
    contract_type,
    page = 1,
    limit = 10,
  } = query;

  let where = {};

  // Search
  if (search) {
    where[Op.or] = [
      { org_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { short_code: { [Op.iLike]: `%${search}%` } },
    ]; 
  }

  //Filters
  if (region) where.region = region;
  if (status) where.status = status;
  if (contract_type) where.contract_type = contract_type;

  const offset = (page - 1) * limit;

  const { count, rows } = await Client.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["created_at", "DESC"]],
  });

  return {
    total: count,
    page: Number(page),
    limit: Number(limit),
    data: rows,
  };
};

// EXPORT ALL (with filters)
exports.exportClients = async (query) => {
  const {
    search,
    region,
    status,
    contract_type,
  } = query;

  let where = {};

  // Search
  if (search) {
    where[Op.or] = [
      { org_name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { short_code: { [Op.iLike]: `%${search}%` } },
    ]; 
  }

  //Filters
  if (region) where.region = region;
  if (status) where.status = status;
  if (contract_type) where.contract_type = contract_type;

  const rows = await Client.findAll({
    where,
    order: [["created_at", "DESC"]],
  });

  const fields = [
    "id", "org_name", "short_code", "region", "plan_tier", "status", 
    "contract_type", "measure_year", "total_charts", "start_date", 
    "due_date", "primary_contact_name", "email", "phone", "abstractors_assigned",
    "created_at", "updated_at"
  ];

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
exports.getClientById = async (id) => {
  return await Client.findByPk(id);
};

//UPDATE
exports.updateClient = async (id, body) => {
  const client = await Client.findByPk(id);

  if (!client) throw new Error("Client not found");

  await client.update(body);

  return client;
};

// DELETE
exports.deleteClient = async (id) => {
  const client = await Client.findByPk(id);

  if (!client) throw new Error("Client not found");

  await client.destroy();
};