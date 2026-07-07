// services/dashboard.service.js

exports.getSummary = async (db, schema) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM ${schema}.patients) AS total_patients,
      (SELECT COUNT(*) FROM ${schema}.patients WHERE stage = 'Assigned' OR abstractor_id IS NOT NULL) AS assigned_patients,
      (SELECT COUNT(*) FROM ${schema}.patients WHERE stage IN ('Completed', 'Done', 'QA Approved', 'QA_APPROVED')) AS completed_patients,
      (SELECT COUNT(*) FROM ${schema}.patients WHERE stage IN ('Unassigned', 'Not Started')) AS pending_patients,
      
      (SELECT COUNT(*) FROM ${schema}.patient_charts) AS total_charts,
      (SELECT COUNT(*) FROM ${schema}.patient_charts pc JOIN ${schema}.patients p ON pc.patient_id = p.id WHERE p.stage IN ('In Progress', 'Pending QA', 'QA Returned', 'Rework')) AS charts_in_progress,
      (SELECT COUNT(*) FROM ${schema}.patient_charts pc JOIN ${schema}.patients p ON pc.patient_id = p.id WHERE p.stage IN ('Completed', 'Done', 'QA Approved', 'QA_APPROVED')) AS charts_completed,
      (SELECT COUNT(*) FROM ${schema}.patient_charts pc JOIN ${schema}.patients p ON pc.patient_id = p.id WHERE p.stage IN ('Unassigned', 'Assigned', 'Not Started')) AS charts_pending,
      
      (SELECT COUNT(*) FROM ${schema}.hedis_evaluations) AS total_measures,
      (SELECT COUNT(*) FROM ${schema}.hedis_evaluations WHERE stage IN ('In Progress', 'Pending QA', 'QA Returned', 'Rework')) AS measures_in_progress,
      (SELECT COUNT(*) FROM ${schema}.hedis_evaluations WHERE status = 'Compliant' OR stage IN ('Completed', 'QA Approved', 'QA_APPROVED')) AS measures_completed,
      (SELECT COUNT(*) FROM ${schema}.hedis_evaluations WHERE stage IN ('Unassigned', 'Assigned', 'Not Started')) AS measures_pending,
      
      (SELECT COUNT(DISTINCT assigned_to) FROM ${schema}.chart_assignments WHERE assigned_role = 'Chart Abstractor') AS total_active_abstractors,
      (SELECT COUNT(DISTINCT assigned_to) FROM ${schema}.chart_assignments WHERE assigned_role = 'Quality Analyst') AS total_active_qa_users,
      
      (SELECT COUNT(*) FROM ${schema}.clients) AS total_clients,
      (SELECT COUNT(*) FROM ${schema}.projects) AS total_projects
  `;
  const result = await db.query(query);
  const row = result.rows[0] || {};
  
  // Format response matching screenshot requirements
  return {
    total_patients: parseInt(row.total_patients || 0, 10),
    assigned_patients: parseInt(row.assigned_patients || 0, 10),
    completed_patients: parseInt(row.completed_patients || 0, 10),
    pending_patients: parseInt(row.pending_patients || 0, 10),
    
    total_charts: parseInt(row.total_charts || 0, 10),
    charts_in_progress: parseInt(row.charts_in_progress || 0, 10),
    charts_completed: parseInt(row.charts_completed || 0, 10),
    charts_pending: parseInt(row.charts_pending || 0, 10),
    
    total_measures: parseInt(row.total_measures || 0, 10),
    measures_in_progress: parseInt(row.measures_in_progress || 0, 10),
    measures_completed: parseInt(row.measures_completed || 0, 10),
    measures_pending: parseInt(row.measures_pending || 0, 10),
    
    total_active_abstractors: parseInt(row.total_active_abstractors || 0, 10),
    total_active_qa_users: parseInt(row.total_active_qa_users || 0, 10),
    
    total_clients: parseInt(row.total_clients || 0, 10),
    total_projects: parseInt(row.total_projects || 0, 10),
  };
};

exports.getDeadlines = async (db, schema) => {
  // Groups workload by measure_code from hedis_evaluations and calculates SLAs natively
  const query = `
    SELECT
      he.measure_code AS measure,
      MAX(he.measure_name) AS measure_name,
      MIN(pc.sla_deadline) AS due_date,
      COUNT(DISTINCT p.id) AS total_patients_eligible,
      COUNT(DISTINCT CASE WHEN p.stage IN ('Completed', 'Done', 'QA Approved', 'QA_APPROVED') THEN p.id END) AS patients_completed,
      COUNT(DISTINCT CASE WHEN p.stage IN ('Unassigned', 'Not Started', 'Assigned') THEN p.id END) AS patients_pending,
      COUNT(DISTINCT CASE WHEN p.stage IN ('In Progress', 'Pending QA', 'QA Returned', 'Rework') THEN p.id END) AS patients_in_progress
    FROM ${schema}.hedis_evaluations he
    JOIN ${schema}.patients p ON he.patient_id = p.id
    LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
    GROUP BY he.measure_code
    ORDER BY due_date ASC NULLS LAST
  `;
  const result = await db.query(query);

  return result.rows.map(row => {
    const total = parseInt(row.total_patients_eligible || 0, 10);
    const completed = parseInt(row.patients_completed || 0, 10);
    const pending = parseInt(row.patients_pending || 0, 10);
    const inProgress = parseInt(row.patients_in_progress || 0, 10);
    
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let slaRemainingDays = null;
    let slaStatus = 'On Track';
    let colorCode = '#10B981'; // Green

    if (row.due_date) {
      const now = new Date();
      const due = new Date(row.due_date);
      const diffTime = due - now;
      slaRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (slaRemainingDays < 0) {
        slaStatus = 'Overdue';
        colorCode = '#EF4444'; // Red
      } else if (slaRemainingDays <= 5) {
        slaStatus = 'At Risk';
        colorCode = '#F59E0B'; // Yellow
      }
    }

    return {
      measure: row.measure,
      measure_name: row.measure_name || row.measure,
      due_date: row.due_date,
      sla_remaining_days: slaRemainingDays,
      total_patients_eligible: total,
      patients_completed: completed,
      patients_pending: pending,
      patients_in_progress: inProgress,
      completion_percentage: completionPercentage,
      sla_status: slaStatus,
      priority: slaStatus === 'Overdue' ? 'High' : (slaStatus === 'At Risk' ? 'Medium' : 'Low'),
      color_code: colorCode
    };
  });
};

exports.getMyQueue = async (db, schema, userId, queryParams) => {
  const { search, status, sort_by, page = 1, limit = 10 } = queryParams;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClauses = [
    `(p.abstractor_id = $1 OR p.qa_id = $1 OR p.assigned_to = $1)`
  ];
  let values = [userId];
  let valueIndex = 2;

  if (search) {
    whereClauses.push(`
      (
        p.first_name ILIKE $${valueIndex}
        OR p.last_name ILIKE $${valueIndex}
        OR p.patient_id ILIKE $${valueIndex}
        OR p.measure ILIKE $${valueIndex}
      )
    `);
    values.push(`%${search}%`);
    valueIndex++;
  }

  if (status) {
    whereClauses.push(`p.stage = $${valueIndex}`);
    values.push(status);
    valueIndex++;
  }

  const whereString = `WHERE ${whereClauses.join(" AND ")}`;
  
  let orderBy = "p.created_at DESC";
  if (sort_by === "due_date") orderBy = "pc.sla_deadline ASC NULLS LAST";
  else if (sort_by === "priority") orderBy = "p.priority ASC";

  const countQuery = `
    SELECT COUNT(DISTINCT p.id)
    FROM ${schema}.patients p
    LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
    ${whereString}
  `;

  const countResult = await db.query(countQuery, values);
  const total_count = parseInt(countResult.rows[0].count, 10);

  const dataQuery = `
    SELECT DISTINCT
      p.id AS patient_uuid,
      p.patient_id AS mrn,
      CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
      p.measure AS measure_code,
      p.priority,
      p.stage AS current_workflow_stage,
      p.stage AS status,
      pc.sla_deadline AS due_date,
      pc.status AS chart_status,
      pc.abstraction_status AS review_status,
      p.created_at AS assigned_date,
      p.updated_at AS last_updated,
      
      -- Dynamic Progress Percentage Logic
      CASE 
        WHEN p.stage IN ('Completed', 'Done', 'QA Approved', 'QA_APPROVED') THEN 100
        WHEN p.stage IN ('Pending QA', 'Ready for QA Review', 'QA Pending') THEN 75
        WHEN p.stage IN ('In Progress', 'QA Returned', 'Rework') THEN 50
        WHEN p.stage IN ('Assigned', 'Timeline Generated') THEN 25
        ELSE 0
      END AS progress_percentage
      
    FROM ${schema}.patients p
    LEFT JOIN ${schema}.patient_charts pc ON pc.patient_id = p.id
    ${whereString}
    ORDER BY ${orderBy}
    LIMIT $${valueIndex}
    OFFSET $${valueIndex + 1}
  `;

  const dataValues = [...values, Number(limit), offset];
  const dataResult = await db.query(dataQuery, dataValues);
  
  const totalPages = Math.ceil(total_count / Number(limit));

  return {
    data: dataResult.rows,
    totalCount: total_count,
    currentPage: Number(page),
    totalPages: totalPages,
    pageSize: Number(limit)
  };
};
