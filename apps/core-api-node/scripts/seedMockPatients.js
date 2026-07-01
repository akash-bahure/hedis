// scripts/seedMockPatients.js
const path = require("path");
const fs = require("fs");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const pool = require("../src/config/db");
const hedisService = require("../src/services/hedis.service");

async function syncMockData(client, tenant, data, jobsToQueue) {
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
          internalProjectId,
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

      for (const chart of patient.charts) {
        // === IMPROVED CHART DOCUMENT SEEDING ===
        let chartDoc = chart.chart_document || {};

        // Handle if chart_document is already stringified
        if (typeof chartDoc === "string") {
          try {
            chartDoc = JSON.parse(chartDoc);
          } catch (e) {
            chartDoc = {};
          }
        }

        // Standardize chart_document structure for consistency with getQAReviewDetails
        const documentMetadata = {
          fileName: chartDoc.fileName || "Patient_upload_chart_short1.pdf",
          filePath:
            chartDoc.filePath || "charts/Patient_upload_chart_short1.pdf",
          mimeType: "application/pdf",
          pages: chartDoc.pages || 15,
          uploadedAt: new Date().toISOString(),
          size: chartDoc.size || null,
        };

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
          DO UPDATE SET 
            status = EXCLUDED.status, 
            chart_document = EXCLUDED.chart_document,
            updated_at = NOW()
        `,
          [
            internalPatientId,
            chart.id,
            chart.chart_id,
            chart.status,
            chart.encounter_type,
            chart.speciality || chart.specialty, // Support both spellings
            chart.facility,
            chart.encounter_date,
            chart.admission_date,
            chart.discharge_date,
            chart.priority,
            JSON.stringify(documentMetadata), // ← Improved
            chart.coding_notes,
            chart.sla_deadline,
          ]
        );

        jobsToQueue.push({
          patientId: internalPatientId,
          chartDocument: documentMetadata,
          tenantSubdomain: tenant.subdomain,
        });

        console.log(
          `[SEEDING] Prepared HEDIS + Timeline jobs for Patient: ${internalPatientId}`
        );
      }
    }
  }

  console.log(` Mock data synced successfully for tenant: ${tenant.subdomain}`);
}

async function run() {
  const client = await pool.connect();
  let success = true;

  try {
    await client.query("BEGIN");

    const tenant = {
      id: "e52eac24-fa2c-44be-a7d1-1cd45fa596d7",
      name: "Acme Corp",
      subdomain: "testhedis4",
      schema_name: "testhedis4_schema",
    };

    const dataPath = path.join(__dirname, "mock-patients.json");

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const jobsToQueue = [];
    await syncMockData(client, tenant, data, jobsToQueue);
    await client.query("COMMIT");
    console.log(
      `Transaction committed. Queuing ${jobsToQueue.length} HEDIS jobs...`
    );

    for (const job of jobsToQueue) {
      await hedisService.queueHedisAnalysis(
        job.patientId,
        job.chartDocument,
        job.tenantSubdomain
      );
      await hedisService.queueTimelineExtraction(
        job.patientId,
        job.chartDocument,
        job.tenantSubdomain
      );
    }

    console.log("All HEDIS + Timeline jobs queued successfully.");

    // Better verification
    const verifyAfterCommit = await client.query(`
      SELECT p.first_name, p.last_name, 
             pc.chart_id, 
             pc.chart_document->>'fileName' as pdf_name,
             pc.chart_document->>'filePath' as pdf_path
      FROM ${tenant.schema_name}.patients p
      JOIN ${tenant.schema_name}.patient_charts pc ON pc.patient_id = p.id
      LIMIT 5
    `);

    console.log("FINAL PATIENTS WITH CHARTS:", verifyAfterCommit.rows);
    console.log(" Transaction committed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(" Sync Error:", err.message);
    console.error(err);
    success = false;
  } finally {
    client.release();
    try {
      const { hedisQueue, qaReviewQueue, timelineQueue } = require("../src/config/queue");
      if (hedisQueue) await hedisQueue.close();
      if (qaReviewQueue) await qaReviewQueue.close();
      if (timelineQueue) await timelineQueue.close();
      console.log(" Redis connection closed");
    } catch (e) {}
    try {
      await pool.end();
      console.log(" Database pool closed");
    } catch (e) {}
    process.exit(success ? 0 : 1);
  }
}

run();
