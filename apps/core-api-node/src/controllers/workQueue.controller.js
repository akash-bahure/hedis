// controllers/workQueue.controller.js

/**
 * GET WORK QUEUE LIST & COUNTS
 * Retrieves the detailed work queue list filtered by stages/assignments with real-time counts.
 */
exports.getWorkQueue = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const userId = req.user.id;

    const {
      tab = "all",
      search,
      project_id,
      plan,
      priority,
      page_no = 1,
      page_size = 10,
    } = req.query;

    const page = Number(page_no);
    const limit = Number(page_size);
    const offset = (page - 1) * limit;

    // 1. Build base WHERE clause (without tab/stage filter) for conditional aggregation counts
    let baseWhere = "WHERE 1=1";
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      const searchIndex = values.length;
      baseWhere += `
        AND (
          p.first_name ILIKE $${searchIndex}
          OR p.last_name ILIKE $${searchIndex}
          OR p.patient_id ILIKE $${searchIndex}
          OR pc.chart_id ILIKE $${searchIndex}
        )
      `;
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

    // 2. Fetch total counts across all tabs simultaneously
    const userParamIndex = values.length + 1;
    const countsValues = [...values, userId];

    const countsQuery = `
      SELECT
        COUNT(*) AS total_all,
        COUNT(CASE WHEN p.assigned_to = $${userParamIndex} OR p.abstractor_id = $${userParamIndex} OR p.qa_id = $${userParamIndex} THEN 1 END) AS total_my_work,
        COUNT(CASE WHEN p.stage IN ('Not Started', 'Unassigned') THEN 1 END) AS total_not_started,
        COUNT(CASE WHEN p.stage = 'Assigned' THEN 1 END) AS total_assigned,
        COUNT(CASE WHEN p.stage = 'In Progress' THEN 1 END) AS total_in_progress,
        COUNT(CASE WHEN p.stage = 'Pending QA' THEN 1 END) AS total_pending_qa,
        COUNT(CASE WHEN p.stage IN ('QA Returned', 'QA Return') THEN 1 END) AS total_qa_returned,
        COUNT(CASE WHEN p.stage = 'Rework' THEN 1 END) AS total_rework,
        COUNT(CASE WHEN p.stage = 'Completed' THEN 1 END) AS total_completed,
        COUNT(CASE WHEN p.stage IN ('Audit Sample', 'Audit') THEN 1 END) AS total_audit,
        COUNT(CASE WHEN p.stage IN ('Submission Ready', 'Ready') THEN 1 END) AS total_ready
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
      ${baseWhere}
    `;

    const countsResult = await req.db.query(countsQuery, countsValues);
    const countsRow = countsResult.rows[0] || {};
    const counts = {
      all: Number(countsRow.total_all || 0),
      myWork: Number(countsRow.total_my_work || 0),
      notStarted: Number(countsRow.total_not_started || 0),
      assigned: Number(countsRow.total_assigned || 0),
      inProgress: Number(countsRow.total_in_progress || 0),
      pendingQa: Number(countsRow.total_pending_qa || 0),
      qaReturned: Number(countsRow.total_qa_returned || 0),
      rework: Number(countsRow.total_rework || 0),
      completed: Number(countsRow.total_completed || 0),
      auditSample: Number(countsRow.total_audit || 0),
      submissionReady: Number(countsRow.total_ready || 0)
    };

    // 3. Apply tab/stage specific filters for the list query
    let tabWhere = baseWhere;
    const finalValues = [...values];

    switch (tab.toLowerCase()) {
      case "my-work":
      case "my_work":
      case "mywork":
        finalValues.push(userId);
        tabWhere += ` AND (p.assigned_to = $${finalValues.length} OR p.abstractor_id = $${finalValues.length} OR p.qa_id = $${finalValues.length})`;
        break;
      case "not-started":
      case "not_started":
      case "notstarted":
        tabWhere += ` AND p.stage IN ('Not Started', 'Unassigned')`;
        break;
      case "assigned":
        tabWhere += ` AND p.stage = 'Assigned'`;
        break;
      case "in-progress":
      case "in_progress":
      case "inprogress":
        tabWhere += ` AND p.stage = 'In Progress'`;
        break;
      case "pending-qa":
      case "pending_qa":
      case "pendingqa":
        tabWhere += ` AND p.stage = 'Pending QA'`;
        break;
      case "qa-returned":
      case "qa_returned":
      case "qareturned":
      case "qa-return":
      case "qa_return":
      case "qareturn":
        tabWhere += ` AND p.stage IN ('QA Returned', 'QA Return')`;
        break;
      case "rework":
        tabWhere += ` AND p.stage = 'Rework'`;
        break;
      case "completed":
        tabWhere += ` AND p.stage = 'Completed'`;
        break;
      case "audit-sample":
      case "audit_sample":
      case "auditsample":
      case "audit":
        tabWhere += ` AND p.stage IN ('Audit Sample', 'Audit')`;
        break;
      case "submission-ready":
      case "submission_ready":
      case "submissionready":
      case "ready":
        tabWhere += ` AND p.stage IN ('Submission Ready', 'Ready')`;
        break;
      case "all":
      default:
        // No stage filter
        break;
    }

    // 4. Fetch the paginated matching dataset
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
      ${tabWhere}
    `;
    const countResult = await req.db.query(countQuery, finalValues);
    const total = Number(countResult.rows[0].total);

    finalValues.push(limit);
    finalValues.push(offset);
    const limitIndex = finalValues.length - 1;
    const offsetIndex = finalValues.length;

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
        p.stage AS stage,
        p.due_date AS patient_due_date,
        p.assigned_to,
        p.abstractor_id,
        p.qa_id,
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
        u_abs.full_name AS abstractor_name,
        u_qa.full_name AS qa_name
      FROM ${schema}.patients p
      LEFT JOIN ${schema}.patient_charts pc
        ON pc.patient_id = p.id
      LEFT JOIN ${schema}.projects pr
        ON p.project_id = pr.id
      LEFT JOIN ${schema}.clients cl
        ON p.client_id = cl.id
      LEFT JOIN ${schema}.users u_abs
        ON p.abstractor_id = u_abs.id
      LEFT JOIN ${schema}.users u_qa
        ON p.qa_id = u_qa.id
      ${tabWhere}
      ORDER BY p.created_at DESC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const result = await req.db.query(dataQuery, finalValues);

    return res.status(200).json({
      success: true,
      message: "Work Queue fetched successfully",
      total,
      page_no: page,
      page_size: limit,
      total_pages: Math.ceil(total / limit),
      counts,
      data: result.rows,
    });
  } catch (err) {
    console.error("Get Work Queue Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
