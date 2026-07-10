exports.getPlanPerformance = async (db, schema) => {
  const query = `
    SELECT 
      p.plan,
      COUNT(*) FILTER (WHERE c.status ILIKE '%Complete%') AS completed,
      COUNT(*) FILTER (WHERE c.status ILIKE '%Open Gap%') AS open_gap,
      COUNT(*) FILTER (WHERE c.status ILIKE '%Pending%QA%') AS pending_qa,
      COUNT(*) as total
    FROM ${schema}.patients p
    JOIN ${schema}.patient_charts c ON p.id = c.patient_id
    WHERE p.plan IS NOT NULL
    GROUP BY p.plan
  `;
  const result = await db.query(query);
  return result.rows;
};

exports.getQaOutcomes = async (db, schema) => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE status ILIKE '%Pass%') AS passed,
      COUNT(*) FILTER (WHERE status ILIKE '%Fail%') AS failed,
      COUNT(*) FILTER (WHERE status ILIKE '%Pending%') AS pending,
      COUNT(*) FILTER (WHERE status ILIKE '%Return%') AS returned,
      COUNT(*) as total
    FROM ${schema}.hedis_qa_queue
  `;
  const result = await db.query(query);
  return result.rows[0];
};