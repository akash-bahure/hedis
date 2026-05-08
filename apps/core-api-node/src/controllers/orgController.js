const pool = require("../config/db");
const { createTenant } = require("../services/tenantService");

// GET ALL ORGANIZATIONS
exports.getOrganizations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        subdomain,
        schema_name,
        is_active,
        is_archived,
        created_at
      FROM tenants
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// CREATE ORGANIZATION
exports.createOrg = async (req, res) => {
  try {
    const { name, subdomain } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({
        message: "Name and subdomain are required",
      });
    }

    const tenant = await createTenant({
      name,
      subdomain,
    });

    res.status(201).json({
      message: "Organization created",
      tenant,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// UPDATE ORGANIZATION
exports.updateOrg = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, is_active } = req.body;

    const result = await pool.query(
      `
      UPDATE tenants
      SET
        name = COALESCE($1, name),
        is_active = COALESCE($2, is_active)
      WHERE id = $3
      RETURNING
        id,
        name,
        subdomain,
        schema_name,
        is_active,
        is_archived,
        created_at
      `,
      [name, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    res.json({
      message: "Organization updated",
      organization: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ARCHIVE ORGANIZATION
exports.archiveOrg = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tenants
      SET is_archived = true
      WHERE id = $1
      RETURNING
        id,
        name,
        subdomain,
        schema_name,
        is_active,
        is_archived,
        created_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    res.json({
      message: "Organization archived",
      organization: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
