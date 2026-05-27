/**
 * Validates a password against the given policy.
 * @param {string} password - The password to validate.
 * @param {object} policy - The policy object from the database.
 * @returns {object} - { isValid: boolean, error: string | null }
 */
const validatePassword = (password, policy) => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (!policy) {
    // Default fallback if policy is missing (should not happen)
    policy = {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: true,
    };
  }

  if (password.length < policy.min_length) {
    return {
      isValid: false,
      error: `Password must be at least ${policy.min_length} characters long`,
    };
  }

  if (policy.require_uppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (policy.require_lowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (policy.require_numbers && !/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  if (policy.require_symbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Fetches the active password policy from the database.
 * @param {object} db - The database client.
 * @returns {Promise<object>} - The active policy.
 */
const getActivePolicy = async (db) => {
  const result = await db.query(
    "SELECT * FROM password_policies ORDER BY created_at DESC LIMIT 1"
  );
  return result.rows[0];
};

/**
 * Checks if a password has been used before.
 * @param {string} password - The new password.
 * @param {object} db - The database client.
 * @param {string} userId - The user ID.
 * @param {number} historyCount - The number of past passwords to check.
 * @returns {Promise<boolean>} - True if the password is in history.
 */
const checkPasswordHistory = async (password, db, userId, historyCount) => {
  if (historyCount <= 0) return false;

  const result = await db.query(
    "SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
    [userId, historyCount]
  );

  for (const row of result.rows) {
    const isMatch = await require("bcryptjs").compare(
      password,
      row.password_hash
    );
    if (isMatch) return true;
  }

  return false;
};

module.exports = {
  validatePassword,
  getActivePolicy,
  checkPasswordHistory,
};
