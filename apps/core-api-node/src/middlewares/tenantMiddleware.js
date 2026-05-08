const pool = require("../config/db");

module.exports = async function tenantMiddleware(req, res, next) {
  const client = await pool.connect();

  try {
    const host = new URL(req.headers.origin).hostname;
    const hostname = host.split(":")[0];

    const subdomain = hostname.split(".")[0];

    const result = await client.query(
      "SELECT * FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const tenant = result.rows[0];

    if (!tenant.is_active || tenant.is_archived) {
      return res.status(403).json({
        message: "Organization inactive",
      });
    }

    // Validate schema
    if (!/^[a-zA-Z0-9_]+$/.test(tenant.schema_name)) {
      throw new Error("Invalid schema");
    }
    await client.query(`SET search_path TO ${tenant.schema_name}`);

    req.db = client;
    req.tenant = tenant;

    res.on("finish", () => {
      client.release();
    });

    next();
  } catch (err) {
    client.release();
    next(err);
  }
};
