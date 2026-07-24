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
