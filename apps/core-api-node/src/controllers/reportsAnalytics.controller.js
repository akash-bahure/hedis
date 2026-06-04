/**
 * GET ABSTRACTOR PRODUCTIVITY
 * Retrieves metrics for each abstractor: Assigned, Completed, Avg Time, and QA Fail %.
 */
exports.getAbstractorProductivity = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;

    const { project_id, measure_year } = req.query;
    let projectFilter = "";

    if (project_id) {
      projectFilter = `AND p.project_id = $2`;
    }

    const query = `
      SELECT
        u.id AS abstractor_id,
        u.full_name AS abstractor_name,
        COUNT(p.id) AS assigned,
        COUNT(CASE WHEN p.stage = 'Completed' THEN 1 END) AS completed,
        COUNT(CASE WHEN p.stage IN ('QA Returned', 'QA Return') THEN 1 END) AS qa_failed,
        AVG(EXTRACT(EPOCH FROM (mca.submitted_to_qa_at - mca.created_at))/60) AS avg_time_minutes
      FROM ${schema}.patients p
      JOIN ${schema}.users u ON p.abstractor_id = u.id
      LEFT JOIN ${schema}.manual_chart_abstractions mca ON mca.patient_id = p.id AND mca.created_by = u.id
      WHERE p.abstractor_id IS NOT NULL
        AND ($1::text IS NULL OR p.measure ILIKE '%' || $1 || '%')
        ${projectFilter}
      GROUP BY u.id, u.full_name
      ORDER BY completed DESC;
    `;

    const queryValues = [measure_year || null];
    if (project_id) queryValues.push(project_id);

    const result = await req.db.query(query, queryValues);

    // Format final response with percentages
    const data = result.rows.map((row) => {
      const assigned = parseInt(row.assigned || 0);
      const completed = parseInt(row.completed || 0);
      const qaFailed = parseInt(row.qa_failed || 0);

      const completedPercentage =
        assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
      const qaFailPercentage =
        completed > 0
          ? parseFloat(((qaFailed / completed) * 100).toFixed(1))
          : 0;
      const avgTime = row.avg_time_minutes
        ? `${parseFloat(row.avg_time_minutes).toFixed(1)} min`
        : "0 min";

      return {
        abstractor_id: row.abstractor_id,
        abstractor_name: row.abstractor_name,
        assigned,
        completed,
        completed_percentage: completedPercentage,
        avg_time: avgTime,
        qa_fail_percentage: qaFailPercentage,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Abstractor productivity fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Abstractor Productivity Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
