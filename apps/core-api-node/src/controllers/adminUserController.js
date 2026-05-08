const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// GET ALL SUPER ADMINS
exports.getAdmins = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        is_active,
        created_at
      FROM super_admins
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// CREATE SUPER ADMIN
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing admin
    const existing = await pool.query(
      `
      SELECT * FROM super_admins
      WHERE email = $1
      `,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO super_admins
      (
        name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        is_active,
        created_at
      `,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "Super admin created",
      admin: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { is_active, name } = req.body;

    const result = await pool.query(
      `
      UPDATE super_admins
      SET
        is_active = COALESCE($1, is_active),
        name = COALESCE($2, name)
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        is_active,
        created_at
      `,
      [is_active, name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.json({
      message: "Admin updated",
      admin: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
