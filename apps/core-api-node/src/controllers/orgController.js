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
        is_active,
        is_archived,
        created_at,
        api_key,
        external_medical_coding_endpoint
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
    const {
      name,
      subdomain,
      is_active,
      api_key,
      external_medical_coding_endpoint,
    } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({
        message: "Name and subdomain are required",
      });
    }

    const tenant = await createTenant({
      name,
      subdomain,
      is_active: is_active !== undefined ? is_active : true,
      api_key: api_key || null,
      external_medical_coding_endpoint:
        external_medical_coding_endpoint || null,
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

    const { name, is_active, api_key, external_medical_coding_endpoint } =
      req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (api_key !== undefined) {
      updates.push(`api_key = $${paramCount}`);
      values.push(api_key);
      paramCount++;
    }

    if (external_medical_coding_endpoint !== undefined) {
      updates.push(`external_medical_coding_endpoint = $${paramCount}`);
      values.push(external_medical_coding_endpoint);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message:
          "At least one field (name or is_active) is required for update",
      });
    }

    values.push(id);
    const query = `
      UPDATE tenants
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING
        id,
        name,
        subdomain,
        schema_name,
        is_active,
        is_archived,
        created_at,
        api_key,
        external_medical_coding_endpoint
    `;

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

// fetch and store external medical coding data for an organization
const {
  syncMedicalCodingData,
} = require("../services/externalDataImportSyncService");

exports.syncExternalCharts = async (req, res) => {
  console.log("Syncing external charts for tenant ID:", req.params.id);
  try {
    const tenantResult = await pool.query(
      `
        SELECT *
        FROM tenants
        WHERE id = $1
        `,
      [req.params.id]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    await syncMedicalCodingData(tenant);

    res.json({
      message: "Medical coding sync completed",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
