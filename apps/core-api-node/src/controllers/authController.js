const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Check if user exists
    const userCheck = await req.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await req.db.query(
      "INSERT INTO users (full_name, email, password, user_status, is_active) VALUES ($1, $2, $3, 'Active', true) RETURNING *",
      [full_name, email, hashedPassword]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = await req.db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

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

    // Update last login
    await req.db.query(
      `UPDATE users 
       SET last_login = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [user.id]
    );

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
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
