// controllers/chartAssignmentController.js

const { v4: uuidv4 } = require("uuid");
// controllers/chartAssignmentController.js

const AuditLog = require("../models/AuditLog");

/**
 * BULK ASSIGN CHARTS
 * Assign multiple patients/charts to Abstractors and/or QA users
 * Consistent with single assignPatient API
 */
exports.bulkAssignCharts = async (req, res) => {
  const client = req.db;

  try {
    const {
      patient_ids,
      chart_ids,
      abstractorId,
      qaId,
      priority,
      assignment_note,
    } = req.body;

    const ids = patient_ids || chart_ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "patient_ids (or chart_ids) array is required",
      });
    }

    if (!abstractorId && !qaId) {
      return res.status(400).json({
        success: false,
        message: "At least abstractorId or qaId is required",
      });
    }

    const schema = req.tenant.schema_name;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (abstractorId) {
      updates.push(`abstractor_id = $${paramIndex++}`);
      values.push(abstractorId);
    }
    if (qaId) {
      updates.push(`qa_id = $${paramIndex++}`);
      values.push(qaId);
    }
    if (priority) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }
    updates.push(`updated_at = NOW()`);

    // === CRITICAL FIX: Cast to uuid[] ===
    const placeholders = ids
      .map((_, i) => `$${paramIndex + i}::uuid`)
      .join(", ");
    values.push(...ids);

    const query = `
      UPDATE ${schema}.patients 
      SET ${updates.join(", ")}
      WHERE id = ANY(ARRAY[${placeholders}])
      RETURNING id, patient_id, first_name, last_name, 
                abstractor_id, qa_id, priority, stage, updated_at
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching patients found",
      });
    }

    // Audit Log (optional)
    await AuditLog.createAuditLog(client, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: "Bulk Patient Assignment",
      details: `${result.rows.length} patients assigned`,
      ip_address: req.ip,
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: `${result.rows.length} patient(s) assigned successfully`,
      assignedCount: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Bulk Assign Charts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
/**
 * GET USERS FOR ASSIGNMENT
 * Fetch only QA & Chart Abstractor users
 */
exports.getAssignableUsers = async (req, res) => {
  const client = req.db;

  try {
    const query = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        r.name as role
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE LOWER(r.name) IN ('qa', 'chart_abstractor')
      ORDER BY u.first_name ASC
    `;

    const result = await client.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get Assignable Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
