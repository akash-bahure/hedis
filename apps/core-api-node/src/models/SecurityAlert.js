/**
 * @desc    Helper to create a security alert
 * @param   {Object} db - Database connection
 * @param   {Object} alertData - Alert data
 */
const createSecurityAlert = async (db, alertData) => {
  const {
    alert_type,
    severity,
    status = 'Active',
    user_id = null,
    user_name = null,
    ip_address = null,
    description = null,
    investigation_details = null,
    metadata = {}
  } = alertData;

  const query = `
    INSERT INTO security_alerts (
      alert_type, severity, status, user_id, user_name, ip_address, description, investigation_details, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const values = [
    alert_type, severity, status, user_id, user_name, ip_address, description, investigation_details, metadata
  ];

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Create Security Alert Error:", error);
    // We don't want to fail the main process if alert creation fails
    return null;
  }
};

module.exports = {
  createSecurityAlert
};
