const AuditLog = require("../models/AuditLog");
const measureService = require("../services/measure.service");
const {
  exportSpecsQuerySchema,
  exportSingleQuerySchema,
} = require("../validators/measure.validator");

// GET /api/measures/export-specs
exports.exportSpecs = async (req, res) => {
  try {
    const validatedQuery = exportSpecsQuerySchema.parse(req.query);
    const { format, measureYear, productLine, category, search, status } = validatedQuery;

    const schema = req.tenant.schema_name;
    let query = `
      SELECT *
      FROM ${schema}.measures 
      WHERE 1=1
    `;
    const values = [];

    if (status) {
      values.push(status.toLowerCase() === "active");
      query += ` AND active = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (measure_name ILIKE $${values.length} OR measure_code ILIKE $${values.length} OR description ILIKE $${values.length})`;
    }

    if (category && category !== "All Categories" && category !== "all") {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    if (productLine && productLine !== "All Product Lines" && productLine !== "all") {
      values.push(`%${productLine}%`);
      query += ` AND product_lines::text ILIKE $${values.length}`;
    }

    if (measureYear && measureYear !== "All Years" && measureYear !== "all") {
      values.push(measureYear);
      query += ` AND measurement_year = $${values.length}`;
    }

    query += " ORDER BY measure_name ASC";

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
      eligibility: m.eligibility,
      denominator: m.denominator,
      numerator: m.numerator,
      exclusions: m.exclusions,
      documentation: m.documentation,
    }));

    if (measures.length === 0) {
      return res.status(404).json({ message: "No measures found matching the criteria" });
    }

    // Audit Log the export action
    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "Export action",
      details: `Exported HEDIS measures technical specifications list. Count: ${measures.length}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      location: req.user?.location || "Unknown",
      risk_level: "Low",
      status: "Success",
    });

    const timestamp = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const csvContent = measureService.generateCSV(measures);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="measures_specs_${timestamp}.csv"`
      );
      return res.send(csvContent);
    }

    // Otherwise JSON
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="measures_specs_${timestamp}.json"`
    );
    return res.json(measures);
  } catch (error) {
    console.error("Export Specs Error:", error);
    if (error.name === "ZodError" || error.errors) {
      return res.status(400).json({ errors: error.errors || error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/measures/:measureId/export
exports.exportSingleMeasure = async (req, res) => {
  try {
    const { measureId } = req.params;
    const validatedQuery = exportSingleQuerySchema.parse(req.query);
    const { format } = validatedQuery;

    const measure = measureService.getMeasureByIdOrCode(measureId);

    if (!measure) {
      return res.status(404).json({ message: `Measure not found for ID or Code: ${measureId}` });
    }

    const enriched = measureService.enrichMeasure(measure);

    // Audit Log the export action
    await AuditLog.createAuditLog(req.db, {
      user_id: req.user?.id || null,
      user_name: req.user?.full_name || "System",
      event_type: "Export action",
      details: `Exported single HEDIS measure details for: ${measure.measureCode}`,
      ip_address: req.ip,
      device: req.headers["user-agent"],
      location: req.user?.location || "Unknown",
      risk_level: "Low",
      status: "Success",
    });

    const timestamp = new Date().toISOString().split("T")[0];
    const filenameBase = `measure_${measure.measureCode.toLowerCase()}_export_${timestamp}`;

    if (format === "csv") {
      const csvContent = measureService.generateSingleMeasureCSV(enriched);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filenameBase}.csv"`
      );
      return res.send(csvContent);
    }

    // Otherwise JSON (default)
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}.json"`
    );
    return res.json(enriched);
  } catch (error) {
    console.error("Export Single Measure Error:", error);
    if (error.name === "ZodError" || error.errors) {
      return res.status(400).json({ errors: error.errors || error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};
