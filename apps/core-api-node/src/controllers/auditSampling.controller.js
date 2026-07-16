/**
 * Audit Sampling Controller
 */

exports.updatePatientAuditStage = async (req, res) => {
  const client = req.db;
  try {
    const { patientId, action, reason, additionalNotes } = req.body;
    const schema = req.tenant.schema_name;

    if (!patientId || !action) {
      return res.status(400).json({
        error: "patientId and action are required",
      });
    }

    const validActions = ["AUDIT_APPROVE", "REQUEST_REWORK", "AUDIT_FAIL"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Allowed: ${validActions.join(", ")}`,
      });
    }

    let finalStage = "Audit Approved";
    if (action === "REQUEST_REWORK") finalStage = "Rework Required";
    else if (action === "AUDIT_FAIL") finalStage = "Audit Failed";

    await client.query("BEGIN");

    await client.query(
      `UPDATE ${schema}.patients
         SET stage = $1,
             audit_reviewed = TRUE,
             updated_at = NOW()
         WHERE id = $2`,
      [finalStage, patientId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: `Patient audit stage updated successfully to "${finalStage}"`,
      patientId,
      action,
      finalStage,
      reason: reason || null,
      additionalNotes: additionalNotes || null,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Patient Audit Stage Error:", err);
    res.status(500).json({
      error: err.message || "Failed to update audit stage",
    });
  }
};

/**
 * Audit Sampling Controller
 */

// 1. Per-Measure Audit Decisions (Similar to assignAbstractor)
exports.updateAuditDecisions = async (req, res) => {
  const client = req.db;
  try {
    const { patientId, chartId, decisions } = req.body;
    const schema = req.tenant.schema_name;

    if (
      !patientId ||
      !decisions ||
      !Array.isArray(decisions) ||
      decisions.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: patientId and decisions (non-empty array)",
      });
    }

    await client.query("BEGIN");

    const processedMeasures = [];

    for (const decision of decisions) {
      const { measureId, measureCode, measureName, auditStatus, reasons } =
        decision;

      if (!measureCode || !auditStatus) {
        throw new Error(
          "measureCode and auditStatus are required for each decision"
        );
      }

      const validStatuses = ["AUDIT_APPROVE", "REQUEST_REWORK", "AUDIT_FAIL"];
      if (!validStatuses.includes(auditStatus)) {
        throw new Error(`Invalid auditStatus: ${auditStatus}`);
      }

      // UPDATE if record exists
      const updateResult = await client.query(
        `UPDATE ${schema}.hedis_audit_measure_decisions
           SET audit_status = $1,
               reasons = $2,
               chart_id = $3,
               decided_by = $4,
               updated_at = NOW()
           WHERE patient_id = $5 
             AND measure_code = $6`,
        [
          auditStatus,
          JSON.stringify(reasons || []),
          chartId || null,
          req.user?.id || null,
          patientId,
          measureCode,
        ]
      );

      // INSERT if no record was updated
      if (updateResult.rowCount === 0) {
        await client.query(
          `INSERT INTO ${schema}.hedis_audit_measure_decisions
               (patient_id, chart_id, measure_id, measure_code, measure_name,
                audit_status, reasons, decided_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [
            patientId,
            chartId || null,
            measureId || null,
            measureCode,
            measureName || null,
            auditStatus,
            JSON.stringify(reasons || []),
            req.user?.id || null,
          ]
        );
      }

      processedMeasures.push({
        measureId,
        measureCode,
        measureName,
        auditStatus,
        reasons: reasons || [],
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Audit measure decisions updated successfully",
      patientId,
      chartId: chartId || null,
      totalMeasures: processedMeasures.length,
      measures: processedMeasures,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update Audit Decisions Error:", err);
    res.status(500).json({
      error: err.message || "Failed to update audit decisions",
    });
  }
};

/**
 * GET Audit Queue - All QA Reviewed Patients
 */
exports.getAuditQueue = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { search, stage, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [`p.qa_reviewed = TRUE`];
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
          p.first_name ILIKE $${paramIndex} OR 
          p.last_name ILIKE $${paramIndex} OR 
          p.patient_id ILIKE $${paramIndex}
        )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (stage) {
      whereConditions.push(`p.stage = $${paramIndex}`);
      queryParams.push(stage);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const mainQuery = `
        SELECT 
          p.id AS patient_uuid,
          p.patient_id AS mrn,
          p.first_name,
          p.last_name,
          p.dob,
          p.gender,
          p.measure,
          p.plan,
          p.priority AS patient_priority,
          p.stage,
          p.due_date AS patient_due_date,
          p.assigned_to,
          p.abstractor_id,
          p.qa_id,
          p.qa_reviewed,
          p.audit_reviewed,
  
          pc.id AS chart_uuid,
          pc.chart_id,
          pc.status AS chart_status,
          pc.encounter_type,
          pc.specialty,
          pc.facility,
          pc.encounter_date,
          pc.admission_date,
          pc.discharge_date,
          pc.priority AS chart_priority,
          pc.chart_document,
          pc.coding_notes,
          pc.sla_deadline,
  
          pr.project_name,
          pr.project_id AS project_display_id,
  
          c.org_name AS client_name,
          c.client_id AS client_display_id,
  
          -- Names
          a.full_name AS abstractor_name,
          q.full_name AS qa_name
  
        FROM ${schema}.hedis_qa_measure_decisions qd
        INNER JOIN ${schema}.patients p ON p.id = qd.patient_id
        LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
        LEFT JOIN ${schema}.projects pr ON pr.id = p.project_id
        LEFT JOIN ${schema}.clients c ON c.id = p.client_id
        LEFT JOIN ${schema}.users a ON a.id = p.abstractor_id
        LEFT JOIN ${schema}.users q ON q.id = p.qa_id
        ${whereClause}
        GROUP BY 
          p.id, p.patient_id, p.first_name, p.last_name, p.dob, p.gender,
          p.measure, p.plan, p.priority, p.stage, p.due_date,
          p.assigned_to, p.abstractor_id, p.qa_id, p.qa_reviewed, p.audit_reviewed,
          pc.id, pc.chart_id, pc.status, pc.encounter_type, pc.specialty,
          pc.facility, pc.encounter_date, pc.admission_date, pc.discharge_date,
          pc.priority, pc.chart_document, pc.coding_notes, pc.sla_deadline,
          pr.project_name, pr.project_id, c.org_name, c.client_id,
          a.full_name, q.full_name
        ORDER BY p.updated_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

    queryParams.push(limit, offset);

    const result = await req.db.query(mainQuery, queryParams);

    // Total count
    const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM ${schema}.hedis_qa_measure_decisions qd
        JOIN ${schema}.patients p ON p.id = qd.patient_id
        WHERE p.qa_reviewed = TRUE
          ${search ? `AND (p.first_name ILIKE $1 OR p.last_name ILIKE $1 OR p.patient_id ILIKE $1)` : ""}
          ${stage ? `AND p.stage = $${search ? 2 : 1}` : ""}
      `;

    const countParams = search ? [`%${search}%`] : [];
    if (stage) countParams.push(stage);

    const countResult = await req.db.query(countQuery, countParams);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: "Audit Queue fetched successfully",
      total,
      page_no: parseInt(page),
      page_size: parseInt(limit),
      total_pages: Math.ceil(total / limit),
      counts: {
        all: total,
        auditSample: total,
      },
      data: result.rows,
    });
  } catch (err) {
    console.error("Get Audit Queue Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch audit queue",
    });
  }
};

