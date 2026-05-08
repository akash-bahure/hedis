const bcrypt = require("bcryptjs");
const pool = require("../config/db");

async function seedSuperAdmin() {
  const existing = await pool.query("SELECT * FROM super_admins LIMIT 1");

  if (existing.rows.length > 0) {
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await pool.query(
    `
    INSERT INTO super_admins
    (name, email, password)
    VALUES ($1, $2, $3)
    `,
    ["Super Admin", "admin@test.com", hashedPassword]
  );

  console.log("Default super admin created");
}

module.exports = seedSuperAdmin;
