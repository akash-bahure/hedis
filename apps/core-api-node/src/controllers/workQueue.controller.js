const AuditLog = require("../models/AuditLog");

/**
 * GET Work Queue - Role & Stage Aware
 */
exports.getWorkQueue = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const userId = req.user?.id;
    const userRole = req.user?.role || "admin"; // 'admin', 'abstractor', 'qa'

    const {
      tab = "all",
      search,
      measurementYear,
      project_id,
      client_id,
      plan,
      priority,
      page_no = 1,
      page_size = 10,
    } = req.query;

    const page = Number(page_no);
    const limit = Number(page_size);
    const offset = (page - 1) * limit;

    // ====================== BASE FILTERS ======================
    let baseWhere = "WHERE 1=1";
    let values = [];

    // CLIENT FILTER
    if (client_id) {
      values.push(client_id);
      baseWhere += ` AND p.client_id = $${values.length}`;
    }

    if (search) {
      const term = `%${search.trim()}%`;
      values.push(term);
      baseWhere += `
        AND (p.first_name ILIKE $${values.length}
          OR p.last_name ILIKE $${values.length}
          OR p.patient_id ILIKE $${values.length}
          OR pc.chart_id ILIKE $${values.length}
          OR p.measure ILIKE $${values.length})`;
    }

    if (measurementYear) {
      values.push(measurementYear.trim());
      baseWhere += ` AND p.measure ILIKE $${values.length}`;
    }

    if (project_id) {
      values.push(project_id);
      baseWhere += ` AND p.project_id = $${values.length}`;
    }
    if (plan) {
      values.push(plan);
      baseWhere += ` AND p.plan ILIKE $${values.length}`;
    }
    if (priority) {
      values.push(priority);
      baseWhere += ` AND p.priority ILIKE $${values.length}`;
    }

    // ====================== ROLE + TAB FILTER ======================
    let tabWhere = baseWhere;
    const tabValues = [...values];

    switch (tab.toLowerCase()) {
      case "my-work":
      case "my_work":
        tabValues.push(userId);
        tabWhere += ` AND (p.assigned_to = $${tabValues.length} OR p.abstractor_id = $${tabValues.length} OR p.qa_id = $${tabValues.length})`;
        break;

      case "not-started":
      case "not_started":
        tabWhere += ` AND (p.stage IN ('Not Started', 'Unassigned') OR p.stage IS NULL)`;
        break;

      case "assigned":
        tabWhere += ` AND p.stage = 'Assigned'`;
        break;

      case "in-progress":
      case "in_progress":
        tabWhere += ` AND p.stage = 'In Progress'`;
        break;

      case "pending-qa":
      case "pending_qa":
        tabWhere += ` AND p.stage IN ('Pending QA', 'Ready for QA Review')`;
        break;

      case "qa-returned":
      case "qa_returned":
        tabWhere += ` AND p.stage IN ('QA Returned', 'Revision Required')`;
        break;

      case "rework": // ← FIXED
        tabWhere += ` AND p.stage IN ('Rework', 'QA Fail', 'QA Failed', 'QA_FAIL')`;
        break;

      case "completed":
        tabWhere += ` AND p.stage IN ('Completed', 'QA Passed', 'QA Approved')`;
        break;

      case "audit-sample":
      case "audit":
        tabWhere += ` AND p.stage IN ('Audit Sample', 'Audit', 'Audit Approved', 'Audit Failed')`;
        break;

      case "submission-ready":
      case "ready":
        tabWhere += ` AND p.stage IN ('Submission Ready', 'Ready')`;
        break;

      case "all":
      default:
        // No additional filter
        break;
    }

    // ====================== COUNTS ======================
    const userIdPlaceholder = `$${values.length + 1}`;
    const countsQuery = `
      SELECT
        COUNT(*) AS total_all,
        COUNT(CASE WHEN p.assigned_to = ${userIdPlaceholder} OR p.abstractor_id = ${userIdPlaceholder} OR p.qa_id = ${userIdPlaceholder} THEN 1 END) AS my_work,
        COUNT(CASE WHEN p.stage IN ('Not Started', 'Unassigned') OR p.stage IS NULL THEN 1 END) AS not_started,
        COUNT(CASE WHEN p.stage = 'Assigned' THEN 1 END) AS assigned,
        COUNT(CASE WHEN p.stage = 'In Progress' THEN 1 END) AS in_progress,
        COUNT(CASE WHEN p.stage IN ('Pending QA', 'Ready for QA Review') THEN 1 END) AS pending_qa,
        COUNT(CASE WHEN p.stage IN ('QA Returned', 'Revision Required') THEN 1 END) AS qa_returned,
        COUNT(CASE WHEN p.stage IN ('Rework', 'QA Fail', 'QA Failed', 'QA_FAIL') THEN 1 END) AS rework,
        COUNT(CASE WHEN p.stage IN ('Completed', 'QA Passed', 'QA Approved') THEN 1 END) AS completed,
        COUNT(CASE WHEN p.stage IN ('Audit Sample', 'Audit', 'Audit Approved', 'Audit Failed') THEN 1 END) AS audit_sample,
        COUNT(CASE WHEN p.stage IN ('Submission Ready', 'Ready') THEN 1 END) AS submission_ready
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
      ${baseWhere}
    `;

    const countsResult = await req.db.query(countsQuery, [...values, userId]);
    const c = countsResult.rows[0] || {};

    const counts = {
      all: Number(c.total_all || 0),
      myWork: Number(c.my_work || 0),
      notStarted: Number(c.not_started || 0),
      assigned: Number(c.assigned || 0),
      inProgress: Number(c.in_progress || 0),
      pendingQa: Number(c.pending_qa || 0),
      qaReturned: Number(c.qa_returned || 0),
      rework: Number(c.rework || 0),
      completed: Number(c.completed || 0),
      auditSample: Number(c.audit_sample || 0),
      submissionReady: Number(c.submission_ready || 0),
    };

    // ====================== MAIN DATA QUERY ======================
    const dataQuery = `
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
        cl.org_name AS client_name,
        cl.client_id AS client_display_id,
        ua.full_name AS abstractor_name,
        uq.full_name AS qa_name
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
      LEFT JOIN ${schema}.projects pr ON p.project_id = pr.id
      LEFT JOIN ${schema}.clients cl ON p.client_id = cl.id
      LEFT JOIN ${schema}.users ua ON p.abstractor_id = ua.id
      LEFT JOIN ${schema}.users uq ON p.qa_id = uq.id
      ${tabWhere}
      ORDER BY p.updated_at DESC
      LIMIT $${tabValues.length + 1} 
      OFFSET $${tabValues.length + 2}
    `;

    tabValues.push(limit, offset);

    const dataResult = await req.db.query(dataQuery, tabValues);

    res.json({
      success: true,
      message: "Work Queue fetched successfully",
      total: dataResult.rowCount,
      page_no: page,
      page_size: limit,
      total_pages: Math.ceil(Number(c.total_all || 0) / limit),
      counts,
      data: dataResult.rows,
    });
  } catch (err) {
    console.error("Get Work Queue Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

/**
 * REASSIGN PATIENT / CHART
 * Accepts patientId and/or chartId in params or body
 * Updates abstractor_id and/or qa_id
 */
exports.reassignChart = async (req, res) => {
  const client = req.db;
  try {
    const schema = req.tenant.schema_name;

    // Support both single and bulk
    let patientIds =
      req.body.patientIds || (req.body.patientId ? [req.body.patientId] : []);
    let chartIds =
      req.body.chartIds || (req.body.chartId ? [req.body.chartId] : []);

    // Fallback for URL params (single)
    if (!patientIds.length && !chartIds.length) {
      const patientId =
        req.params.patientId ||
        req.body.patientId ||
        req.body.patient_id ||
        req.params.id;
      const chartId =
        req.params.chartId || req.body.chartId || req.body.chart_id;
      if (patientId) patientIds = [patientId];
      if (chartId) chartIds = [chartId];
    }

    let { abstractorId, abstractor_id, qaId, qa_id, userId, role } = req.body;
    abstractorId = abstractorId || abstractor_id;
    qaId = qaId || qa_id;

    if (userId && role) {
      const lowerRole = role.toLowerCase();
      if (lowerRole.includes("qa") || lowerRole.includes("quality")) {
        qaId = userId;
      } else if (lowerRole.includes("abstractor")) {
        abstractorId = userId;
      }
    }

    if ((!patientIds.length && !chartIds.length) || (!abstractorId && !qaId)) {
      return res.status(400).json({
        success: false,
        message:
          "patientId(s) or chartId(s) and at least one of abstractorId/qaId required",
      });
    }

    const ids = patientIds.length ? patientIds : chartIds;
    const isPatientBased = patientIds.length > 0;

    const patientUpdates = [];
    const patientValues = [];
    let pParamIdx = 1;

    if (abstractorId) {
      patientUpdates.push(`abstractor_id = $${pParamIdx++}`);
      patientValues.push(abstractorId);
    }
    if (qaId) {
      patientUpdates.push(`qa_id = $${pParamIdx++}`);
      patientValues.push(qaId);
    }
    patientUpdates.push(`updated_at = NOW()`);

    const patientQuery = `
      UPDATE ${schema}.patients
      SET ${patientUpdates.join(", ")}
      WHERE ${isPatientBased ? `id = ANY($${pParamIdx})` : `id IN (SELECT patient_id FROM ${schema}.patient_charts WHERE id = ANY($${pParamIdx}))`}
      RETURNING id, patient_id, first_name, last_name, abstractor_id, qa_id, priority, stage, updated_at
    `;

    patientValues.push(ids);
    const patientResult = await client.query(patientQuery, patientValues);

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found for reassignment",
      });
    }

    // Update charts timestamp
    await client.query(
      `UPDATE ${schema}.patient_charts SET updated_at = NOW() WHERE patient_id = ANY($1)`,
      [patientResult.rows.map((r) => r.id)]
    );

    await AuditLog.createAuditLog(client, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type:
        patientIds.length > 1
          ? "Bulk Patient Reassignment"
          : "Patient Reassignment",
      details: `Reassigned ${patientResult.rowCount} patient(s). Abstractor: ${abstractorId || "Unchanged"}, QA: ${qaId || "Unchanged"}`,
      ip_address: req.ip,
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: `${patientResult.rowCount} patient(s) reassigned successfully`,
      count: patientResult.rowCount,
      data: patientResult.rows,
    });
  } catch (error) {
    console.error("Reassign Chart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * CHANGE PRIORITY
 * Accepts patientId and/or chartId in params or body, and priority in body
 * Updates priority in both patients and patient_charts tables
 */
exports.changePriority = async (req, res) => {
  const client = req.db;
  try {
    const schema = req.tenant.schema_name;

    let patientIds =
      req.body.patientIds || (req.body.patientId ? [req.body.patientId] : []);
    let chartIds =
      req.body.chartIds || (req.body.chartId ? [req.body.chartId] : []);

    // Fallback for URL params
    if (!patientIds.length && !chartIds.length) {
      const patientId =
        req.params.patientId ||
        req.body.patientId ||
        req.body.patient_id ||
        req.params.id;
      const chartId =
        req.params.chartId || req.body.chartId || req.body.chart_id;
      if (patientId) patientIds = [patientId];
      if (chartId) chartIds = [chartId];
    }

    const priority = req.body.priority;

    if ((!patientIds.length && !chartIds.length) || !priority) {
      return res.status(400).json({
        success: false,
        message: "patientId(s) or chartId(s) and priority are required",
      });
    }

    const validPriorities = ["Urgent", "High", "Medium", "Low"];
    const normalizedPriority =
      validPriorities.find(
        (p) => p.toLowerCase() === priority.trim().toLowerCase()
      ) || priority;

    const ids = patientIds.length ? patientIds : chartIds;
    const isPatientBased = patientIds.length > 0;

    const patientWhere = isPatientBased
      ? `id = ANY($2)`
      : `id IN (SELECT patient_id FROM ${schema}.patient_charts WHERE id = ANY($2))`;

    const patientQuery = `
      UPDATE ${schema}.patients
      SET priority = $1, updated_at = NOW()
      WHERE ${patientWhere}
      RETURNING id, patient_id, first_name, last_name, priority, stage, updated_at
    `;

    const patientResult = await client.query(patientQuery, [
      normalizedPriority,
      ids,
    ]);

    const chartWhere = isPatientBased ? `patient_id = ANY($2)` : `id = ANY($2)`;

    await client.query(
      `UPDATE ${schema}.patient_charts SET priority = $1, updated_at = NOW() WHERE ${chartWhere}`,
      [normalizedPriority, ids]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found",
      });
    }

    await AuditLog.createAuditLog(client, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: ids.length > 1 ? "Bulk Change Priority" : "Change Priority",
      details: `Priority updated to '${normalizedPriority}' for ${ids.length} record(s)`,
      ip_address: req.ip,
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: `Priority updated successfully for ${ids.length} record(s)`,
      count: ids.length,
      data: patientResult.rows,
    });
  } catch (error) {
    console.error("Change Priority Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * MARK COMPLETE
 * Accepts patientId and/or chartId in params or body
 * Updates patient_charts status to 'Completed' and patients stage to 'QA Passed'
 */
exports.markComplete = async (req, res) => {
  const client = req.db;
  try {
    const schema = req.tenant.schema_name;

    let patientIds =
      req.body.patientIds || (req.body.patientId ? [req.body.patientId] : []);
    let chartIds =
      req.body.chartIds || (req.body.chartId ? [req.body.chartId] : []);

    // Fallback for URL params
    if (!patientIds.length && !chartIds.length) {
      const patientId =
        req.params.patientId ||
        req.body.patientId ||
        req.body.patient_id ||
        req.params.id;
      const chartId =
        req.params.chartId || req.body.chartId || req.body.chart_id;
      if (patientId) patientIds = [patientId];
      if (chartId) chartIds = [chartId];
    }

    if (!patientIds.length && !chartIds.length) {
      return res.status(400).json({
        success: false,
        message: "patientId(s) or chartId(s) parameter is required",
      });
    }

    const ids = patientIds.length ? patientIds : chartIds;
    const isPatientBased = patientIds.length > 0;

    const chartWhere = isPatientBased ? `patient_id = ANY($1)` : `id = ANY($1)`;

    const chartResult = await client.query(
      `UPDATE ${schema}.patient_charts 
       SET status = 'Completed', updated_at = NOW() 
       WHERE ${chartWhere} 
       RETURNING id, chart_id, patient_id, status`,
      [ids]
    );

    const patientWhere = isPatientBased
      ? `id = ANY($1)`
      : `id IN (SELECT patient_id FROM ${schema}.patient_charts WHERE id = ANY($1))`;

    const patientResult = await client.query(
      `UPDATE ${schema}.patients 
       SET stage = 'QA Passed', qa_reviewed = TRUE, updated_at = NOW() 
       WHERE ${patientWhere} 
       RETURNING id, patient_id, first_name, last_name, stage, qa_reviewed, updated_at`,
      [ids]
    );

    await AuditLog.createAuditLog(client, {
      user_id: req.user?.id,
      user_name: req.user?.full_name || "System",
      event_type: ids.length > 1 ? "Bulk Mark Complete" : "Mark Complete",
      details: `Marked ${ids.length} chart(s) as Completed`,
      ip_address: req.ip,
      status: "Success",
    });

    return res.status(200).json({
      success: true,
      message: `${ids.length} chart(s) marked complete successfully`,
      count: ids.length,
      data: {
        patients: patientResult.rows,
        charts: chartResult.rows,
      },
    });
  } catch (error) {
    console.error("Mark Complete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
