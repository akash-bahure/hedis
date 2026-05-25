// scripts/runTenantMigration.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("../src/config/db");
const { runMigrations } = require("../src/services/migrationService");

async function run() {
  const client = await pool.connect();
  try {
    const schemaName = process.argv[2];
    if (!schemaName) {
      console.error(" Please provide schema name.");
      console.error(
        "Example: node scripts/runTenantMigration.js test80_schema"
      );
      process.exit(1);
    }

    console.log(`Running migrations for schema: ${schemaName}`);

    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    await runMigrations(client, schemaName);

    console.log(" Migrations completed successfully");
  } catch (err) {
    console.error(" Migration Error:", err.message);
  } finally {
    client.release();
  }
}

run();
