// controllers/chartAssignmentController.js

const { v4: uuidv4 } = require("uuid");
const AuditLog = require("../models/AuditLog");

/**
 * BULK ASSIGN CHARTS
 * Assign selected charts to QA or Chart Abstractor
 */
exports.bulkAssignCharts = async (req, res) => {
  const client = req.db;

  try {
    const {
      chart_ids,
      assigned_users,
      priority,
      assignment_note,
    } = req.body;

    console.log(
      "BULK ASSIGN BODY =>",
      JSON.stringify(req.body, null, 2)
    );

    // Validate chart ids
    if (
      !chart_ids ||
      !Array.isArray(chart_ids) ||
      chart_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "chart_ids is required",
      });
    }

    // Validate assigned users
    if (
      !assigned_users ||
      !Array.isArray(assigned_users) ||
      assigned_users.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "assigned_users is required",
      });
    }

    const insertedAssignments = [];

    // Loop through assigned users
    for (const user of assigned_users) {
      const assigned_to = user.user_id;
      const assigned_role = user.assigned_role;

      if (!assigned_to) {
        return res.status(400).json({
          success: false,
          message: "user_id is required",
        });
      }

      if (!assigned_role) {
        return res.status(400).json({
          success: false,
          message: "assigned_role is required",
        });
      }

      // Validate role
      const allowedRoles = [
        "Quality Analyst",
        "Chart Abstractor",
      ];

      if (!allowedRoles.includes(assigned_role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid assigned_role: ${assigned_role}`,
        });
      }

      // Verify user exists
      const userCheck = await client.query(
        `
        SELECT u.id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
        `,
        [assigned_to]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `User not found: ${assigned_to}`,
        });
      }

      // Assign all selected charts
      for (const chartId of chart_ids) {
        const result = await client.query(
          `
          INSERT INTO chart_assignments (
            id,
            patient_chart_id,
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
          `,
          [
            uuidv4(),
            chartId,
            assigned_to,
            assigned_role,
            priority || "Medium",
            assignment_note || null,
            req.user.id,
          ]
        );

        insertedAssignments.push(result.rows[0]);

        await client.query(
          `
          UPDATE chartser
          SET
            assigned_to = $1,
            assignment_status = 'assigned',
            updated_at = NOW()
          WHERE id = $2
          `,
          [assigned_to, chartId]
        );
      }
    }

    await AuditLog.createAuditLog(client, {
      user_id: req.user.id,
      user_name: req.user.full_name || "System",
      event_type: "Bulk Chart Assignment",
      details: `${chart_ids.length} charts assigned`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "Low",
      status: "Success",
    });

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