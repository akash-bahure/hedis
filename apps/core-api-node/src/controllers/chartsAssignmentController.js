// controllers/chartAssignmentController.js

const { v4: uuidv4 } = require("uuid");

/**
 * BULK ASSIGN CHARTS
 * Assign selected charts to QA or Chart Abstractor
 */
exports.bulkAssignCharts = async (req, res) => {
  const client = req.db;

  try {
    const {
      chart_ids,
      assigned_to,
      assigned_role,
      priority,
      assignment_note,
    } = req.body;

    // Validations
    if (!chart_ids || !Array.isArray(chart_ids) || chart_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "chart_ids is required",
      });
    }

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: "assigned_to is required",
      });
    }

    if (!assigned_role) {
      return res.status(400).json({
        success: false,
        message: "assigned_role is required",
      });
    }

    // Only QA and Chart Abstractor allowed
    const allowedRoles = ["qa", "chart_abstractor"];

    if (!allowedRoles.includes(assigned_role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned_role",
      });
    }

    // Check user exists with given role
    const userCheckQuery = `
      SELECT u.id, r.name as role_name
      FROM users u
      JOIN user_roles ur ON ur.user_id = u.id
      JOIN roles r ON r.id = ur.role_id
      WHERE u.id = $1
      AND LOWER(r.name) = LOWER($2)
      LIMIT 1
    `;

    const userCheck = await client.query(userCheckQuery, [
      assigned_to,
      assigned_role,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Selected user is not a ${assigned_role}`,
      });
    }

    // Insert Assignments
    const insertedAssignments = [];

    for (const chartId of chart_ids) {
      const insertQuery = `
        INSERT INTO chart_assignments (
          id,
          chart_id,
          assigned_to,
          assigned_role,
          priority,
          assignment_note,
          assigned_by,
          assigned_at,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,NOW(),NOW(),NOW()
        )
        RETURNING *
      `;

      const values = [
        uuidv4(),
        chartId,
        assigned_to,
        assigned_role,
        priority || "medium",
        assignment_note || null,
        req.user.id,
      ];

      const result = await client.query(insertQuery, values);

      insertedAssignments.push(result.rows[0]);

      // Optional: Update chart status
      await client.query(
        `
          UPDATE charts
          SET
            assigned_to = $1,
            assignment_status = 'assigned',
            updated_at = NOW()
          WHERE id = $2
        `,
        [assigned_to, chartId]
      );
    }

    return res.status(201).json({
      success: true,
      message: `${chart_ids.length} charts assigned successfully`,
      data: insertedAssignments,
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