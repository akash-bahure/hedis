const { getActivePolicy } = require("../utils/passwordPolicy");

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

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Password Policy Error:", error);
    res.status(500).json({ error: error.message });
  }
};
