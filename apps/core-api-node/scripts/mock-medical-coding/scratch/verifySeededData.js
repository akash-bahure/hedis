require("dotenv").config();
const pool = require("../src/config/db");

async function verifyData() {
  const client = await pool.connect();
  try {
    const tenantsRes = await client.query("SELECT name, schema_name FROM public.tenants");
    const tenants = tenantsRes.rows;
    console.log(`\nFound ${tenants.length} tenants in public.tenants to verify.`);

    for (const tenant of tenants) {
      const schema = tenant.schema_name;
      console.log(`\n================= VERIFYING TENANT: ${tenant.name} (${schema}) =================`);
      try {
        const projRes = await client.query(`SELECT id, project_id, project_name FROM ${schema}.projects`);
        console.log(`Projects (${projRes.rows.length}):`, projRes.rows);

        const patRes = await client.query(`SELECT id, patient_id, first_name, last_name FROM ${schema}.patients`);
        console.log(`Patients (${patRes.rows.length}):`, patRes.rows.slice(0, 5)); // Show first 5

        const chartRes = await client.query(`SELECT id, chart_id, patient_id, status FROM ${schema}.patient_charts`);
        console.log(`Charts (${chartRes.rows.length}):`, chartRes.rows);
      } catch (schemaErr) {
        console.error(`Error querying schema ${schema}:`, schemaErr.message || schemaErr);
      }
    }
  } catch (err) {
    console.error("Error verifying data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

verifyData();
