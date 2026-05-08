const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    `
    SELECT * FROM super_admins
    WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const admin = result.rows[0];

  if (!admin.is_active) {
    return res.status(403).json({
      message: "Admin inactive",
    });
  }

  const match = await bcrypt.compare(password, admin.password);

  if (!match) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: admin.id,
      role: "super_admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.json({
    token,
    id: admin.id,
    name: admin.name,
    email: admin.email,
  });
};
