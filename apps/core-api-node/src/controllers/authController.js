const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../services/mail.service");

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
  "Measure Library": "Main",
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = await req.db.query(
      `
    SELECT
    u.id,
    u.full_name,
    u.credentials,
    u.email,
    u.phone,
    u.mobile_phone,
    u.department_id,
    u.job_title,
    u.address_line_1,
    u.address_line_2,
    u.country,
    u.city,
    u.state,
    u.zip_code,
    u.location,
    u.bio,
    u.organization_id,
    u.user_role_id,
    u.shift,
    u.user_type,
    u.send_email,
    u.two_fa_auth,
    u.user_status,
    u.last_login,
    u.is_superuser,
    u.is_staff,
    u.is_active,
    u.last_password_changed,
    u.employee_id,
    u.is_super_administrator,
    u.project_access,
    u.preferences,
    u.certifications,
    u.notifications,
    u.security,
    u.created_at,
    u.updated_at,
    u.password,

    ur.name AS role,
    ur.description AS role_description,
    ur.active AS role_active,
    ur.system_role,

    t.name AS organization_name

    FROM users u
    LEFT JOIN user_roles ur ON u.user_role_id = ur.id
    LEFT JOIN tenants t ON u.organization_id = t.id
    WHERE u.email = $1
  `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    // Check password exists
    if (!user.password) {
      return res.status(400).json({
        message: "Password not set for this user",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Fetch Role & Permissions details
    let userRole = null;
    if (user.user_role_id) {
      // Get users count for this role
      const userCountResult = await req.db.query(
        "SELECT COUNT(*)::int FROM users WHERE user_role_id = $1",
        [user.user_role_id]
      );

      // Get permissions
      const permissionsResult = await req.db.query(
        "SELECT * FROM role_permissions WHERE role_id = $1",
        [user.user_role_id]
      );
      const permissions = permissionsResult.rows;

      const isChartAbstractor = user.role?.toLowerCase() === "chart abstractor";
      const isQualityAnalyst = user.role?.toLowerCase() === "quality analyst";
      const isAdminRole = [
        "admin",
        "super admin",
        "operations/program manager",
      ].includes(user.role?.toLowerCase());

      // Group permissions
      const groupedPermissions = [];
      const groups = {};

      if (isAdminRole) {
        // Force all modules for Admin/Super Admin
        Object.keys(MODULE_GROUP_MAPPING).forEach((moduleName) => {
          const groupName = MODULE_GROUP_MAPPING[moduleName];
          if (!groups[groupName]) {
            groups[groupName] = { group: groupName, modules: [] };
            groupedPermissions.push(groups[groupName]);
          }
          groups[groupName].modules.push({
            id: null,
            module: moduleName,
            module_group: groupName,
            can_view: true,
            can_edit: true,
            can_assign: true,
            can_approve: true,
            can_reject: true,
            can_export: true,
            can_override: true,
          });
        });
      } else if (isChartAbstractor || isQualityAnalyst) {
        // Force specific modules for Chart Abstractor and Quality Analyst system roles
        const forcedModules = isChartAbstractor
          ? ["Dashboard", "Work Queue", "Reports", "Settings"]
          : ["Dashboard", "Work Queue"];

        forcedModules.forEach((moduleName) => {
          const groupName = MODULE_GROUP_MAPPING[moduleName] || "Main";
          if (!groups[groupName]) {
            groups[groupName] = { group: groupName, modules: [] };
            groupedPermissions.push(groups[groupName]);
          }
          groups[groupName].modules.push({
            id: null,
            module: moduleName,
            module_group: groupName,
            can_view: true,
            can_edit: true,
            can_assign: true,
            can_approve: true,
            can_reject: true,
            can_export: true,
            can_override: true,
          });
        });
      } else {
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
      }

      userRole = {
        id: user.user_role_id,
        name: user.role,
        description: user.role_description || "",
        active: user.role_active,
        users: userCountResult.rows[0].count,
        system_role: user.system_role,
        permissions_count: permissions.length,
        permissions: groupedPermissions,
      };
    }

    // Fetch Organization details
    const organization = user.organization_id
      ? {
          id: user.organization_id,
          name: user.organization_name || "",
        }
      : null;

    // Update last login
    await req.db.query(
      `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user.id]
    );

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Remove sensitive and redundant fields
    const {
      password: _password,
      reset_token,
      reset_token_expiry,
      role: _role,
      role_description: _role_desc,
      role_active: _role_active,
      system_role: _sys_role,
      organization_name: _org_name,
      ...safeUser
    } = user;

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        ...safeUser,
        role: user.role,
        organization,
        user_role: userRole,
        last_login: new Date(),
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};
// SET PASSWORD (INVITE FLOW)
exports.setPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirm Password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const client = req.db;

    // Find user by token
    const userResult = await client.query(
      "SELECT id, invite_token_expiry, invite_used FROM users WHERE invite_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const user = userResult.rows[0];

    // Check if token already used
    if (user.invite_used) {
      return res.status(400).json({ message: "Invite link already used" });
    }

    // Check expiry
    if (new Date() > new Date(user.invite_token_expiry)) {
      return res.status(400).json({ message: "Invite link has expired" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await client.query(
      `UPDATE users 
       SET password = $1, 
           invite_used = true, 
           is_active = true, 
           user_status = 'Active', 
           invite_token = NULL, 
           invite_token_expiry = NULL,
           last_password_changed = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password set successfully. You can now log in." });
  } catch (error) {
    console.error("Set Password Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const client = req.db;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const userResult = await client.query(
      "SELECT id, full_name, email FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // For security, don't reveal if user exists or not
      return res.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const user = userResult.rows[0];

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await client.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [token, expiry, user.id]
    );

    // Send Email
    await sendResetEmail(user.email, user.full_name, token);

    res.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    const client = req.db;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by token
    const userResult = await client.query(
      "SELECT id, reset_token_expiry FROM users WHERE reset_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    const user = userResult.rows[0];

    // Check expiry
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ message: "Reset link has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    await client.query(
      `UPDATE users 
       SET password = $1, 
           reset_token = NULL, 
           reset_token_expiry = NULL,
           last_password_changed = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: error.message });
  }
};
