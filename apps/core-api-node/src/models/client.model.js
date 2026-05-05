const pool = require("../config/db");

const Client = {
  create: async (data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const columns = keys.join(", ");
    
    const query = `
      INSERT INTO clients (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findAndCountAll: async ({ search, region, status, contract_type, limit, offset }) => {
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
    const countResult = await pool.query(countQuery, values);
    const count = parseInt(countResult.rows[0].count, 10);

    const dataQuery = `
      SELECT * FROM clients 
      ${whereString}
      ORDER BY created_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;
    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);

    return { count, rows: dataResult.rows };
  },

  findAll: async ({ search, region, status, contract_type }) => {
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
    
    const query = `
      SELECT * FROM clients 
      ${whereString}
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, values);
    return result.rows;
  },

  findByPk: async (id) => {
    const query = `SELECT * FROM clients WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  update: async (id, data) => {
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
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  },

  destroy: async (id) => {
    const query = `DELETE FROM clients WHERE id = $1`;
    await pool.query(query, [id]);
  }
};

module.exports = Client;