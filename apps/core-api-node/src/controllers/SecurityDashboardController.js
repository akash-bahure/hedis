const { getActivePolicy } = require("../utils/passwordPolicy");
const AuditLog = require("../models/AuditLog");

/**
 * @desc    Get password policy
 * @route   GET /api/security/password-policy
 * @access  Private (Admin)
 */
exports.getPasswordPolicy = async (req, res) => {
  try {
    const policy = await getActivePolicy(req.db);
    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("Get Password Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Update password policy
 * @route   PUT /api/security/password-policy
 * @access  Private (Admin)
 */
exports.updatePasswordPolicy = async (req, res) => {
  try {
    const {
      min_length,
      expiry_days,
      history_count,
      require_uppercase,
      require_lowercase,
      require_numbers,
      require_symbols,
      max_failed_attempts,
    } = req.body;

    // We assume there's only one active policy for now
    const currentPolicy = await getActivePolicy(req.db);

    if (!currentPolicy) {
      // Create if doesn't exist (though migration should have created it)
      const result = await req.db.query(
        `INSERT INTO password_policies (
          min_length, expiry_days, history_count, 
          require_uppercase, require_lowercase, require_numbers, require_symbols, 
          max_failed_attempts
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          min_length || 8,
          expiry_days || 90,
          history_count || 10,
          require_uppercase !== undefined ? require_uppercase : true,
          require_lowercase !== undefined ? require_lowercase : true,
          require_numbers !== undefined ? require_numbers : true,
          require_symbols !== undefined ? require_symbols : true,
          max_failed_attempts || 5,
        ]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    }

    const result = await req.db.query(
      `UPDATE password_policies 
       SET min_length = COALESCE($1, min_length),
           expiry_days = COALESCE($2, expiry_days),
           history_count = COALESCE($3, history_count),
           require_uppercase = COALESCE($4, require_uppercase),
           require_lowercase = COALESCE($5, require_lowercase),
           require_numbers = COALESCE($6, require_numbers),
           require_symbols = COALESCE($7, require_symbols),
           max_failed_attempts = COALESCE($8, max_failed_attempts),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [
        min_length,
        expiry_days,
        history_count,
        require_uppercase,
        require_lowercase,
        require_numbers,
        require_symbols,
        max_failed_attempts,
        currentPolicy.id,
      ]
    );

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "settings",
      details: `Password policy updated. Min length: ${result.rows[0].min_length}, Expiry days: ${result.rows[0].expiry_days}, Max failed attempts: ${result.rows[0].max_failed_attempts}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "High",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Password Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get login activity (successful vs failed) for the last 24 hours
 * @route   GET /api/security/login-activity
 * @access  Private (Admin)
 */
exports.getLoginActivity = async (req, res) => {
  try {
    const query = `
      WITH hourly_stats AS (
        SELECT 
          date_trunc('hour', created_at) AS hour,
          status,
          COUNT(*) AS count
        FROM audit_logs
        WHERE 
          created_at >= NOW() - INTERVAL '24 hours'
          AND event_type IN ('Login Success', 'Login Failed')
        GROUP BY hour, status
      )
      SELECT 
        hour,
        SUM(CASE WHEN status = 'Success' THEN count ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'Failed' THEN count ELSE 0 END) as failed
      FROM hourly_stats
      GROUP BY hour
      ORDER BY hour ASC;
    `;

    const result = await req.db.query(query);

    // Calculate totals
    const totalsQuery = `
      SELECT 
        SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) as total_successful,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as total_failed
      FROM audit_logs
      WHERE 
        created_at >= NOW() - INTERVAL '24 hours'
        AND event_type IN ('Login Success', 'Login Failed');
    `;
    const totalsResult = await req.db.query(totalsQuery);

    res.status(200).json({
      success: true,
      data: {
        hourly: result.rows,
        totals: {
          successful: parseInt(totalsResult.rows[0].total_successful || 0),
          failed: parseInt(totalsResult.rows[0].total_failed || 0),
        },
      },
    });
  } catch (error) {
    console.error("Get Login Activity Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get security dashboard stats (cards)
 * @route   GET /api/security/stats
 * @access  Private (Admin)
 */
exports.getSecurityStats = async (req, res) => {
  try {
    // 1. Active Sessions (Unique users with Login Success in last 60 minutes)
    const activeSessionsQuery = `
      SELECT COUNT(DISTINCT user_id) as active_count
      FROM audit_logs
      WHERE event_type = 'Login Success'
        AND created_at >= NOW() - INTERVAL '60 minutes'
    `;
    const activeSessionsResult = await req.db.query(activeSessionsQuery);

    // 2. PHI Events (24h)
    const phiEventsQuery = `
      SELECT COUNT(*) as phi_count
      FROM audit_logs
      WHERE (event_type IN ('Chart assigned', 'Export action') OR details ILIKE '%PHI%' OR details ILIKE '%patient%')
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    const phiEventsResult = await req.db.query(phiEventsQuery);

    // 3. Failed Logins (24h) + Critical + Blocked IP
    const failedLoginsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE risk_level = 'Critical') as critical
      FROM audit_logs
      WHERE event_type = 'Login Failed'
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;
    const failedLoginsResult = await req.db.query(failedLoginsQuery);

    const blockedIpQuery = `
      SELECT ip_address, COUNT(*) as count
      FROM audit_logs
      WHERE event_type = 'Login Failed'
        AND created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY ip_address
      ORDER BY count DESC
      LIMIT 1
    `;
    const blockedIpResult = await req.db.query(blockedIpQuery);

    // 4. Security Score Calculation (Heuristic)
    // Base 100
    // -1 per failed login (max -20)
    // -5 per critical log (max -30)
    // +10 if 2FA adoption > 50%
    const totalFailed = parseInt(failedLoginsResult.rows[0].total || 0);
    const totalCritical = parseInt(failedLoginsResult.rows[0].critical || 0);

    const usersCountQuery = "SELECT COUNT(*) as total FROM users";
    const mfaUsersCountQuery =
      "SELECT COUNT(*) as mfa_total FROM users WHERE two_fa_auth = true";

    const [usersResult, mfaResult] = await Promise.all([
      req.db.query(usersCountQuery),
      req.db.query(mfaUsersCountQuery),
    ]);

    const totalUsers = parseInt(usersResult.rows[0].total || 1);
    const totalMfa = parseInt(mfaResult.rows[0].mfa_total || 0);
    const mfaAdoption = (totalMfa / totalUsers) * 100;

    let score = 100;
    score -= Math.min(totalFailed, 20);
    score -= Math.min(totalCritical * 5, 30);
    if (mfaAdoption > 50) score += 5;
    if (mfaAdoption > 80) score += 5;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let posture = "Excellent";
    if (score < 90) posture = "Good";
    if (score < 75) posture = "Fair";
    if (score < 60) posture = "Poor";

    res.status(200).json({
      success: true,
      data: {
        securityScore: {
          score: score,
          label: "Security Score",
          posture: `${posture} posture`,
          trend: "+2 this week", // Simplified since we don't have historical score table yet
        },
        activeSessions: {
          value: parseInt(activeSessionsResult.rows[0].active_count || 0),
          label: "Active Sessions",
          footer: "right now",
        },
        phiEvents: {
          value: parseInt(phiEventsResult.rows[0].phi_count || 0),
          label: "PHI Events (24h)",
          footer: "chart accesses",
        },
        failedLogins: {
          value: totalFailed,
          label: "Failed Logins (24h)",
          criticalCount: totalCritical,
          footer: blockedIpResult.rows[0]
            ? `${blockedIpResult.rows[0].count} blocked: ${blockedIpResult.rows[0].ip_address}`
            : "No blocked IPs",
        },
      },
    });
  } catch (error) {
    console.error("Get Security Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get all allowed IPs (CIDR ranges)
 * @route   GET /api/security/allowed-ips
 * @access  Private (Admin)
 */
exports.getAllowedIps = async (req, res) => {
  try {
    const result = await req.db.query(
      "SELECT * FROM allowed_ips ORDER BY created_at DESC"
    );
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get Allowed IPs Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Add a new allowed IP (CIDR range)
 * @route   POST /api/security/allowed-ips
 * @access  Private (Admin)
 */
exports.addAllowedIp = async (req, res) => {
  try {
    const { cidr, description } = req.body;

    if (!cidr) {
      return res.status(400).json({ error: "CIDR range is required" });
    }

    // Basic CIDR validation (Postgres will also validate on insert)
    const cidrRegex =
      /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    if (!cidrRegex.test(cidr)) {
      return res.status(400).json({ error: "Invalid CIDR range format" });
    }

    const result = await req.db.query(
      "INSERT INTO allowed_ips (cidr, description) VALUES ($1, $2) RETURNING *",
      [cidr, description]
    );

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "settings",
      details: `Added allowed IP range: ${cidr}`,
      ip_address: req.ip,
      risk_level: "Medium",
      status: "Success",
    });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Add Allowed IP Error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "CIDR range already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Delete an allowed IP (CIDR range)
 * @route   DELETE /api/security/allowed-ips/:id
 * @access  Private (Admin)
 */
exports.deleteAllowedIp = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await req.db.query(
      "SELECT * FROM allowed_ips WHERE id = $1",
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "IP range not found" });
    }

    await req.db.query("DELETE FROM allowed_ips WHERE id = $1", [id]);

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "settings",
      details: `Deleted allowed IP range: ${checkResult.rows[0].cidr}`,
      ip_address: req.ip,
      risk_level: "Medium",
      status: "Success",
    });

    res.status(200).json({
      success: true,
      message: "IP range deleted successfully",
    });
  } catch (error) {
    console.error("Delete Allowed IP Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get Security Score Dashboard
 * @route   GET /api/security/security-score
 * @access  Private (Admin)
 */
exports.getSecurityScore = async (req, res) => {
  try {
    const failedLoginsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (
          WHERE risk_level = 'Critical'
        ) as critical
      FROM audit_logs
      WHERE event_type = 'Login Failed'
      AND created_at >= NOW() - INTERVAL '24 hours'
    `;

    const usersCountQuery = `
      SELECT COUNT(*) as total
      FROM users
    `;

    const mfaUsersQuery = `
      SELECT COUNT(*) as total
      FROM users
      WHERE two_fa_auth = true
    `;

    const phiPoliciesQuery = `
      SELECT *
      FROM phi_policies
      LIMIT 1
    `;

    const allowListQuery = `
      SELECT COUNT(*) as total
      FROM allowed_ips
    `;

    const [
      failedResult,
      usersResult,
      mfaResult,
      phiResult,
      allowListResult
    ] = await Promise.all([
      req.db.query(failedLoginsQuery),
      req.db.query(usersCountQuery),
      req.db.query(mfaUsersQuery),
      req.db.query(phiPoliciesQuery),
      req.db.query(allowListQuery)
    ]);

    const totalFailed =
      parseInt(failedResult.rows[0].total || 0);

    const totalCritical =
      parseInt(failedResult.rows[0].critical || 0);

    const totalUsers =
      parseInt(usersResult.rows[0].total || 1);

    const totalMfa =
      parseInt(mfaResult.rows[0].total || 0);

    const phi =
      phiResult.rows[0] || {};

    const hasAllowList =
      parseInt(
        allowListResult.rows[0].total || 0
      ) > 0;

    const mfaAdoption =
      (totalMfa / totalUsers) * 100;

    /**
     * Authentication
     */
    let authentication = 100;

    authentication -= Math.min(
      totalFailed * 2,
      20
    );

    authentication -= Math.min(
      totalCritical * 5,
      20
    );

    authentication -= Math.max(
      0,
      80 - mfaAdoption
    ) * 0.5;

    authentication = Math.max(
      0,
      Math.min(
        100,
        Math.round(authentication)
      )
    );

    /**
     * Data Protection
     */
    let dataProtection = 0;

    if (phi.enc_rest)
      dataProtection += 40;

    if (phi.enc_transit)
      dataProtection += 40;

    if (phi.de_id_export)
      dataProtection += 20;

    /**
     * Access Control
     */
    let accessControl = 0;

    if (phi.dlp)
      accessControl += 60;

    if (hasAllowList)
      accessControl += 40;

    /**
     * Audit Coverage
     */
    let auditCoverage = 0;

    if (phi.audit_trail)
      auditCoverage += 70;

    if (phi.phi_mask)
      auditCoverage += 30;

    /**
     * Facility Device
     */
    const facilityDevice = 80;

    const overallScore = Math.round(
      authentication * 0.25 +
      dataProtection * 0.25 +
      accessControl * 0.20 +
      auditCoverage * 0.20 +
      facilityDevice * 0.10
    );

    let posture = "Excellent";

    if (overallScore < 90)
      posture = "Good";

    if (overallScore < 75)
      posture = "Fair";

    if (overallScore < 60)
      posture = "Poor";

    res.status(200).json({
      success: true,
      data: {
        overall_score: overallScore,
        max_score: 100,
        posture,
        trend: "+2 this week",

        categories: [
          {
            label: "Authentication",
            score: authentication,
            weight: 25
          },
          {
            label: "Data Protection",
            score: dataProtection,
            weight: 25
          },
          {
            label: "Access Control",
            score: accessControl,
            weight: 20
          },
          {
            label: "Audit Coverage",
            score: auditCoverage,
            weight: 20
          },
          {
            label: "Facility/Device",
            score: facilityDevice,
            weight: 10
          }
        ]
      }
    });
  } catch (error) {
    console.error(
      "Get Security Score Error:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getPhiEncryptionControls = async (req, res) => {
  const client = req.db;

  try {
    const result = await client.query(`
      SELECT *
      FROM phi_encryption_controls
      LIMIT 1
    `);

    return res.status(200).json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch PHI controls",
    });
  }
};

exports.updatePhiEncryptionControls = async (req, res) => {
  const client = req.db;

  try {
    const {
      encryption_at_rest,
      encryption_in_transit,
      phi_masking_logs,
      full_access_audit_trail,
      deidentify_on_export,
      dlp_controls,
    } = req.body;

    const result = await client.query(
      `
      UPDATE phi_encryption_controls
      SET
        encryption_at_rest = COALESCE($1, encryption_at_rest),
        encryption_in_transit = COALESCE($2, encryption_in_transit),
        phi_masking_logs = COALESCE($3, phi_masking_logs),
        full_access_audit_trail = COALESCE($4, full_access_audit_trail),
        deidentify_on_export = COALESCE($5, deidentify_on_export),
        dlp_controls = COALESCE($6, dlp_controls),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        encryption_at_rest,
        encryption_in_transit,
        phi_masking_logs,
        full_access_audit_trail,
        deidentify_on_export,
        dlp_controls,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "PHI & Encryption Controls updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update PHI controls",
    });
  }
};
