const { Client } = require("../models");
const { Op } = require("sequelize");

// CREATE
exports.createClient = async (req, res) => {
  try {
    console.log("Body:", req.body);

    const data = await clientService.createClient(req.body);

    res.status(201).json({
      message: "Client created",
      data,
    });

  } catch (err) {
    console.error("ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
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
      { name: { [Op.iLike]: `%${search}%` } },
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
    order: [["createdAt", "DESC"]],
  });

  return {
    total: count,
    page: Number(page),
    limit: Number(limit),
    data: rows,
  };
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