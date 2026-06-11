const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const initDB = async () => {
  try {
    const filePath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(filePath, "utf8");

    await pool.query(sql);

    // Migrate patient_id from uuid to text if the table already existed with the old type
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'timeline_events'
            AND column_name = 'patient_id'
            AND data_type = 'uuid'
        ) THEN
          ALTER TABLE timeline_events ALTER COLUMN patient_id TYPE TEXT;
        END IF;
      END $$
    `);

    console.log("Schema executed successfully");
  } catch (err) {
    console.error("Schema Error", err.message);
  }
};

module.exports = initDB;
