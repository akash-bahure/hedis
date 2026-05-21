const createManualAbstraction = async (req, res) => {
  const client = req.db;

  try {
    const {
      patient_id,
      patient_chart_id,

      service_date,
      screening_type,
      evidence_type,

      systolic,
      diastolic,

      cpt_code,
      icd_10_code,

      source_type,
      evidence_source,

      uploaded_document,
      notes,

      assigned_qa,
    } = req.body;

    // CHECK PATIENT
    const patientExists = await client.query(
      `
      SELECT id
      FROM patients
      WHERE id = $1
      `,
      [patient_id]
    );

    if (patientExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // CHECK CHART
    const chartExists = await client.query(
      `
      SELECT id
      FROM patient_charts
      WHERE id = $1
      `,
      [patient_chart_id]
    );

    if (chartExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient chart not found",
      });
    }

    // INSERT
    const result = await client.query(
      `
      INSERT INTO manual_chart_abstractions (

        patient_id,
        patient_chart_id,

        service_date,
        screening_type,
        evidence_type,

        systolic,
        diastolic,

        cpt_code,
        icd_10_code,

        source_type,
        evidence_source,

        uploaded_document,
        notes,

        abstraction_status,

        created_by,
        assigned_qa

      )
      VALUES (
        $1,$2,
        $3,$4,$5,
        $6,$7,
        $8,$9,
        $10,$11,
        $12,$13,
        $14,
        $15,$16
      )
      RETURNING *
      `,
      [
        patient_id,
        patient_chart_id,

        service_date,
        screening_type,
        evidence_type,

        systolic,
        diastolic,

        cpt_code,
        icd_10_code,

        source_type,
        evidence_source,

        uploaded_document,
        notes,

        "Pending QA",

        req.user.id,
        assigned_qa,
      ]
    );

    // UPDATE CHART STATUS
    await client.query(
      `
      UPDATE patient_charts
      SET
        status = $1,
        abstraction_status = $2,
        updated_at = NOW()
      WHERE id = $3
      `,
      ["Pending QA", "Completed", patient_chart_id]
    );

    // UPDATE PATIENT STAGE
    await client.query(
      `
      UPDATE patients
      SET
        stage = $1,
        updated_at = NOW()
      WHERE id = $2
      `,
      ["Pending QA", patient_id]
    );

    return res.status(201).json({
      success: true,
      message:
        "Manual chart abstraction created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createManualAbstraction,
};