// controllers/securityController.js

// Allowed options definition for retention
const RETENTION_OPTIONS = {
  phi_records: ["6 years", "7 years", "10 years", "15 years"],
  audit_logs: ["3 years", "6 years", "10 years"],
  session_logs: ["90 days", "180 days", "1 year", "2 years"],
  export_logs: ["1 year", "2 years", "5 years"],
  backup_snapshots: ["30 days", "60 days", "90 days", "180 days"]
};

// Allowed options definition for access expiry
const EXPIRY_OPTIONS = {
  inactivity_deactivation: ["30 days", "60 days", "90 days", "180 days"],
  force_reauthentication: ["7 days", "14 days", "30 days", "60 days"],
  auth_token_lifetime: ["1 hour", "8 hours", "24 hours", "48 hours"]
};

/**
 * GET DATA RETENTION POLICY
 * Retrieves current settings alongside available option lists for the dropdowns.
 */
exports.getDataRetentionPolicy = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;

    // Retrieve settings
    let result = await req.db.query(
      `SELECT * FROM ${schema}.data_retention_policies LIMIT 1`
    );

    // If empty (e.g. migration hasn't seeded or run yet), seed default and query again
    if (result.rows.length === 0) {
      await req.db.query(`
        INSERT INTO ${schema}.data_retention_policies (phi_records, audit_logs, session_logs, export_logs, backup_snapshots)
        VALUES ('7 years', '6 years', '1 year', '2 years', '90 days')
      `);
      result = await req.db.query(
        `SELECT * FROM ${schema}.data_retention_policies LIMIT 1`
      );
    }

    const row = result.rows[0];

    // Format clean response with selected values and their options lists
    const formattedData = {
      id: row.id,
      phi_records: {
        value: row.phi_records,
        options: RETENTION_OPTIONS.phi_records
      },
      audit_logs: {
        value: row.audit_logs,
        options: RETENTION_OPTIONS.audit_logs
      },
      session_logs: {
        value: row.session_logs,
        options: RETENTION_OPTIONS.session_logs
      },
      export_logs: {
        value: row.export_logs,
        options: RETENTION_OPTIONS.export_logs
      },
      backup_snapshots: {
        value: row.backup_snapshots,
        options: RETENTION_OPTIONS.backup_snapshots
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return res.status(200).json({
      success: true,
      message: "Data retention policy fetched successfully",
      data: formattedData
    });
  } catch (err) {
    console.error("Get Data Retention Policy Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

/**
 * UPDATE DATA RETENTION POLICY
 * Updates settings after validating that submitted options are valid.
 */
exports.updateDataRetentionPolicy = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { phi_records, audit_logs, session_logs, export_logs, backup_snapshots } = req.body;

    // Validate inputs against defined options
    if (phi_records && !RETENTION_OPTIONS.phi_records.includes(phi_records)) {
      return res.status(400).json({
        success: false,
        message: `Invalid phi_records value. Must be one of: ${RETENTION_OPTIONS.phi_records.join(", ")}`
      });
    }

    if (audit_logs && !RETENTION_OPTIONS.audit_logs.includes(audit_logs)) {
      return res.status(400).json({
        success: false,
        message: `Invalid audit_logs value. Must be one of: ${RETENTION_OPTIONS.audit_logs.join(", ")}`
      });
    }

    if (session_logs && !RETENTION_OPTIONS.session_logs.includes(session_logs)) {
      return res.status(400).json({
        success: false,
        message: `Invalid session_logs value. Must be one of: ${RETENTION_OPTIONS.session_logs.join(", ")}`
      });
    }

    if (export_logs && !RETENTION_OPTIONS.export_logs.includes(export_logs)) {
      return res.status(400).json({
        success: false,
        message: `Invalid export_logs value. Must be one of: ${RETENTION_OPTIONS.export_logs.join(", ")}`
      });
    }

    if (backup_snapshots && !RETENTION_OPTIONS.backup_snapshots.includes(backup_snapshots)) {
      return res.status(400).json({
        success: false,
        message: `Invalid backup_snapshots value. Must be one of: ${RETENTION_OPTIONS.backup_snapshots.join(", ")}`
      });
    }

    // Check if table contains settings row
    const checkResult = await req.db.query(
      `SELECT id FROM ${schema}.data_retention_policies LIMIT 1`
    );

    let result;
    if (checkResult.rows.length === 0) {
      // Create fresh row with requested or default values
      const query = `
        INSERT INTO ${schema}.data_retention_policies (phi_records, audit_logs, session_logs, export_logs, backup_snapshots, updated_at)
        VALUES (
          COALESCE($1, '7 years'),
          COALESCE($2, '6 years'),
          COALESCE($3, '1 year'),
          COALESCE($4, '2 years'),
          COALESCE($5, '90 days'),
          NOW()
        )
        RETURNING *
      `;
      result = await req.db.query(query, [
        phi_records || null,
        audit_logs || null,
        session_logs || null,
        export_logs || null,
        backup_snapshots || null
      ]);
    } else {
      // Update existing settings row
      const id = checkResult.rows[0].id;
      const query = `
        UPDATE ${schema}.data_retention_policies
        SET
          phi_records = COALESCE($1, phi_records),
          audit_logs = COALESCE($2, audit_logs),
          session_logs = COALESCE($3, session_logs),
          export_logs = COALESCE($4, export_logs),
          backup_snapshots = COALESCE($5, backup_snapshots),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `;
      result = await req.db.query(query, [
        phi_records || null,
        audit_logs || null,
        session_logs || null,
        export_logs || null,
        backup_snapshots || null,
        id
      ]);
    }

    const row = result.rows[0];

    // Format clean response
    const formattedData = {
      id: row.id,
      phi_records: {
        value: row.phi_records,
        options: RETENTION_OPTIONS.phi_records
      },
      audit_logs: {
        value: row.audit_logs,
        options: RETENTION_OPTIONS.audit_logs
      },
      session_logs: {
        value: row.session_logs,
        options: RETENTION_OPTIONS.session_logs
      },
      export_logs: {
        value: row.export_logs,
        options: RETENTION_OPTIONS.export_logs
      },
      backup_snapshots: {
        value: row.backup_snapshots,
        options: RETENTION_OPTIONS.backup_snapshots
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return res.status(200).json({
      success: true,
      message: "Data retention policy updated successfully",
      data: formattedData
    });
  } catch (err) {
    console.error("Update Data Retention Policy Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

/**
 * GET ACCESS EXPIRY POLICY
 * Retrieves settings, options, and dynamic project restriction statuses.
 */
exports.getAccessExpiryPolicy = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;

    // 1. Fetch access expiry policy settings
    let result = await req.db.query(
      `SELECT * FROM ${schema}.access_expiry_policies LIMIT 1`
    );

    // Seed defaults if empty
    if (result.rows.length === 0) {
      await req.db.query(`
        INSERT INTO ${schema}.access_expiry_policies (inactivity_deactivation, force_reauthentication, auth_token_lifetime)
        VALUES ('90 days', '30 days', '24 hours')
      `);
      result = await req.db.query(
        `SELECT * FROM ${schema}.access_expiry_policies LIMIT 1`
      );
    }

    const row = result.rows[0];

    // 2. Fetch projects to format access restrictions
    const projectsResult = await req.db.query(
      `SELECT id, project_name, status, end_date FROM ${schema}.projects ORDER BY project_name ASC`
    );

    const formattedProjects = projectsResult.rows.map((p) => {
      const today = new Date();
      const endDate = new Date(p.end_date);
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let displayStatus = p.status;
      // If expiring in <= 30 days and not expired yet
      if (diffDays >= 0 && diffDays <= 30) {
        // Format to "DD MMM", e.g. "28 Feb"
        const options = { day: 'numeric', month: 'short' };
        const formattedDate = endDate.toLocaleDateString('en-US', options);
        displayStatus = `Expiring ${formattedDate}`;
      } else if (diffDays < 0) {
        displayStatus = "Expired";
      }

      return {
        id: p.id,
        project_name: p.project_name,
        status: displayStatus,
        end_date: p.end_date
      };
    });

    const formattedData = {
      id: row.id,
      inactivity_deactivation: {
        value: row.inactivity_deactivation,
        options: EXPIRY_OPTIONS.inactivity_deactivation
      },
      force_reauthentication: {
        value: row.force_reauthentication,
        options: EXPIRY_OPTIONS.force_reauthentication
      },
      auth_token_lifetime: {
        value: row.auth_token_lifetime,
        options: EXPIRY_OPTIONS.auth_token_lifetime
      },
      project_restrictions: formattedProjects,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return res.status(200).json({
      success: true,
      message: "Access expiry policy fetched successfully",
      data: formattedData
    });
  } catch (err) {
    console.error("Get Access Expiry Policy Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

/**
 * UPDATE ACCESS EXPIRY POLICY
 * Updates access expiry policy after validating that options are valid.
 */
exports.updateAccessExpiryPolicy = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { inactivity_deactivation, force_reauthentication, auth_token_lifetime } = req.body;

    // Validate inputs
    if (inactivity_deactivation && !EXPIRY_OPTIONS.inactivity_deactivation.includes(inactivity_deactivation)) {
      return res.status(400).json({
        success: false,
        message: `Invalid inactivity_deactivation value. Must be one of: ${EXPIRY_OPTIONS.inactivity_deactivation.join(", ")}`
      });
    }

    if (force_reauthentication && !EXPIRY_OPTIONS.force_reauthentication.includes(force_reauthentication)) {
      return res.status(400).json({
        success: false,
        message: `Invalid force_reauthentication value. Must be one of: ${EXPIRY_OPTIONS.force_reauthentication.join(", ")}`
      });
    }

    if (auth_token_lifetime && !EXPIRY_OPTIONS.auth_token_lifetime.includes(auth_token_lifetime)) {
      return res.status(400).json({
        success: false,
        message: `Invalid auth_token_lifetime value. Must be one of: ${EXPIRY_OPTIONS.auth_token_lifetime.join(", ")}`
      });
    }

    const checkResult = await req.db.query(
      `SELECT id FROM ${schema}.access_expiry_policies LIMIT 1`
    );

    let result;
    if (checkResult.rows.length === 0) {
      const query = `
        INSERT INTO ${schema}.access_expiry_policies (inactivity_deactivation, force_reauthentication, auth_token_lifetime, updated_at)
        VALUES (
          COALESCE($1, '90 days'),
          COALESCE($2, '30 days'),
          COALESCE($3, '24 hours'),
          NOW()
        )
        RETURNING *
      `;
      result = await req.db.query(query, [
        inactivity_deactivation || null,
        force_reauthentication || null,
        auth_token_lifetime || null
      ]);
    } else {
      const id = checkResult.rows[0].id;
      const query = `
        UPDATE ${schema}.access_expiry_policies
        SET
          inactivity_deactivation = COALESCE($1, inactivity_deactivation),
          force_reauthentication = COALESCE($2, force_reauthentication),
          auth_token_lifetime = COALESCE($3, auth_token_lifetime),
          updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
      result = await req.db.query(query, [
        inactivity_deactivation || null,
        force_reauthentication || null,
        auth_token_lifetime || null,
        id
      ]);
    }

    const row = result.rows[0];

    const formattedData = {
      id: row.id,
      inactivity_deactivation: {
        value: row.inactivity_deactivation,
        options: EXPIRY_OPTIONS.inactivity_deactivation
      },
      force_reauthentication: {
        value: row.force_reauthentication,
        options: EXPIRY_OPTIONS.force_reauthentication
      },
      auth_token_lifetime: {
        value: row.auth_token_lifetime,
        options: EXPIRY_OPTIONS.auth_token_lifetime
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return res.status(200).json({
      success: true,
      message: "Access expiry policy updated successfully",
      data: formattedData
    });
  } catch (err) {
    console.error("Update Access Expiry Policy Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};
