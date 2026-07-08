const pool = require("../config/db");

class RecentActivityService {
  /**
   * Fetch recent activities for Program Manager / Admin (Project-wide)
   * @param {object} db - Database client
   * @param {string} schema - Tenant schema
   * @param {object} options - Pagination
   */
  async getRecentActivities(db, schema, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    const query = `
      WITH activities AS (
        -- 1. Patient Chart Uploaded
        SELECT 
          pc.id::text || '-uploaded' AS id,
          'Patient Chart Uploaded' AS activity_type,
          'Chart uploaded for patient ' || COALESCE(p.first_name || ' ' || p.last_name, 'Unknown') AS description,
          p.measure AS measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          'System' AS performed_by,
          pc.created_at
        FROM ${schema}.patient_charts pc
        INNER JOIN ${schema}.patients p ON pc.patient_id = p.id

        UNION ALL

        -- 2. Patient / Measure Assigned
        SELECT 
          ca.id::text || '-assigned' AS id,
          'Assignment Created' AS activity_type,
          COALESCE(p.measure, '') || ' assigned to ' || COALESCE(u2.full_name, 'User') || 
            ' for patient ' || COALESCE(p.first_name || ' ' || p.last_name, '') AS description,
          p.measure AS measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          COALESCE(u.full_name, 'System') AS performed_by,
          ca.created_at
        FROM ${schema}.chart_assignments ca
        INNER JOIN ${schema}.patient_charts pc ON ca.patient_chart_id = pc.id
        INNER JOIN ${schema}.patients p ON pc.patient_id = p.id
        LEFT JOIN ${schema}.users u ON ca.assigned_by = u.id
        LEFT JOIN ${schema}.users u2 ON ca.assigned_to = u2.id

        UNION ALL

        -- 3. AI Evaluation Completed
        SELECT 
          he.id::text || '-ai-completed' AS id,
          'AI Evaluation Completed' AS activity_type,
          'AI completed evaluation for ' || he.measure_code || 
            ' - ' || COALESCE(p.first_name || ' ' || p.last_name, '') AS description,
          he.measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          'AI Engine' AS performed_by,
          he.created_at
        FROM ${schema}.hedis_evaluations he
        INNER JOIN ${schema}.patients p ON he.patient_id = p.id

        UNION ALL

        -- 4. Evidence / Draft / Not Found
        SELECT 
          hme.id::text || 
            CASE 
              WHEN hme.is_draft = true THEN '-draft'
              WHEN hme.not_found = true THEN '-notfound'
              ELSE '-evidence'
            END AS id,
          CASE 
            WHEN hme.is_draft = true THEN 'Draft Saved'
            WHEN hme.not_found = true THEN 'Mark Not Found'
            ELSE 'Evidence Submitted'
          END AS activity_type,
          CASE 
            WHEN hme.is_draft = true THEN 'Draft saved'
            WHEN hme.not_found = true THEN 'Marked not found'
            ELSE 'Evidence submitted'
          END || ' for ' || COALESCE(he.measure_code, p.measure, 'measure') || 
            ' - ' || COALESCE(p.first_name || ' ' || p.last_name, '') AS description,
          COALESCE(he.measure_code, p.measure) AS measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          COALESCE(u.full_name, 'Abstractor') AS performed_by,
          COALESCE(hme.not_found_at, hme.updated_at) AS created_at
        FROM ${schema}.hedis_measure_evidence hme
        INNER JOIN ${schema}.patients p ON hme.patient_id = p.id
        LEFT JOIN ${schema}.hedis_evaluations he ON hme.measure_id = he.id
        LEFT JOIN ${schema}.users u ON hme.updated_by = u.id

        UNION ALL

        -- 5. QA Review Actions
        SELECT 
          hqmd.id::text || '-qa-' || LOWER(hqmd.qa_status) AS id,
          CASE 
            WHEN hqmd.qa_status = 'QA_PASS' THEN 'QA Approved' 
            ELSE 'QA Returned' 
          END AS activity_type,
          'QA ' || 
            CASE WHEN hqmd.qa_status = 'QA_PASS' THEN 'approved' ELSE 'returned' END ||
            ' measure ' || hqmd.measure_code || ' for patient ' || 
            COALESCE(p.first_name || ' ' || p.last_name, '') AS description,
          hqmd.measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          'QA Reviewer' AS performed_by,
          hqmd.created_at
        FROM ${schema}.hedis_qa_measure_decisions hqmd
        INNER JOIN ${schema}.patients p ON hqmd.patient_id = p.id

        UNION ALL

        -- 6. Recalculation
        SELECT 
          he.id::text || '-recalculation' AS id,
          'Recalculation Triggered' AS activity_type,
          'Recalculation triggered for ' || he.measure_code || 
            ' - ' || COALESCE(p.first_name || ' ' || p.last_name, '') AS description,
          he.measure_code,
          p.id AS patient_id,
          COALESCE(p.first_name || ' ' || p.last_name, 'Unknown Patient') AS patient_name,
          'System' AS performed_by,
          he.created_at
        FROM ${schema}.hedis_evaluations he
        INNER JOIN ${schema}.patients p ON he.patient_id = p.id
        WHERE he.reasoning LIKE '%recalculation%' OR he.reason LIKE '%recalculation%'
      )
      SELECT *, COUNT(*) OVER() as total_count 
      FROM activities
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const values = [limit, offset];
    const result = await db.query(query, values);

    const rows = result.rows || [];

    const data = rows.map((row) => ({
      id: row.id,
      activityType: row.activity_type,
      description: row.description,
      measureCode: row.measure_code || null,
      patientId: row.patient_id,
      patientName: row.patient_name,
      performedBy: row.performed_by,
      createdAt: row.created_at,
    }));

    const total = rows.length > 0 ? parseInt(rows[0].total_count || 0) : 0;
    const pages = Math.ceil(total / limit);

    return {
      data,
      metadata: { total, pages, current_page: page, limit },
    };
  }
}

module.exports = new RecentActivityService();
