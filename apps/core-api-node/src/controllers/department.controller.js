const { z } = require("zod");

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
});

// CREATE DEPARTMENT
exports.createDepartment = async (req, res) => {
  const client = req.db;
  try {
    const payload = departmentSchema.parse(req.body);

    const query = `
      INSERT INTO departments (name)
      VALUES ($1)
      RETURNING *;
    `;
    const result = await client.query(query, [payload.name]);

    res.status(201).json({
      message: "Department created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    if (error.code === "23505") { // Unique violation
      return res.status(400).json({ error: "Department name already exists" });
    }
    console.error("Create Department Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET DEPARTMENTS
exports.getDepartments = async (req, res) => {
  const client = req.db;
  try {
    const { search } = req.query;

    let query = "SELECT id, name FROM departments WHERE 1=1";
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND name ILIKE $${values.length}`;
    }

    query += " ORDER BY name ASC";

    const result = await client.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Get Departments Error:", error);
    res.status(500).json({ error: error.message });
  }
};
