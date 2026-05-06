const { z } = require("zod");
const PDFDocument = require("pdfkit");

const userSchema = z.object({
  full_name: z.string().max(255).optional(),
  email: z.string().email().max(254),
  phone: z.string().max(15).optional(),
  department: z.string().max(75).optional(),
  job_title: z.string().max(150).optional(),
  address: z
    .object({
      address_line_1: z.string().optional(),
      address_line_2: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip_code: z.string().optional(),
    })
    .optional(),
  bio: z.string().optional(),
  organization: z.string().uuid().nullable().optional(),
  user_role: z.string().uuid().nullable().optional(),
  shift: z.enum(["Morning", "Afternoon", "Night", "General", "Off"]).optional(),
  user_type: z.enum(["Local", "Azure"]).optional(),
  user_status: z
    .enum(["Pending", "Active", "Inactive", "Suspended"])
    .optional(),
  phone: z.string().max(15).optional(),
  department: z.string().max(75).optional(),
  job_title: z.string().max(150).optional(),
  bio: z.string().optional(),
  employee_id: z.string().max(100).optional(),
  send_email: z.boolean().optional(),
  two_fa_auth: z.boolean().optional(),
  is_superuser: z.boolean().optional(),
  is_staff: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_super_administrator: z.boolean().optional(),
  project_access: z.array(z.string().uuid()).optional(),
});

// CREATE USER
exports.createUser = async (req, res) => {
  const client = req.db;
  try {
    const validatedData = userSchema.parse(req.body);

    const {
      full_name,
      email,
      phone,
      department,
      job_title,
      address,
      bio,
      organization,
      user_role,
      shift,
      user_type,
      user_status,
      employee_id,
      send_email,
      two_fa_auth,
      is_superuser,
      is_staff,
      is_active,
      is_super_administrator,
      project_access,
    } = validatedData;

    // Check if email already exists
    const existingUser = await client.query(
      "SELECT id FROM org_users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if user role exists if provided
    if (user_role) {
      const roleCheck = await client.query(
        "SELECT id FROM user_roles WHERE id = $1",
        [user_role]
      );
      if (roleCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid user role ID" });
      }
    }

    const { address_line_1, address_line_2, country, city, state, zip_code } =
      address || {};

    const query = `
      INSERT INTO org_users (
        full_name, email, phone, department, job_title,
        address_line_1, address_line_2, country, city, state, zip_code,
        bio, organization_id, user_role_id, shift, user_type, user_status,
        employee_id, send_email, two_fa_auth, is_superuser, is_staff,
        is_active, is_super_administrator, project_access
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25
      ) RETURNING *
    `;

    const values = [
      full_name,
      email,
      phone,
      department,
      job_title,
      address_line_1,
      address_line_2,
      country,
      city,
      state,
      zip_code,
      bio,
      organization,
      user_role,
      shift,
      user_type,
      user_status || "Active",
      employee_id,
      send_email ?? true,
      two_fa_auth ?? false,
      is_superuser ?? false,
      is_staff ?? false,
      is_active ?? true,
      is_super_administrator ?? false,
      project_access ? JSON.stringify(project_access) : null,
    ];

    const result = await client.query(query, values);

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

// GET ALL USERS (with filtering and pagination)
exports.getUsers = async (req, res) => {
  const client = req.db;
  try {
    const { page = 1, limit = 10, search, user_role, user_status } = req.query;

    const offset = (page - 1) * limit;
    const values = [];
    let queryIndex = 1;

    let whereClause = "WHERE 1=1";

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${queryIndex} OR u.email ILIKE $${queryIndex})`;
      values.push(`%${search}%`);
      queryIndex++;
    }

    if (user_role) {
      whereClause += ` AND u.user_role_id = $${queryIndex}`;
      values.push(user_role);
      queryIndex++;
    }

    if (user_status) {
      whereClause += ` AND u.user_status = $${queryIndex}`;
      values.push(user_status);
      queryIndex++;
    }

    // Main Query
    const query = `
      SELECT 
        u.*,
        json_build_object(
          'id', ur.id,
          'name', ur.name,
          'description', ur.description,
          'active', ur.active,
          'system_role', ur.system_role,
          'users', (SELECT COUNT(*)::int FROM org_users WHERE user_role_id = ur.id),
          'permissions_count', (SELECT COUNT(*)::int FROM role_permissions WHERE role_id = ur.id)
        ) as user_role
      FROM org_users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${queryIndex} OFFSET $${queryIndex + 1}
    `;

    values.push(limit);
    values.push(offset);

    const result = await client.query(query, values);

    // Count Query for pagination
    const countQuery = `SELECT COUNT(*) FROM org_users u ${whereClause}`;
    const countResult = await client.query(
      countQuery,
      values.slice(0, queryIndex - 1)
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;
    const next =
      totalCount > page * limit
        ? `${baseUrl}?page=${parseInt(page) + 1}&limit=${limit}`
        : null;
    const previous =
      page > 1 ? `${baseUrl}?page=${parseInt(page) - 1}&limit=${limit}` : null;

    res.json({
      count: totalCount,
      next,
      previous,
      results: result.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const client = req.db;
  try {
    const validatedData = userSchema.partial().parse(req.body);

    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const {
      email,
      user_role,
      address,
      organization,
      project_access,
      ...otherFields
    } = validatedData;

    // Check if user exists
    const userCheck = await client.query(
      "SELECT id FROM org_users WHERE id = $1",
      [id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check email uniqueness if email is updated
    if (email) {
      const existingUser = await client.query(
        "SELECT id FROM org_users WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (existingUser.rows.length > 0) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
    }

    // Check if user role exists if provided
    if (user_role) {
      const roleCheck = await client.query(
        "SELECT id FROM user_roles WHERE id = $1",
        [user_role]
      );
      if (roleCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid user role ID" });
      }
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    let index = 1;

    // Handle regular fields
    for (const [key, value] of Object.entries(otherFields)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    if (user_role) {
      fields.push(`user_role_id = $${index++}`);
      values.push(user_role);
    }

    // Handle nested address fields
    if (address) {
      for (const [key, value] of Object.entries(address)) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }

    // Handle project access
    if (project_access) {
      fields.push(`project_access = $${index++}`);
      values.push(JSON.stringify(project_access));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE org_users 
      SET ${fields.join(", ")} 
      WHERE id = $${index} 
      RETURNING *
    `;
    values.push(id);

    const result = await client.query(query, values);

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const client = req.db;

  try {
    //  Check if user exists
    const userCheck = await client.query(
      "SELECT id FROM org_users WHERE id = $1",
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await client.query("DELETE FROM org_users WHERE id = $1", [id]);

    res.json({
      message: "User deleted successfully",
      deleted_user_id: id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
