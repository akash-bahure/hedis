require("dotenv").config();
const pool = require("../src/config/db");

async function queryTenants() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM public.tenants");
    console.log("TENANTS:", res.rows);
  } catch (err) {
    console.error("Error querying tenants:", err);
  } finally {
    client.release();
    pool.end();
  }
}

queryTenants();
