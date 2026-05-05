const pool = require("../config/db");

// CREATE USER ROLE
exports.createUserRole = async (req, res) => {
  const client = req.db;

  try {
    const { name, description, level, active, role_permissions } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    await client.query("BEGIN");

    const roleResult = await client.query(
      `INSERT INTO user_roles (name, description, level, active) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, level || 0, active ?? true]
    );

    const roleId = roleResult.rows[0].id;

    if (Array.isArray(role_permissions)) {
      for (const permission of role_permissions) {
        await client.query(
          `INSERT INTO role_permissions 
           (role_id, module, can_view, can_edit, can_assign, can_approve, can_reject, can_export, can_override) 
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            roleId,
            permission.module,
            permission.can_view || false,
            permission.can_edit || false,
            permission.can_assign || false,
            permission.can_approve || false,
            permission.can_reject || false,
            permission.can_export || false,
            permission.can_override || false,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "User role created successfully",
      role: roleResult.rows[0],
      permissions: role_permissions || [],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
};

// GET ALL USER ROLES
exports.getUserRoles = async (req, res) => {
  try {
    const rolesQuery = `
      SELECT 
        ur.*, 
        (SELECT COUNT(*)::int FROM role_permissions rp WHERE rp.role_id = ur.id) as permissions_count
      FROM user_roles ur
      ORDER BY ur.created_at DESC
    `;

    const result = await req.db.query(rolesQuery);

    res.json({
      count: result.rows.length,
      next: null,
      previous: null,
      results: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE USER ROLE
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const client = req.db;
  try {
    const { name, description, level, active, role_permissions } = req.body;

    await client.query("BEGIN");

    // Build update fields dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (level !== undefined) {
      fields.push(`level = $${index++}`);
      values.push(level);
    }
    if (active !== undefined) {
      fields.push(`active = $${index++}`);
      values.push(active);
    }

    if (fields.length === 0 && !role_permissions) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "No fields to update" });
    }

    let roleResult = null;
    if (fields.length > 0) {
      const query = `UPDATE user_roles SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${index} RETURNING *`;
      values.push(id);
      roleResult = await client.query(query, values);

      if (roleResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Role not found" });
      }
    }

    // Update permissions if provided
    if (role_permissions && Array.isArray(role_permissions)) {
      await client.query("DELETE FROM role_permissions WHERE role_id = $1", [
        id,
      ]);

      for (const permission of role_permissions) {
        await client.query(
          `INSERT INTO role_permissions 
          (role_id, module, can_view, can_edit, can_assign, can_approve, can_reject, can_export, can_override) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            id,
            permission.module,
            permission.can_view || false,
            permission.can_edit || false,
            permission.can_assign || false,
            permission.can_approve || false,
            permission.can_reject || false,
            permission.can_export || false,
            permission.can_override || false,
          ]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "User role updated successfully",
      role: roleResult
        ? roleResult.rows[0]
        : (await client.query("SELECT * FROM user_roles WHERE id = $1", [id]))
            .rows[0],
      permissions: role_permissions || [],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

const MODULE_GROUP_MAPPING = {
  "Patients & Charts": "Main",
  Projects: "Main",
  Dashboard: "Main",
  "Work Queue": "Main",
  Coding: "Operations",
  Auditing: "Operations",
  Exceptions: "Operations",
  Reports: "Insight",
  Analytics: "Insight",
  "Users & Roles": "Administration",
  "Security & Compliance": "Administration",
  "AI Optimization": "Administration",
  Settings: "Administration",
};

// GET USER ROLE BY ID
exports.getUserRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const roleResult = await pool.query(
      "SELECT * FROM user_roles WHERE id = $1",
      [id]
    );
    if (roleResult.rows.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    const role = roleResult.rows[0];

    const permissionsResult = await req.db.query(
      "SELECT * FROM role_permissions WHERE role_id = $1",
      [id]
    );

    const permissions = permissionsResult.rows;

    // Group permissions
    const groupedPermissions = [];
    const groups = {};

    permissions.forEach((p) => {
      const groupName = MODULE_GROUP_MAPPING[p.module] || "Other";
      if (!groups[groupName]) {
        groups[groupName] = { group: groupName, modules: [] };
        groupedPermissions.push(groups[groupName]);
      }
      groups[groupName].modules.push({
        id: p.id,
        module: p.module,
        module_group: groupName,
        can_view: p.can_view,
        can_edit: p.can_edit,
        can_assign: p.can_assign,
        can_approve: p.can_approve,
        can_reject: p.can_reject,
        can_export: p.can_export,
        can_override: p.can_override,
      });
    });

    res.json({
      id: role.id,
      name: role.name,
      description: role.description,
      level: role.level,
      active: role.active,
      users_count: 0, // Skipped for now
      permissions_count: permissions.length,
      permissions_all: groupedPermissions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
