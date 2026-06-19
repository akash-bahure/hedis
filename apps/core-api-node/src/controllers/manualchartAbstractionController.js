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
    console.log(`[Manual Abstraction] Saving record for Patient: ${patient_id}`);
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
        assigned_qa,
        abstracted_by,
        abstracted_at

      )
      VALUES (
        $1,$2,
        $3,$4,$5,
        $6,$7,
        $8,$9,
        $10,$11,
        $12,$13,
        $14,
        $15,$16,$17,NOW()
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
        req.user.id,
      ]
    );

    // SYNCHRONIZE WITH TIMELINE_EVENTS
    console.log(`[Manual Abstraction] Synchronizing with Timeline Events...`);
    const synthesizedEvidence = `${evidence_type} - ${notes || ''} ${systolic ? `BP: ${systolic}/${diastolic}` : ''} ${cpt_code ? `CPT: ${cpt_code}` : ''}`.trim();

    // Deduplication Check
    const existingTimeline = await client.query(
      `SELECT id FROM ${req.tenant.schema_name}.clinical_timeline_events WHERE patient_id = $1 AND measure = $2 AND event_date = $3`,
      [patient_id, screening_type, service_date]
    );

    if (existingTimeline.rows.length > 0) {
      console.log(`[Manual Abstraction] Updating existing timeline event ID: ${existingTimeline.rows[0].id}`);
      await client.query(
        `
        UPDATE ${req.tenant.schema_name}.clinical_timeline_events
        SET evidence = $1, source_type = 'MANUAL', review_status = 'REVIEW_REQUIRED', chart_id = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $4
        `,
        [synthesizedEvidence, patient_chart_id, req.user.id, existingTimeline.rows[0].id]
      );
    } else {
      console.log(`[Manual Abstraction] Creating new timeline event`);
      await client.query(
        `
        INSERT INTO ${req.tenant.schema_name}.clinical_timeline_events (
          patient_id, chart_id, measure, event_type, evidence, event_date,
          source_type, review_status, reviewed_by, reviewed_at, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'MANUAL', 'REVIEW_REQUIRED', $7, NOW(), NOW())
        `,
        [patient_id, patient_chart_id, screening_type, evidence_type, synthesizedEvidence, service_date, req.user.id]
      );
    }

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