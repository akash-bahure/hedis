require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const importMeasures = async () => {
  const schema = process.argv[2];
  const measurementYear = process.argv[3] || "MY2026";

  if (!schema) {
    console.error(
      "Please provide a schema name. Usage: node src/scripts/importMeasures.js <schema_name> [measurement_year]"
    );
    process.exit(1);
  }

  try {
    const filePath = path.join(__dirname, "../data/measureLibrary.json");
    if (!fs.existsSync(filePath)) {
      console.error(`Measure library file not found at ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const measures = data.measures;

    console.log(`Starting import for schema: ${schema}`);
    console.log(`Total measures found: ${measures.length}`);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const measure of measures) {
        const {
          measureCode,
          measureName,
          description,
          category,
          measureType,
          productLines,
          active,
          eligibility,
          denominator,
          numerator,
          exclusions,
          documentation,
        } = measure;

        const query = `
          INSERT INTO ${schema}.measures (
            measure_code,
            measure_name,
            description,
            category,
            measure_type,
            measurement_year,
            active,
            product_lines,
            eligibility,
            denominator,
            numerator,
            exclusions,
            documentation,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          ON CONFLICT (measure_code) DO UPDATE SET
            measure_name = EXCLUDED.measure_name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            measure_type = EXCLUDED.measure_type,
            measurement_year = EXCLUDED.measurement_year,
            active = EXCLUDED.active,
            product_lines = EXCLUDED.product_lines,
            eligibility = EXCLUDED.eligibility,
            denominator = EXCLUDED.denominator,
            numerator = EXCLUDED.numerator,
            exclusions = EXCLUDED.exclusions,
            documentation = EXCLUDED.documentation,
            updated_at = NOW();
        `;

        const values = [
          measureCode,
          measureName,
          description,
          category,
          measureType,
          measurementYear,
          active !== undefined ? active : true,
          JSON.stringify(productLines || []),
          JSON.stringify(eligibility || {}),
          JSON.stringify(denominator || {}),
          JSON.stringify(numerator || {}),
          JSON.stringify(exclusions || []),
          JSON.stringify(documentation || {}),
        ];

        await client.query(query, values);
        console.log(`Successfully upserted measure: ${measureCode}`);
      }

      await client.query("COMMIT");
      console.log("Import completed successfully!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error during import, rolling back:", err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to import measures:", err);
  } finally {
  }
};

importMeasures();
