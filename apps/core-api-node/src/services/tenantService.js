const pool = require("../config/db");
const { runMigrations } = require("./migrationService");

async function createTenant({ name, subdomain }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const schema = `${subdomain}_schema`;

    // Validate schema
    if (!/^[a-zA-Z0-9_]+$/.test(schema)) {
      throw new Error("Invalid schema name");
    }

    // Create schema
    await client.query(`CREATE SCHEMA ${schema}`);

    // Insert tenant
    const result = await client.query(
      `INSERT INTO tenants (name, subdomain, schema_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, subdomain, schema]
    );

    // Run migrations
    await runMigrations(client, schema);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createTenant };
