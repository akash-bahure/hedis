const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../services/mail.service");

// REGISTER
exports.register = async (req, res) => {
  try {

    const {
      full_name,
      email,
      password,
      user_role_id
    } = req.body;

   // Validate role from DB
   let finalRoleId = user_role_id;

   // If role is passed
   if (finalRoleId) {

  const roleResult = await req.db.query(
    `
    SELECT id, name
    FROM user_roles
    WHERE id = $1
    AND active = true
    LIMIT 1
    `,
    [finalRoleId]
  );

  if (roleResult.rows.length === 0) {
    return res.status(400).json({
      message: "Invalid role selected"
    });
  }

  roleData = roleResult.rows[0];

} else {

  // Default Role
    const defaultRoleResult = await req.db.query(
      `
      SELECT id, name
      FROM user_roles
      WHERE name = 'Chart Abstractor'
      AND system_role = true
      AND active = true
      LIMIT 1
      `
    );
  
    if (defaultRoleResult.rows.length === 0) {
      return res.status(404).json({
        message: "Default role not found"
      });
    }
  
    roleData = defaultRoleResult.rows[0];
    finalRoleId = roleData.id;
  }

    // Check if user exists
    const userCheck = await req.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Insert user
    const result = await req.db.query(
      `
      INSERT INTO users (
        full_name,
        email,
        password,
        user_role_id,
        user_status,
        is_active
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        'Active',
        true
      )

      RETURNING *
      `,
      [
        full_name,
        email,
        hashedPassword,
        finalRoleId,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: roleData.name,
        user_role_id: finalRoleId,
        user_status: user.user_status,
        is_active: user.is_active
      }
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
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
       u.email,
       u.user_role_id,
       u.password,
       u.user_status,
       u.is_active,
       u.last_login,
       ur.name as role,
       ur.system_role
     FROM users u
     LEFT JOIN user_roles ur
       ON u.user_role_id = ur.id
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
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid credentials",
      });

    }

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
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d",
      }
    );

    // Remove sensitive fields
    const {
      password: _password,
      invite_token,
      invite_token_expiry,
      invite_used,
      ...safeUser
    } = user;

    res.status(200).json({

      message: "Login successful",

      token,

      user: {
        ...safeUser,
        role: user.role,
        last_login: new Date()
      }

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
        message: "If an account exists with this email, a reset link has been sent.",
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
      message: "If an account exists with this email, a reset link has been sent.",
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

    res.json({ message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: error.message });
  }
};

