require("dotenv").config();
const pool = require("../src/config/db");

async function findProjectsTable() {
  const client = await pool.connect();
  try {
    const schemasRes = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name = 'projects'
    `);
    console.log("PROJECTS TABLES FOUND:", schemasRes.rows);

    for (const row of schemasRes.rows) {
      const colsRes = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = 'projects'
      `, [row.table_schema]);
      console.log(`Columns in ${row.table_schema}.projects:`, colsRes.rows);
    }
  } catch (err) {
    console.error("Error finding projects tables:", err);
  } finally {
    client.release();
    pool.end();
  }
}

findProjectsTable();
