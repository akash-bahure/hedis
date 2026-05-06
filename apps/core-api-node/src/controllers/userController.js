const { z } = require("zod");
const PDFDocument = require("pdfkit");
const { sendInviteEmail } = require("../services/mail.service");
const crypto = require("crypto");
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
const generateInviteToken = () => crypto.randomBytes(32).toString("hex");
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
      user_status = "Pending",
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

    // Generate Invite Token
    const inviteToken = generateInviteToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const query = `
    INSERT INTO org_users (
      full_name, email, phone, department, job_title,
      address_line_1, address_line_2, country, city, state, zip_code,
      bio, organization_id, user_role_id, shift, user_type, user_status,
      employee_id, send_email, two_fa_auth, is_superuser, is_staff,
      is_active, is_super_administrator, project_access,
      invite_token, invite_token_expiry, invite_used
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,
      $23, $24, $25, $26, $27, $28
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
      user_status,
      employee_id,
      send_email,
      two_fa_auth ?? false,
      is_superuser ?? false,
      is_staff ?? false,
      false,
      is_super_administrator ?? false,
      project_access || [],
      inviteToken,
      expiresAt,
      false,
    ];

    const result = await client.query(query, values);
    const createdUser = result.rows[0];

    // Send Invite Email
    if (send_email) {
      try {
        await sendInviteEmail(
          createdUser.email,
          createdUser.full_name,
          inviteToken
        );
      } catch (err) {
        console.error("Email failed:", err.message);
      }
    }

    res.status(201).json({
      message: "User created. Invite sent.",
      user: createdUser,
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
    const offset = (page - 1) * Number(limit);

    let whereClause = "WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (user_role) {
      whereClause += ` AND u.user_role_id = $${paramIndex}`;
      values.push(user_role);
      paramIndex++;
    }
    if (user_status) {
      whereClause += ` AND u.user_status = $${paramIndex}`;
      values.push(user_status);
      paramIndex++;
    }

    const query = `
      SELECT
        u.*,
        json_build_object(
          'id', ur.id,
          'name', ur.name,
          'description', ur.description,
          'active', ur.active,
          'system_role', ur.system_role,
          'users_count', (SELECT COUNT(*)::int FROM org_users WHERE user_role_id = ur.id),
          'permissions_count', (SELECT COUNT(*)::int FROM role_permissions WHERE role_id = ur.id)
        ) as user_role,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', p.id,
              'project_name', p.project_name,
              'project_type', p.project_type,
              'specialty', p.specialty,
              'priority', p.priority,
              'start_date', p.start_date,
              'end_date', p.end_date,
              'client_id', p.client_id
            )
          )
           FROM projects p
           WHERE p.id = ANY(u.project_access))
          , '[]'::json
        ) as projects
      FROM org_users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(Number(limit), offset);

    const result = await client.query(query, values);

    const countResult = await client.query(
      `SELECT COUNT(*) FROM org_users u ${whereClause}`,
      values.slice(0, paramIndex - 1)
    );

    const totalCount = parseInt(countResult.rows[0].count);
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;

    res.json({
      count: totalCount,
      next:
        totalCount > page * limit
          ? `${baseUrl}?page=${parseInt(page) + 1}&limit=${limit}`
          : null,
      previous:
        page > 1
          ? `${baseUrl}?page=${parseInt(page) - 1}&limit=${limit}`
          : null,
      results: result.rows,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
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

    // Existence check
    const userCheck = await client.query(
      "SELECT id FROM org_users WHERE id = $1",
      [id]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Email uniqueness
    if (email) {
      const existing = await client.query(
        "SELECT id FROM org_users WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Role validation
    if (user_role) {
      const roleCheck = await client.query(
        "SELECT id FROM user_roles WHERE id = $1",
        [user_role]
      );
      if (roleCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid user role ID" });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    // Other fields
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
    if (address) {
      for (const [key, value] of Object.entries(address)) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }
    if (project_access !== undefined) {
      fields.push(`project_access = $${index++}`);
      values.push(project_access || []); // Direct array
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

// EXPORT USERS (CSV / PDF)
exports.exportUsers = async (req, res) => {
  const client = req.db;

  try {
    const format = req.query.format || "csv";

    // Fetch users with role info
    const result = await client.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.department,
        u.job_title,
        u.user_status,
        u.created_at,
        ur.name as role_name
      FROM org_users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      ORDER BY u.created_at DESC
    `);

    const users = result.rows;

    // ================= CSV =================
    if (format === "csv") {
      const headers = [
        "ID",
        "Full Name",
        "Email",
        "Phone",
        "Department",
        "Job Title",
        "Status",
        "Role",
        "Created At",
      ];

      const csvRows = users.map((u) => [
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.department,
        u.job_title,
        u.user_status,
        u.role_name,
        u.created_at,
      ]);

      const csvContent = [headers, ...csvRows]
        .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="users.csv"');

      return res.send(csvContent);
    }

    // ================= PDF (Basic JSON → string) =================
    if (format === "pdf") {
      const doc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="users.pdf"');

      doc.pipe(res);

      doc.fontSize(18).text("Users Report", { align: "center" });
      doc.moveDown();

      users.forEach((u, index) => {
        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${u.full_name || ""} | ${u.email} | ${
              u.role_name || "No Role"
            } | ${u.user_status}`
          );
      });

      doc.end();
      return;
    }

    // Invalid format
    res.status(400).json({ message: "Invalid format. Use csv or pdf" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER STATS API
exports.getUserStats = async (req, res) => {
  const client = req.db;

  try {
    const query = `
      SELECT 
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE user_status = 'Active')::int AS active_users,
        COUNT(*) FILTER (WHERE user_status = 'Inactive')::int AS inactive_users,
        COUNT(*) FILTER (WHERE two_fa_auth = true)::int AS two_fa_enabled,
        COUNT(*) FILTER (WHERE user_type = 'Azure')::int AS sso_users
      FROM org_users
    `;

    const result = await client.query(query);

    res.json({
      message: "User stats fetched successfully",
      stats: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
