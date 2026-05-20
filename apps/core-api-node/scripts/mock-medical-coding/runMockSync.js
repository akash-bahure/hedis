// require("dotenv").config();

// const fs = require("fs");
// const path = require("path");
// const pool = require("../../src/config/db");

// /*
// ===========================================
// LOAD MOCK DATA
// ===========================================
// */

// const mockDataPath = path.join(__dirname, "mockData.json");

// const mockApiResponse = JSON.parse(
//   fs.readFileSync(mockDataPath, "utf-8")
// );

// /*
// ===========================================
// TENANT CONFIG
// ===========================================
// */

// const tenant = {
//   schema_name: "acme15",
// };

// /*
// ===========================================
// MAIN SYNC FUNCTION
// ===========================================
// */

// async function syncMedicalCodingData(tenant, data) {
//   const client = await pool.connect();

//   try {
//     console.log("\nSCHEMA:", tenant.schema_name);

//     // 1. CREATE SCHEMA (IMPORTANT FIX)
//     await client.query(`
//       CREATE SCHEMA IF NOT EXISTS ${tenant.schema_name}
//     `);

//     // 2. SET SCHEMA CONTEXT
//     await client.query(`
//       SET search_path TO ${tenant.schema_name}
//     `);

//     /*
// ===========================================
// CREATE TABLES IF NOT EXISTS
// ===========================================
// */

// await client.query(`
// CREATE TABLE IF NOT EXISTS ${tenant.schema_name}.projects (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   project_name VARCHAR(255),
//   project_id VARCHAR(100) UNIQUE,
//   priority VARCHAR(50),
//   status VARCHAR(50),
//   project_type VARCHAR(100),
//   start_date DATE,
//   end_date DATE,
//   created_at TIMESTAMP DEFAULT NOW(),
//   updated_at TIMESTAMP DEFAULT NOW()
// );
// `);

// await client.query(`
// CREATE TABLE IF NOT EXISTS ${tenant.schema_name}.patients (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

//   patient_id VARCHAR(100) UNIQUE,

//   external_patient_id UUID UNIQUE,

//   external_project_id UUID,

//   first_name VARCHAR(255),

//   last_name VARCHAR(255),

//   dob DATE,

//   gender VARCHAR(50),

//   measure VARCHAR(255),

//   plan VARCHAR(255),

//   priority VARCHAR(50),

//   stage VARCHAR(100),

//   due_date TIMESTAMP,

//   project_id UUID REFERENCES ${tenant.schema_name}.projects(id),

//   last_updated_at TIMESTAMP DEFAULT NOW(),

//   created_at TIMESTAMP DEFAULT NOW(),

//   updated_at TIMESTAMP DEFAULT NOW()
// );
// `);

// await client.query(`
// CREATE TABLE IF NOT EXISTS ${tenant.schema_name}.patient_charts (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

//   patient_id UUID REFERENCES ${tenant.schema_name}.patients(id),

//   external_chart_id UUID UNIQUE,

//   chart_id VARCHAR(100),

//   status VARCHAR(100),

//   encounter_type VARCHAR(100),

//   specialty VARCHAR(255),

//   facility VARCHAR(255),

//   encounter_date DATE,

//   admission_date DATE,

//   discharge_date DATE,

//   priority VARCHAR(50),

//   chart_document JSONB,

//   coding_notes TEXT,

//   sla_deadline TIMESTAMP,

//   created_at TIMESTAMP DEFAULT NOW(),

//   updated_at TIMESTAMP DEFAULT NOW()
// );
// `);

//     const check = await client.query(`
//   SELECT to_regclass('${tenant.schema_name}.projects') AS table_exists
// `);

//     console.log("PROJECTS TABLE CHECK:", check.rows[0]);

//     if (!check.rows[0].table_exists) {
//       throw new Error(
//         `Tables NOT found in schema ${tenant.schema_name}. Run migrations first.`
//       );
//     }

