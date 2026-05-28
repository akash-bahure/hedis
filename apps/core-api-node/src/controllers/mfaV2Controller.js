// controllers/mfaV2Controller.js

// Enum definitions for MFA
const GRACE_PERIOD_ENUM = ["none", "6h", "12h", "24hr", "48hr"];

/**
 * GET MFA Settings (v2)
 * Returns current MFA grace period and other MFA flags.
 */
exports.getMfa = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const result = await req.db.query(`SELECT * FROM ${schema}.mfa_policies LIMIT 1`);
    if (result.rows.length === 0) {
      // Insert default if missing
      await req.db.query(`INSERT INTO ${schema}.mfa_policies (require_2fa, totp_authenticator, sms_otp, email_otp, new_device_verify, grace_period)
        VALUES (TRUE, TRUE, FALSE, TRUE, TRUE, '24hr')`);
      const fresh = await req.db.query(`SELECT * FROM ${schema}.mfa_policies LIMIT 1`);
      return res.status(200).json({ success: true, message: "MFA settings fetched", data: fresh.rows[0] });
    }
    return res.status(200).json({ success: true, message: "MFA settings fetched", data: result.rows[0] });
  } catch (err) {
    console.error("GET MFA Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

/**
 * UPDATE MFA Settings (v2)
 * Allows updating the grace_period and other MFA flags.
 */
exports.updateMfa = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { require_2fa, totp_authenticator, sms_otp, email_otp, new_device_verify, grace_period } = req.body;
    // Validation for grace period
    if (grace_period && !GRACE_PERIOD_ENUM.includes(grace_period)) {
      return res.status(400).json({ success: false, message: `Invalid grace_period. Allowed: ${GRACE_PERIOD_ENUM.join(", ")}` });
    }
    const check = await req.db.query(`SELECT id FROM ${schema}.mfa_policies LIMIT 1`);
    let result;
    if (check.rows.length === 0) {
      const query = `INSERT INTO ${schema}.mfa_policies (require_2fa, totp_authenticator, sms_otp, email_otp, new_device_verify, grace_period, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;
      result = await req.db.query(query, [
        require_2fa !== undefined ? require_2fa : null,
        totp_authenticator !== undefined ? totp_authenticator : null,
        sms_otp !== undefined ? sms_otp : null,
        email_otp !== undefined ? email_otp : null,
        new_device_verify !== undefined ? new_device_verify : null,
        grace_period || null
      ]);
    } else {
      const id = check.rows[0].id;
      const query = `UPDATE ${schema}.mfa_policies SET
        require_2fa = COALESCE($1, require_2fa),
        totp_authenticator = COALESCE($2, totp_authenticator),
        sms_otp = COALESCE($3, sms_otp),
        email_otp = COALESCE($4, email_otp),
        new_device_verify = COALESCE($5, new_device_verify),
        grace_period = COALESCE($6, grace_period),
        updated_at = NOW()
        WHERE id = $7 RETURNING *`;
      result = await req.db.query(query, [
        require_2fa !== undefined ? require_2fa : null,
        totp_authenticator !== undefined ? totp_authenticator : null,
        sms_otp !== undefined ? sms_otp : null,
        email_otp !== undefined ? email_otp : null,
        new_device_verify !== undefined ? new_device_verify : null,
        grace_period || null,
        id
      ]);
    }
    return res.status(200).json({ success: true, message: "MFA settings updated", data: result.rows[0] });
  } catch (err) {
    console.error("UPDATE MFA Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};
