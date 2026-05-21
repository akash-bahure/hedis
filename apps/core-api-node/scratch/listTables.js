require("dotenv").config();
const pool = require("../src/config/db");

async function listTables() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'domain_schema'
    `);
    console.log("TABLES in domain_schema:", res.rows);
  } catch (err) {
    console.error("Error listing tables:", err);
  } finally {
    client.release();
    pool.end();
  }
}

listTables();