//     /*
//     ===========================================
//     PROJECT LOOP
//     ===========================================
//     */

//     for (const project of data) {
//       const {
//         id: externalProjectId,
//         project_id,
//         name,
//         status,
//         project_type,
//         priority,
//         start_date,
//         end_date,
//         measure_set,
//         patients = [],
//       } = project;

//       console.log("\n================ PROJECT ================");
//       console.log({ project_id, name, patients: patients.length });

//       /*
//       UPSERT PROJECT
//       */
//       const projectResult = await client.query(
//         `
//         INSERT INTO projects (
//           project_name,
//           project_id,
//           priority,
//           status,
//           project_type,
//           start_date,
//           end_date
//         )
//         VALUES ($1,$2,$3,$4,$5,$6,$7)
//         ON CONFLICT (project_id)
//         DO UPDATE SET
//           project_name = EXCLUDED.project_name,
//           priority = EXCLUDED.priority,
//           status = EXCLUDED.status,
//           updated_at = NOW()
//         RETURNING id
//         `,
//         [name, project_id, priority, status, project_type, start_date, end_date]
//       );

//       const internalProjectId = projectResult.rows[0].id;

//       /*
//       ===========================================
//       PATIENT LOOP
//       ===========================================
//       */

//       for (const patient of patients) {
//         const {
//           id: externalPatientId,
//           first_name,
//           last_name,
//           dob,
//           gender,
//           payer_type,
//           discharge_date,
//           charts = [],
//         } = patient;

//         console.log("\n---- PATIENT ----");
//         console.log({ first_name, last_name, charts: charts.length });

//         /*
//         UPSERT PATIENT
//         */
//         const patientResult = await client.query(
//           `
//           INSERT INTO patients (
//             patient_id,
//             external_patient_id,
//             external_project_id,
//             first_name,
//             last_name,
//             dob,
//             gender,
//             measure,
//             plan,
//             priority,
//             stage,
//             due_date,
//             project_id,
//             last_updated_at
//           )
//           VALUES (
//             $1,$2,$3,$4,$5,$6,$7,
//             $8,$9,$10,$11,$12,$13,NOW()
//           )
//           ON CONFLICT (external_patient_id)
//           DO UPDATE SET
//             priority = EXCLUDED.priority,
//             stage = EXCLUDED.stage,
//             updated_at = NOW()
//           RETURNING id
//           `,
//           [
//             `PAT-${externalPatientId.slice(0, 6)}`,
//             externalPatientId,
//             externalProjectId,
//             first_name,
//             last_name,
//             dob,
//             gender,
//             measure_set || "",
//             payer_type,
//             priority,
//             "Unassigned",
//             discharge_date,
//             internalProjectId,
//           ]
//         );

//         const internalPatientId = patientResult.rows[0].id;

//         /*
//         ===========================================
//         CHART LOOP
//         ===========================================
//         */

//         if (!charts.length) {
//           console.log("   No charts found");
//           continue;
//         }

//         for (const chart of charts) {
//           const {
//             id: externalChartId,
//             chart_id,
//             status,
//             encounter_type,
//             speciality,
//             facility,
//             encounter_date,
//             admission_date,
//             discharge_date,
//             priority: chartPriority,
//             chart_document = [],
//             coding_notes,
//             sla_deadline,
//           } = chart;

//           console.log("   -> CHART:", chart_id);

//           await client.query(
//             `
//             INSERT INTO patient_charts (
//               patient_id,
//               external_chart_id,
//               chart_id,
//               status,
//               encounter_type,
//               specialty,
//               facility,
//               encounter_date,
//               admission_date,
//               discharge_date,
//               priority,
//               chart_document,
//               coding_notes,
//               sla_deadline
//             )
//             VALUES (
//               $1,$2,$3,$4,$5,$6,$7,
//               $8,$9,$10,$11,$12,$13,$14
//             )
//             ON CONFLICT (external_chart_id)
//             DO UPDATE SET
//               status = EXCLUDED.status,
//               updated_at = NOW()
//             `,
//             [
//               internalPatientId,
//               externalChartId,
//               chart_id,
//               status,
//               encounter_type,
//               speciality,
//               facility,
//               encounter_date,
//               admission_date,
//               discharge_date,
//               chartPriority,
//               JSON.stringify(chart_document),
//               coding_notes,
//               sla_deadline,
//             ]
//           );
//         }
//       }
//     }

