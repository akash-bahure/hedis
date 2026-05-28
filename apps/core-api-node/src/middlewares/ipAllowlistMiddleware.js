/**
 * IP Allowlist Middleware
 *
 * Checks if the client IP falls within any of the allowed CIDR ranges
 * stored in the tenant's `allowed_ips` table.
 *
 * Sets `req.isTrustedIp` to true if the IP is in the allowlist,
 * or if the allowlist is empty (no restrictions configured).
 */
module.exports = async function ipAllowlistMiddleware(req, res, next) {
  try {
    // Extract client IP — handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
    let clientIp = req.ip || req.connection?.remoteAddress || "0.0.0.0";
    if (clientIp.startsWith("::ffff:")) {
      clientIp = clientIp.replace("::ffff:", "");
    }

    // If no db connection (shouldn't happen after tenantMiddleware), default to untrusted
    if (!req.db) {
      req.isTrustedIp = false;
      req.clientIp = clientIp;
      return next();
    }

    // Check if any allowed IPs are configured
    const countResult = await req.db.query("SELECT COUNT(*) as total FROM allowed_ips");
    const totalRules = parseInt(countResult.rows[0].total || 0);

    // If no rules are configured, allow all IPs (no restriction)
    if (totalRules === 0) {
      req.isTrustedIp = true;
      req.clientIp = clientIp;
      return next();
    }

    // Check if client IP falls within any allowed CIDR range
    // PostgreSQL's >>= operator: 'cidr contains or equals inet'
    const matchResult = await req.db.query(
      "SELECT COUNT(*) as match_count FROM allowed_ips WHERE cidr >>= $1::inet",
      [clientIp]
    );
    const matchCount = parseInt(matchResult.rows[0].match_count || 0);

    req.isTrustedIp = matchCount > 0;
    req.clientIp = clientIp;

    next();
  } catch (error) {
    console.error("IP Allowlist Middleware Error:", error);
    // On error, default to untrusted but don't block the request
    req.isTrustedIp = false;
    req.clientIp = req.ip || "0.0.0.0";
    next();
  }
};
