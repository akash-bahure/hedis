const pool = require("../config/db");

async function syncMedicalCodingData(tenant) {
  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO ${tenant.schema_name}`);

    // FETCH EXTERNAL API
    const response = await fetch(tenant.external_medical_coding_endpoint, {
      method: "GET",
      headers: {
        "X-API-KEY": tenant.api_key,
      },
    });

    if (!response.ok) {
      throw new Error("Failed external API");
    }

    const data = await response.json();

    console.log("Fetched external data", data);

    for (const project of data) {
      const externalProjectId = project.id;

      // FIND INTERNAL PROJECT
      const internalProject = await client.query(
        `
          SELECT *
          FROM projects
          WHERE project_id = $1
          `,
        [project.project_id]
      );

      const internalProjectId = internalProject.rows[0]?.id;

      for (const patient of project.patients) {
        // UPSERT PATIENT
        const patientResult = await client.query(
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
              priority = EXCLUDED.priority,
              stage = EXCLUDED.stage,
              updated_at = NOW()
            RETURNING id
            `,
          [
            `PAT-${patient.id.slice(0, 6)}`,
            patient.id,
            externalProjectId,
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
          ]
        );

        const internalPatientId = patientResult.rows[0].id;

        // CHARTS
        for (const chart of patient.charts) {
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
              updated_at = NOW()
            `,
            [
              internalPatientId,
              chart.id,
              chart.chart_id,
              chart.status,
              chart.encounter_type,
              chart.speciality,
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
  } catch (err) {
    console.error("Error syncing medical coding data", err);
  } finally {
    client.release();
  }
}

module.exports = {
  syncMedicalCodingData,
};
