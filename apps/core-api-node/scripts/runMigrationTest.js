require("dotenv").config();

const pool = require("../src/config/db");

const {
  runMigrations,
} = require("../src/utils/runMigrations");

async function testMigration() {
  const client = await pool.connect();

  try {
    const schema = "acme15";

    console.log("RUNNING MIGRATIONS FOR:", schema);

    await client.query(`
      CREATE SCHEMA IF NOT EXISTS ${schema};
    `);

    await runMigrations(client, schema);

    console.log("MIGRATIONS COMPLETED");
  } catch (err) {
    console.error("MIGRATION ERROR:", err);
  } finally {
    client.release();
    process.exit();
  }
}

testMigration();