/**
 * GET Audit Measures for a Patient
 * Returns only measures that have QA_PASS status from hedis_qa_measure_decisions
 */
exports.getAuditMeasures = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    // Verify patient exists
    const patientCheck = await req.db.query(
      `SELECT id FROM ${schema}.patients WHERE id = $1`,
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const query = `
        SELECT 
          qd.id AS decision_id,
          qd.measure_id,
          qd.measure_code,
          qd.measure_name,
          qd.qa_status,
          qd.reasons,
          qd.created_at,
          e.id AS evaluation_id,
          e.status AS evaluation_status,
          e.confidence
        FROM ${schema}.hedis_qa_measure_decisions qd
        LEFT JOIN ${schema}.hedis_evaluations e 
          ON e.id = qd.measure_id 
          AND e.patient_id = qd.patient_id
        WHERE qd.patient_id = $1 
          AND qd.qa_status = 'QA_PASS'
        ORDER BY qd.created_at DESC
      `;

    const result = await req.db.query(query, [patientId]);

    res.json({
      success: true,
      patient_id: patientId,
      total: result.rows.length,
      measures: result.rows.map((row) => ({
        decision_id: row.decision_id,
        measure_id: row.measure_id,
        evaluation_id: row.evaluation_id, // ← Important for getQAReviewDetails
        measure_code: row.measure_code,
        measure_name: row.measure_name,
        qa_status: row.qa_status,
        reasons: row.reasons,
        evaluation_status: row.evaluation_status,
        confidence: row.confidence,
      })),
    });
  } catch (err) {
    console.error("Get Audit Measures Error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch audit measures",
    });
  }
};
