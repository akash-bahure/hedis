const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test connection
pool
  .connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch((err) => console.error("DB Connection Error", err));

  pool.query("SELECT current_database()")
  .then(res => console.log("Current DB:", res.rows[0].current_database))
  .catch(console.error);

module.exports = pool;
