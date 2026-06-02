const { getDeviceName } = require("../utils/deviceParser");
const getAuditLogs = async (db, filters, pagination) => {
  const { event_type, risk_level, status, search, startDate, endDate } =
    filters;
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM audit_logs
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (event_type) {
    query += ` AND event_type = $${paramIndex++}`;
    values.push(event_type);
  }

  if (risk_level) {
    query += ` AND risk_level = $${paramIndex++}`;
    values.push(risk_level);
  }

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(status);
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex++}`;
    values.push(startDate);
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex++}`;
    values.push(endDate);
  }

  if (search) {
    query += ` AND (user_name ILIKE $${paramIndex} OR details ILIKE $${paramIndex})`;
    values.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  values.push(limit, offset);

  const result = await db.query(query, values);
  return result.rows;
};

const countAuditLogs = async (db, filters) => {
  const { event_type, risk_level, status, search, startDate, endDate } =
    filters;

  let query = `
    SELECT COUNT(*) as total FROM audit_logs
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (event_type) {
    query += ` AND event_type = $${paramIndex++}`;
    values.push(event_type);
  }

  if (risk_level) {
    query += ` AND risk_level = $${paramIndex++}`;
    values.push(risk_level);
  }

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(status);
  }

  if (startDate) {
    query += ` AND created_at >= $${paramIndex++}`;
    values.push(startDate);
  }

  if (endDate) {
    query += ` AND created_at <= $${paramIndex++}`;
    values.push(endDate);
  }

  if (search) {
    query += ` AND (user_name ILIKE $${paramIndex} OR details ILIKE $${paramIndex})`;
    values.push(`%${search}%`);
    paramIndex++;
  }

  const result = await db.query(query, values);
  return parseInt(result.rows[0].total);
};

const createAuditLog = async (db, logEntry) => {
  let {
    user_id,
    user_name,
    event_type,
    details,
    ip_address,
    device,
    location,
    risk_level,
    status,
  } = logEntry;

  // Convert raw user-agent into readable device name
  if (device) {
    device = getDeviceName(device);
  }

  const query = `
    INSERT INTO audit_logs (
      user_id,
      user_name,
      event_type,
      details,
      ip_address,
      device,
      location,
      risk_level,
      status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;

  const values = [
    user_id,
    user_name,
    event_type,
    details,
    ip_address,
    device,
    location,
    risk_level,
    status,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  getAuditLogs,
  countAuditLogs,
  createAuditLog,
};
