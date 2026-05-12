const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendInviteEmail } = require("../services/mail.service");

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

exports.createTenantAdmin = async (req, res) => {
  const generateInviteToken = () => crypto.randomBytes(32).toString("hex");
  const inviteToken = generateInviteToken();

  const client = await pool.connect();

  try {
    const { org_id } = req.params;

    const { name, email, role } = req.body;

    // 1. Get tenant
    const tenantResult = await client.query(
      `
      SELECT *
      FROM tenants
      WHERE id = $1
      `,
      [org_id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.is_archived || !tenant.is_active) {
      return res.status(403).json({
        message: "Organization inactive",
      });
    }

    // 2. Set schema
    await client.query(`SET search_path TO ${tenant.schema_name}`);

    // 3. Check existing user
    const existingUser = await client.query(
      `
      SELECT * FROM users
      WHERE email = $1
      `,
      [email]
    );

    /**
     * 4. Get role UUID
     * If role is not passed, default to Org Admin
     */
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const roleName = role || "Org Admin";

    const roleResult = await client.query(
      `
      SELECT id, name
      FROM user_roles
      WHERE name = $1
      AND system_role = true
      LIMIT 1
      `,
      [roleName]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const roleId = roleResult.rows[0].id;

    // const result = await client.query(
    //   `
    //   INSERT INTO users
    //   (
    //     full_name,
    //     email
    //     role_id
    //   )
    //   VALUES ($1, $2)
    //   RETURNING
    //     id,
    //     full_name,
    //     email,
    //     user_role_id,
    //     is_active,
    //     created_at
    //   `,
    //   [name, email]
    // );
    const result = await client.query(
  `
  INSERT INTO users
  (
    full_name,
    email,
    user_role_id,
    is_active,
    user_status,
    invite_token,
    invite_token_expiry
  )

  VALUES
  (
    $1,
    $2,
    $3,
    false,
    'Pending',
    $4,
    NOW() + INTERVAL '24 hours'
  )

  RETURNING
    id,
    full_name,
    email,
    user_role_id,
    is_active,
    created_at
  `,
  [
    name,
    email,
    roleId,
    inviteToken
  ]
);
    const createdUser = result.rows[0];

    try {
      await sendInviteEmail(
        createdUser.email,
        createdUser.full_name,
        inviteToken
      );
    } catch (err) {
      console.error("Email failed:", err.message);
    }

    res.status(201).json({
      message: "Tenant admin created",
      user: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
};
