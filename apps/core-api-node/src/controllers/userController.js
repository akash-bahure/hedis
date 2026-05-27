const { z } = require("zod");
const PDFDocument = require("pdfkit");
const { sendInviteEmail } = require("../services/mail.service");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");
const userSchema = z.object({
  full_name: z.string().max(255).optional(),
  email: z.string().email().max(254),
  phone: z.string().max(15).optional(),
  department_id: z.string().uuid().nullable().optional(),
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
  department_id: z.string().uuid().nullable().optional(),
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
const deactivateUsersSchema = z.object({
  user_ids: z.array(z.string().uuid()),
});

const assignRolesSchema = z.object({
  user_ids: z.array(z.string().uuid()),
  role_id: z.string().uuid(),
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
      department_id,
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
      "SELECT id FROM users WHERE email = $1",
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
    INSERT INTO users (
      full_name, email, phone, department_id, job_title,
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
      department_id,
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

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "User created",
      details: `User created with email: ${createdUser.email}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "Medium",
      status: "Success",
    });

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
    const {
      page = 1,
      limit = 10,
      search,
      user_role,
      user_status,
      department_id,
    } = req.query;
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
    if (department_id) {
      whereClause += ` AND u.department_id = $${paramIndex}`;
      values.push(department_id);
      paramIndex++;
    }

    const query = `
      SELECT
        u.*,
        d.name as department_name,
        json_build_object(
          'id', ur.id,
          'name', ur.name,
          'description', ur.description,
          'active', ur.active,
          'system_role', ur.system_role,
          'users_count', (SELECT COUNT(*)::int FROM users WHERE user_role_id = ur.id),
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
      FROM users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      LEFT JOIN departments d ON u.department_id = d.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(Number(limit), offset);

    const result = await client.query(query, values);

    const countResult = await client.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
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
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    // Sync user_status with is_active
    if (validatedData.user_status === "Active") {
      validatedData.is_active = true;
    }

    if (
      validatedData.user_status === "Inactive" ||
      validatedData.user_status === "Suspended"
    ) {
      validatedData.is_active = false;
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
    const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check email uniqueness
    if (email) {
      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    // Validate role
    if (user_role) {
      const roleCheck = await client.query(
        "SELECT id FROM user_roles WHERE id = $1",
        [user_role]
      );

      if (roleCheck.rows.length === 0) {
        return res.status(400).json({
          message: "Invalid user role ID",
        });
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

    // Email
    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }

    // User role
    if (user_role) {
      fields.push(`user_role_id = $${index++}`);
      values.push(user_role);
    }

    // Address fields
    if (address) {
      for (const [key, value] of Object.entries(address)) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
    }

    // Project access
    if (project_access !== undefined) {
      fields.push(`project_access = $${index++}`);
      values.push(project_access || []);
    }

    // Updated timestamp
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await client.query(query, values);

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: "User updated",
      details: `User details updated for ID: ${id}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "Low",
      status: "Success",
    });

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors,
      });
    }

    console.error("Update User Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const client = req.db;

  try {
    //  Check if user exists
    const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [
      id,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await client.query("DELETE FROM users WHERE id = $1", [id]);

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: "Delete action",
      details: `User deleted with ID: ${id}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "High",
      status: "Success",
    });

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
        d.name as department,
        u.job_title,
        u.user_status,
        u.created_at,
        ur.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      LEFT JOIN departments d ON u.department_id = d.id
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

      await AuditLog.createAuditLog(req.db, {
        user_id: req.user?.id,
        user_name: req.user?.full_name || "System",
        event_type: "Export action",
        details: `Users exported to CSV. Count: ${users.length}`,
        ip_address: req.ip,
        device: req.headers["user-agent"],
        risk_level: "Low",
        status: "Success",
      });

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
      FROM users
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

// GET USER SHIFTS (Shift Management Matrix)
exports.getUserShifts = async (req, res) => {
  const client = req.db;
  try {
    const {
      page = 1,
      limit = 10,
      search,
      shift,
      week = 0,
      department,
      email,
      full_name,
      is_super_administrator,
      job_title,
      phone,
      user_role,
      user_status,
    } = req.query;

    const weekOffset = parseInt(week);
    const offset = (page - 1) * Number(limit);

    // Calculate Week Dates
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const startMonday = new Date(monday);
    startMonday.setDate(monday.getDate() + weekOffset * 7);

    const dates = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startMonday);
      d.setDate(startMonday.getDate() + i);
      dates.push({
        date: d.toISOString().split("T")[0],
        day: days[i],
        day_num: `${months[d.getMonth()]} ${d.getDate()}`,
      });
    }

    const startDate = new Date(startMonday);
    const endDate = new Date(startMonday);
    endDate.setDate(startMonday.getDate() + 6);

    const weekStr = `Week of ${months[startDate.getMonth()]} ${startDate.getDate()} - ${
      months[endDate.getMonth()] !== months[startDate.getMonth()]
        ? months[endDate.getMonth()] + " "
        : ""
    }${endDate.getDate()}, ${endDate.getFullYear()}`;

    let whereClause = "WHERE 1=1";
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (shift) {
      whereClause += ` AND u.shift = $${paramIndex}`;
      values.push(shift);
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
    if (department) {
      whereClause += ` AND u.department ILIKE $${paramIndex}`;
      values.push(`%${department}%`);
      paramIndex++;
    }
    if (email) {
      whereClause += ` AND u.email ILIKE $${paramIndex}`;
      values.push(`%${email}%`);
      paramIndex++;
    }
    if (full_name) {
      whereClause += ` AND u.full_name ILIKE $${paramIndex}`;
      values.push(`%${full_name}%`);
      paramIndex++;
    }
    if (is_super_administrator !== undefined) {
      whereClause += ` AND u.is_super_administrator = $${paramIndex}`;
      values.push(is_super_administrator === "true");
      paramIndex++;
    }
    if (job_title) {
      whereClause += ` AND u.job_title ILIKE $${paramIndex}`;
      values.push(`%${job_title}%`);
      paramIndex++;
    }
    if (phone) {
      whereClause += ` AND u.phone ILIKE $${paramIndex}`;
      values.push(`%${phone}%`);
      paramIndex++;
    }

    const query = `
      SELECT
        u.id,
        u.full_name,
        u.shift as default_shift,
        ur.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.user_role_id = ur.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const queryValues = [...values, Number(limit), offset];
    const userResult = await client.query(query, queryValues);
    const userIds = userResult.rows.map((u) => u.id);

    // Fetch Overrides from user_shifts
    let overrides = [];
    if (userIds.length > 0) {
      const overrideQuery = `
        SELECT user_id, date::text, shift 
        FROM user_shifts 
        WHERE user_id = ANY($1) 
        AND date >= $2 AND date <= $3
      `;
      const overrideResult = await client.query(overrideQuery, [
        userIds,
        dates[0].date,
        dates[6].date,
      ]);
      overrides = overrideResult.rows;
    }

    const countResult = await client.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      values
    );

    const totalCount = parseInt(countResult.rows[0].count);
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;

    // Transform results
    const users = userResult.rows.map((user) => {
      const initials = user.full_name
        ? user.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "";

      const userSchedule = dates.map((d) => {
        const override = overrides.find(
          (o) => o.user_id === user.id && o.date === d.date
        );
        return {
          date: d.date,
          day: d.day,
          shift: override ? override.shift : user.default_shift || "Off",
        };
      });

      return {
        id: user.id,
        full_name: user.full_name,
        initials: initials,
        role: user.role || "No Role",
        default_shift: user.default_shift || "Off",
        schedule: userSchedule,
      };
    });

    res.json({
      week: weekStr,
      week_offset: weekOffset,
      dates: dates,
      users: users,
      count: totalCount,
      next:
        totalCount > page * limit
          ? `${baseUrl}?page=${parseInt(page) + 1}&limit=${limit}&week=${weekOffset}`
          : null,
      previous:
        page > 1
          ? `${baseUrl}?page=${parseInt(page) - 1}&limit=${limit}&week=${weekOffset}`
          : null,
    });
  } catch (error) {
    console.error("Get User Shifts Error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserShiftSchema = z.array(
  z.object({
    user_id: z.string().uuid(),
    schedules: z.array(
      z.object({
        date: z.string(),
        shift: z.enum(["Morning", "Afternoon", "Night", "General", "Off"]),
      })
    ),
  })
);

// PATCH USER SHIFTS (Bulk Update)
exports.updateUserShifts = async (req, res) => {
  const client = req.db;

  try {
    const payload = updateUserShiftSchema.parse(req.body);

    await client.query("BEGIN");

    for (const item of payload) {
      const { user_id, schedules } = item;

      for (const sched of schedules) {
        const { date, shift } = sched;

        const upsertQuery = `
          INSERT INTO user_shifts (user_id, date, shift)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, date)
          DO UPDATE SET
            shift = EXCLUDED.shift,
            updated_at = CURRENT_TIMESTAMP
        `;

        await client.query(upsertQuery, [user_id, date, shift]);
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "User shifts updated successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        errors: error.errors,
      });
    }

    console.error("Update User Shifts Error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// GET SHIFT STATS
exports.getShiftStats = async (req, res) => {
  const client = req.db;
  try {
    const query = `
      SELECT 
        shift,
        COUNT(*)::int as count
      FROM users
      GROUP BY shift
    `;
    const result = await client.query(query);
    const counts = result.rows;

    const shiftMetadata = [
      { shift: "Morning", time: "08:00-16:00" },
      { shift: "Afternoon", time: "14:00-22:00" },
      { shift: "Night", time: "22:00-06:00" },
      { shift: "General", time: "09:00-18:00" },
      { shift: "Off", time: "—" },
    ];

    const stats = shiftMetadata.map((meta) => {
      const dbCount = counts.find((c) => c.shift === meta.shift);
      return {
        ...meta,
        count: dbCount ? dbCount.count : 0,
      };
    });

    res.json(stats);
  } catch (error) {
    console.error("Get Shift Stats Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DEACTIVATE USERS
exports.deactivateUsers = async (req, res) => {
  const client = req.db;
  try {
    const { user_ids } = deactivateUsersSchema.parse(req.body);

    if (!user_ids || user_ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    const query = `
      UPDATE users 
      SET is_active = false, 
          user_status = 'Inactive',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1)
      RETURNING id
    `;

    const result = await client.query(query, [user_ids]);

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: "Status change",
      details: `Users deactivated: ${result.rows.map((r) => r.id).join(", ")}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "High",
      status: "Success",
    });

    res.json({
      message: `${result.rowCount} user(s) deactivated successfully`,
      deactivated_user_ids: result.rows.map((r) => r.id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Deactivate Users Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ASSIGN ROLES TO MULTIPLE USERS
exports.assignRoles = async (req, res) => {
  const client = req.db;
  try {
    const { user_ids, role_id } = assignRolesSchema.parse(req.body);

    if (!user_ids || user_ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    // Check if role exists
    const roleCheck = await client.query(
      "SELECT id FROM user_roles WHERE id = $1",
      [role_id]
    );
    if (roleCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const query = `
      UPDATE users 
      SET user_role_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2)
      RETURNING id
    `;

    const result = await client.query(query, [role_id, user_ids]);

    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: "Role update",
      details: `Role ID ${role_id} assigned to users: ${result.rows.map((r) => r.id).join(", ")}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      risk_level: "High",
      status: "Success",
    });

    res.json({
      message: `Role assigned to ${result.rowCount} user(s) successfully`,
      updated_user_ids: result.rows.map((r) => r.id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error("Assign Roles Error:", error);
    res.status(500).json({ error: error.message });
  }
};
