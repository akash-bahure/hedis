exports.getMeasures = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const {
      search,
      category,
      productLine,
      measurementYear,
      active = true,
      page = 1,
      limit = 20, // default page size
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT id, measure_code, measure_name, description, category, 
             measure_type, product_lines, active, measurement_year 
      FROM ${schema}.measures 
      WHERE 1=1
    `;
    const values = [];

    // Filters
    if (active !== undefined) {
      values.push(active === "true" || active === true);
      query += ` AND active = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (measure_name ILIKE $${values.length} OR measure_code ILIKE $${values.length})`;
    }

    if (category && category !== "All Categories") {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    if (productLine && productLine !== "All Product Lines") {
      values.push(`%${productLine}%`);
      query += ` AND product_lines::text ILIKE $${values.length}`;
    }

    if (measurementYear && measurementYear !== "All Years") {
      values.push(measurementYear);
      query += ` AND measurement_year = $${values.length}`;
    }

    // Count total records for pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS count`;
    const countResult = await req.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY measure_name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limitNum, offset);

    const result = await req.db.query(query, values);

    const measures = result.rows.map((m) => ({
      id: m.id,
      measureCode: m.measure_code,
      measureName: m.measure_name,
      description: m.description,
      category: m.category,
      measureType: m.measure_type,
      productLines: m.product_lines,
      active: m.active,
      measurementYear: m.measurement_year,
    }));

    return res.status(200).json({
      message: "Measures fetched successfully",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: measures,
    });
  } catch (err) {
    console.error("Get Measures Error:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
};
exports.getMeasureRules = async (req, res) => {
  try {
    const { id } = req.params;
    const schema = req.tenant.schema_name;

    // Check if ID is likely a UUID or a number
    const isNumeric = !isNaN(id);
    const query = isNumeric
      ? `SELECT * FROM ${schema}.measures WHERE id = $1`
      : `SELECT * FROM ${schema}.measures WHERE measure_code = $1`;

    const result = await req.db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Measure not found",
      });
    }

    const m = result.rows[0];
    // Map database snake_case to JSON camelCase to maintain compatibility
    const measureData = {
      ...m,
      measureCode: m.measure_code,
      measureName: m.measure_name,
      measureType: m.measure_type,
      productLines: m.product_lines,
      measurementYear: m.measurement_year,
      // The other JSONB fields like eligibility, denominator etc. are already objects
    };

    return res.status(200).json({
      message: "Measure details fetched successfully",
      data: measureData,
    });
  } catch (err) {
    console.error("Get Measure Details Error:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
};
