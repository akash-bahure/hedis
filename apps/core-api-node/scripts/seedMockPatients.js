// scripts/seedMockPatients.js
const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const pool = require("../src/config/db");
async function syncMockData(client, tenant, data) {
  // Set tenant schema
  await client.query(`SET search_path TO ${tenant.schema_name}, public`);
  console.log(`Using schema: ${tenant.schema_name}`);

  // Ensure default client exists
  const defaultClientResult = await client.query(
    `
INSERT INTO ${tenant.schema_name}.clients (
      client_id, org_name, short_code, region, contract_type,
      measure_year, total_charts, start_date, due_date,
      primary_contact_name, email
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (client_id) 
    DO UPDATE SET updated_at = NOW()
    RETURNING id
  `,
    [
      "CL-MOCK-001",
      "Mock Client Org",
      "MOCK",
      "West",
      "HEDIS Hybrid",
      "MY2026",
      1000,
      "2026-01-01",
      "2026-12-31",
      "Mock Admin",
      "admin@mock.com",
    ]
  );

  const internalClientId = defaultClientResult.rows[0].id;

  for (const project of data) {
    const projectResult = await client.query(
      `
INSERT INTO ${tenant.schema_name}.projects (
        project_name,
        project_id,
        client_id,
        project_type,
        specialty,
        priority,
        status,
        start_date,
        end_date
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      ON CONFLICT (project_id)
      DO UPDATE SET
        updated_at = NOW()
      RETURNING *
    `,
      [
        project.project_name,
        project.project_id,
        internalClientId,
        "HCC",
        "Cardiology",
        project.priority,
        "Active",
        "2026-01-01",
        "2026-12-31",
      ]
    );

    console.log(projectResult.rows);
    const internalProjectId = projectResult.rows[0].id;

    for (const patient of project.patients) {
      const patientResult = await client.query(
        `
INSERT INTO ${tenant.schema_name}.patients (
          patient_id,
          external_patient_id,
          external_project_id,
          first_name,
          last_name,
          dob,
          gender,
          measure,
          plan,
          priority,
          stage,
          due_date,
          project_id,
          client_id
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14
        )
        ON CONFLICT (external_patient_id)
        DO UPDATE SET
          priority = EXCLUDED.priority,
          stage = EXCLUDED.stage,
          updated_at = NOW()
        RETURNING id
      `,
        [
          `PAT-${patient.id.slice(0, 6)}`,
          patient.id,
          internalProjectId, //  UUID
          patient.first_name,
          patient.last_name,
          patient.dob,
          patient.gender,
          project.measure_set,
          patient.payer_type,
          project.priority,
          "Unassigned",
          patient.discharge_date,
          internalProjectId,
          internalClientId,
        ]
      );
      const internalPatientId = patientResult.rows[0].id;

      console.log(
        ` Patient: ${patient.first_name} ${patient.last_name} (${internalPatientId})`
      );
      const verifyPatients = await client.query(`
        SELECT id, first_name, last_name
        FROM ${tenant.schema_name}.patients
      `);

      console.log("VERIFY PATIENTS:", verifyPatients.rows);

      for (const chart of patient.charts) {
        await client.query(
          `
INSERT INTO ${tenant.schema_name}.patient_charts (
            patient_id, external_chart_id, chart_id, status,
            encounter_type, specialty, facility, encounter_date,
            admission_date, discharge_date, priority,
            chart_document, coding_notes, sla_deadline
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (external_chart_id) 
          DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
        `,
          [
            internalPatientId,
            chart.id,
            chart.chart_id,
            chart.status,
            chart.encounter_type,
            chart.specialty,
            chart.facility,
            chart.encounter_date,
            chart.admission_date,
            chart.discharge_date,
            chart.priority,
            JSON.stringify(chart.chart_document),
            chart.coding_notes,
            chart.sla_deadline,
          ]
        );
      }
    }
  }

  console.log(` Mock data synced successfully for tenant: ${tenant.subdomain}`);
}

async function run() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tenant = {
      id: "066ef989-14fd-4e3b-a46f-d0397e390975",
      name: "Acme Corp",
      subdomain: "test123",
      schema_name: "test123_schema",
    };

    const dataPath = path.join(__dirname, "mock-patients.json");

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    await syncMockData(client, tenant, data);

    await client.query("COMMIT");
    const verifyAfterCommit = await client.query(`
      SELECT *
      FROM test123_schema.patients
    `);

    console.log("FINAL PATIENTS AFTER COMMIT:", verifyAfterCommit.rows);
    const dbCheck = await client.query(`
      SELECT current_database(), current_schema(), inet_server_addr(), inet_server_port()
    `);

    console.log("SEED DB:", dbCheck.rows);

    console.log(" Transaction committed");
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(" Sync Error:", err.message);
    console.error(err);
  } finally {
    client.release();
  }
}

run();
