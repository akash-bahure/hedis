const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const initDB = async () => {
  try {
    const filePath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(filePath, "utf8");

    await pool.query(sql);

    console.log("Schema executed successfully");
  } catch (err) {
    console.error("Schema Error", err.message);
  }
};

module.exports = initDB;