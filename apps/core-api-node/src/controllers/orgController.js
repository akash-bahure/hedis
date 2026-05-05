const { createTenant } = require("../services/tenantService");

exports.createOrg = async (req, res) => {
  try {
    const { name, subdomain } = req.body;

    const tenant = await createTenant({ name, subdomain });

    res.status(201).json({
      message: "Organization created",
      tenant,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
