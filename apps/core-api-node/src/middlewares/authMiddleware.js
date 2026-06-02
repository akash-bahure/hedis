const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  // Handle Bearer token
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch user details and role from database if req.db is available
    if (req.db) {
      // Validate session if session_id is present
      if (decoded.session_id) {
        const sessionResult = await req.db.query(
          "SELECT is_active FROM user_sessions WHERE session_id = $1",
          [decoded.session_id]
        );

        if (sessionResult.rows.length === 0 || !sessionResult.rows[0].is_active) {
          return res.status(401).json({ message: "Session expired or revoked" });
        }

        // Update last active
        await req.db.query(
          "UPDATE user_sessions SET last_active = CURRENT_TIMESTAMP WHERE session_id = $1",
          [decoded.session_id]
        );
      }

      const result = await req.db.query(
        `SELECT u.id, u.email, u.full_name, ur.name as role 
         FROM users u 
         LEFT JOIN user_roles ur ON u.user_role_id = ur.id 
         WHERE u.id = $1`,
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = {
        ...req.user,
        ...result.rows[0],
        session_id: decoded.session_id, // Ensure session_id is available in req.user
      };
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;