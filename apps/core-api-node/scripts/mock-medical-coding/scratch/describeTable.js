require("dotenv").config();
const pool = require("../src/config/db");

async function describeTable() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'domain_schema' AND table_name = 'projects'
    `);
    console.log("COLUMNS in domain_schema.projects:", res.rows);
  } catch (err) {
    console.error("Error describing table:", err);
  } finally {
    client.release();
    pool.end();
  }
}

describeTable();