//     console.log("\n==============================");
//     console.log("SYNC COMPLETED SUCCESSFULLY");
//     console.log("==============================");
//   } catch (err) {
//     console.error("\nSYNC ERROR:", err.message || err);
//   } finally {
//     client.release();
//     process.exit();
//   }
// }

// /*
// RUN SCRIPT
// */
// syncMedicalCodingData(tenant, mockApiResponse);

require("dotenv").config();

const fs = require("fs");
const path = require("path");

const pool = require("../../src/config/db");

/*
===========================================
LOAD MOCK JSON DATA
===========================================
*/

const mockDataPath = path.join(
  __dirname,
  "mockData.json"
);

const mockApiResponse = JSON.parse(
  fs.readFileSync(mockDataPath, "utf-8")
);

/*
===========================================
TENANT CONFIG
===========================================
*/

const tenant = {
  schema_name: "acme15",
};

/*
===========================================
NORMALIZE + STORE MOCK DATA
===========================================
*/

async function syncMedicalCodingData(
  tenant,
  data
) {
  const client = await pool.connect();

  try {
    console.log("\n================================");
    console.log(
      "SCHEMA:",
      tenant.schema_name
    );
    console.log("================================");

    /*
    ===========================================
    CREATE SCHEMA IF NOT EXISTS
    ===========================================
    */

    await client.query(`
      CREATE SCHEMA IF NOT EXISTS ${tenant.schema_name}
    `);

    /*
    ===========================================
    SET SEARCH PATH
    ===========================================
    */

    await client.query(`
      SET search_path TO ${tenant.schema_name}
    `);

    /*
    ===========================================
    VERIFY TABLES
    ===========================================
    */

    const check = await client.query(`
      SELECT to_regclass('${tenant.schema_name}.projects') AS table_exists
    `);

    console.log(
      "PROJECTS TABLE CHECK:",
      check.rows[0]
    );

    if (!check.rows[0].table_exists) {
      throw new Error(
        `Tables NOT found in schema ${tenant.schema_name}`
      );
    }

    /*
    ===========================================
    PROJECT LOOP
    ===========================================
    */

    for (const project of data) {
      /*
      ===========================================
      NORMALIZE PROJECT
      ===========================================
      */

      const {
        id: externalProjectId,
        project_id,
        name,
        status,
        project_type,
        priority,
        start_date,
        end_date,
        measure_set,
        patients = [],
      } = project;

      console.log(
        "\n================================"
      );

      console.log("PROJECT:", {
        project_id,
        name,
        status,
        project_type,
        priority,
        patients_count: patients.length,
      });

      /*
      ===========================================
      UPSERT PROJECT
      ===========================================
      */

      const projectResult =
        await client.query(
          `
          INSERT INTO projects (
            project_name,
            project_id,
            priority,
            status,
            project_type,
            start_date,
            end_date
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7
          )

          ON CONFLICT (project_id)

          DO UPDATE SET
            project_name = EXCLUDED.project_name,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            updated_at = NOW()

          RETURNING id
          `,
          [
            name,
            project_id,
            priority,
            status,
            project_type,
            start_date,
            end_date,
          ]
        );

      const internalProjectId =
        projectResult.rows[0].id;

      console.log(
        "PROJECT UPSERTED:",
        internalProjectId
      );

      /*
      ===========================================
      PATIENT LOOP
      ===========================================
      */

      for (const patient of patients) {
        /*
        ===========================================
        NORMALIZE PATIENT
        ===========================================
        */

        const {
          id: externalPatientId,
          first_name,
          last_name,
          dob,
          gender,
          payer_type,
          discharge_date,
          charts = [],
        } = patient;

        console.log(
          "\nPATIENT:",
          first_name,
          last_name
        );

        console.log(
          "TOTAL CHARTS:",
          charts.length
        );

        /*
        ===========================================
        UPSERT PATIENT
        ===========================================
        */

        const patientResult =
          await client.query(
            `
            INSERT INTO patients (
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
              last_updated_at
            )

            VALUES (
              $1,$2,$3,$4,$5,$6,$7,
              $8,$9,$10,$11,$12,$13,NOW()
            )

            ON CONFLICT (external_patient_id)

            DO UPDATE SET
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              priority = EXCLUDED.priority,
              updated_at = NOW()

            RETURNING id
            `,
            [
              `PAT-${externalPatientId.slice(
                0,
                6
              )}`,

              externalPatientId,

              externalProjectId,

              first_name,

              last_name,

              dob,

              gender,

              measure_set || "",

              payer_type || "",

              priority,

              "Unassigned",

              discharge_date,

              internalProjectId,
            ]
          );

        const internalPatientId =
          patientResult.rows[0].id;

        console.log(
          "PATIENT UPSERTED:",
          internalPatientId
        );

        /*
        ===========================================
        IF NO CHARTS
        ===========================================
        */

        if (!charts.length) {
          console.log(
            "NO CHARTS FOUND"
          );

          continue;
        }

        /*
        ===========================================
        CHART LOOP
        ===========================================
        */

       for (const chart of charts) {
  /*
  ===========================================
  NORMALIZE CHART
  ===========================================
  */

  const {
    id: externalChartId = null,
    chart_id = null,
    status = null,
    encounter_type = null,
    speciality = null,
    facility = null,
    encounter_date = null,
    admission_date = null,
    discharge_date = null,
    priority: chartPriority = null,
    chart_document = [],
    coding_notes = null,
    sla_deadline = null,
  } = chart;

  /*
  ===========================================
  FIX INVALID TIMESTAMP
  ===========================================
  */

  const validSlaDeadline =
    !sla_deadline || sla_deadline === "string"
      ? null
      : sla_deadline;

  console.log("\nCHART:", chart_id);

  /*
  ===========================================
  UPSERT CHART
  ===========================================
  */

  await client.query(
    `
    INSERT INTO patient_charts (
      patient_id,
      external_chart_id,
      chart_id,
      status,
      encounter_type,
      specialty,
      facility,
      encounter_date,
      admission_date,
      discharge_date,
      priority,
      chart_document,
      coding_notes,
      sla_deadline
    )

    VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,$13,$14
    )

    ON CONFLICT (external_chart_id)

    DO UPDATE SET
      status = EXCLUDED.status,
      encounter_type = EXCLUDED.encounter_type,
      specialty = EXCLUDED.specialty,
      facility = EXCLUDED.facility,
      updated_at = NOW()
    `,
    [
      internalPatientId,

      externalChartId,

      chart_id,

      status,

      encounter_type,

      speciality || null,

      facility || null,

      encounter_date || null,

      admission_date || null,

      discharge_date || null,

      chartPriority || null,

      JSON.stringify(chart_document || []),

      coding_notes || null,

      validSlaDeadline,
    ]
  );

  console.log(
    "CHART UPSERTED:",
    chart_id
  );
}
      }
    }

    /*
    ===========================================
    SUCCESS
    ===========================================
    */

    console.log(
      "\n================================"
    );

    console.log(
      "MOCK DATA SYNC SUCCESSFUL"
    );

    console.log(
      "================================"
    );
  } catch (err) {
    console.error(
      "\nSYNC ERROR:",
      err.message || err
    );
  } finally {
    client.release();
    process.exit();
  }
}

/*
===========================================
RUN SCRIPT
===========================================
*/

syncMedicalCodingData(
  tenant,
  mockApiResponse
);