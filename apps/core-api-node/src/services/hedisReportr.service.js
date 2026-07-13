const BENCHMARKS = {
  CBP: 72,
  HBA1C: 78,
  BCS: 76,
  COL: 70,
  CIS: 65,
};

const SUBMISSION_TARGETS = {
  CBP: 80,
  HBA1C: 85,
  BCS: 80,
  COL: 80,
  CIS: 80,
};

/**
 * Get Measure Performance Report Data.
 *
 * Calculates the numerator, denominator, exclusion counts, measure rates, and benchmark comparisons.
 *
 * @param {object} db - Database client pg connection
 * @param {string} schema - Tenant schema name
 * @param {object} params - Optional page, limit, and measureCode query parameters
 * @returns {Promise<object>} Map containing items and pagination details
 */
async function getMeasurePerformanceReport(db, schema, { page = 1, limit = 10, measureCode, measurementYear, plan } = {}) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  let whereClauses = [];
  let queryValues = [];

  if (measureCode) {
    queryValues.push(measureCode);
    whereClauses.push(`he.measure_code ILIKE $${queryValues.length}`);
  }
  if (measurementYear) {
    queryValues.push(measurementYear);
    whereClauses.push(`p.measure ILIKE $${queryValues.length}`);
  }
  if (plan) {
    queryValues.push(plan);
    whereClauses.push(`p.plan ILIKE $${queryValues.length}`);
  }

  const joinStr = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he.patient_id = p.id` : "";
  const whereClauseStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Data Query
  const dataQuery = `
    SELECT 
      he.measure_code,
      COALESCE(MAX(he.measure_name), he.measure_code) AS measure_name,
      COUNT(*) FILTER (WHERE he.numerator = true) AS numerator_count,
      COUNT(*) FILTER (WHERE he.denominator = true) AS denominator_count,
      COUNT(*) FILTER (WHERE he.exclusion = true) AS exclusion_count
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    ${whereClauseStr}
    GROUP BY he.measure_code
    ORDER BY he.measure_code ASC
    LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}
  `;

  // Count Query
  const countQuery = `
    SELECT COUNT(DISTINCT he.measure_code) AS total
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    ${whereClauseStr}
  `;

  const dataValues = [...queryValues, limitNum, offset];
  const countValues = [...queryValues];

  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, dataValues),
    db.query(countQuery, countValues),
  ]);

  const rows = dataResult.rows || [];
  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  const items = rows.map((row) => {
    const code = row.measure_code;
    const name = row.measure_name;
    const numerator = parseInt(row.numerator_count, 10) || 0;
    const denominator = parseInt(row.denominator_count, 10) || 0;
    const exclusion = parseInt(row.exclusion_count, 10) || 0;

    // Rate Calculation
    let measureRate = 0;
    if (denominator > 0) {
      measureRate = parseFloat(((numerator / denominator) * 100).toFixed(1));
    }

    // Benchmark Resolution
    const benchmark = BENCHMARKS[code.toUpperCase()] || 80;
    const belowBenchmark = measureRate < benchmark;

    return {
      measureCode: code,
      measureName: name,
      numerator,
      denominator,
      exclusion,
      measureRate,
      benchmark,
      belowBenchmark,
    };
  });

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}


/**
 * Get Submission Readiness Report.
 *
 * Calculates submission readiness for each measure based on
 * QA Passed measures compared to total evaluated measures.
 *
 * Readiness % = (QA Passed / Total Evaluated) * 100
 *
 * Supports pagination and optional measure filtering.
 */
async function getSubmissionReadinessReport(
  db,
  schema,
  { page = 1, limit = 10, measureCode, measurementYear, plan } = {}
) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  let whereClauses = [];
  let values = [];

  if (measureCode) {
    values.push(measureCode);
    whereClauses.push(`he.measure_code ILIKE $${values.length}`);
  }
  if (measurementYear) {
    values.push(measurementYear);
    whereClauses.push(`p.measure ILIKE $${values.length}`);
  }
  if (plan) {
    values.push(plan);
    whereClauses.push(`p.plan ILIKE $${values.length}`);
  }

  const joinStr = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he.patient_id = p.id` : "";
  const whereClauseStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const dataQuery = `
    SELECT
      he.measure_code,
      MAX(he.measure_name) AS measure_name,
      COUNT(he.id) AS total_evaluations,
      COUNT(q.id) FILTER (WHERE q.qa_status = 'QA_PASS') AS ready_count
    FROM ${schema}.hedis_evaluations he
    LEFT JOIN ${schema}.hedis_qa_measure_decisions q
      ON q.measure_id = he.id
    ${joinStr}
    ${whereClauseStr}
    GROUP BY he.measure_code
    ORDER BY he.measure_code
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT he.measure_code) AS total
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    ${whereClauseStr}
  `;

  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, [...values, limitNum, offset]),
    db.query(countQuery, values),
  ]);

  const items = dataResult.rows.map((row) => {
    const totalEvaluations = Number(row.total_evaluations) || 0;
    const readyCount = Number(row.ready_count) || 0;

    const readiness =
      totalEvaluations > 0
        ? Number(((readyCount / totalEvaluations) * 100).toFixed(1))
        : 0;

    const target =
      SUBMISSION_TARGETS[row.measure_code.toUpperCase()] || 80;

    const difference = Number((readiness - target).toFixed(1));

    return {
      measureCode: row.measure_code,
      measureName: row.measure_name,
      totalEvaluations,
      readyCount,
      readiness,
      target,
      difference,
      aboveTarget: readiness >= target,
    };
  });

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: Number(countResult.rows[0].total),
      totalPages: Math.ceil(
        Number(countResult.rows[0].total) / limitNum
      ),
    },
  };
}


/**
 * Export Submission Readiness Report.
 *
 * Returns all filtered submission readiness records for CSV export.
 *
 * @param {object} db
 * @param {string} schema
 * @param {object} params
 * @returns {Promise<Array>}
 */
async function exportSubmissionReadinessReport(
  db,
  schema,
  { measureCode, measurementYear, plan } = {}
) {
  let whereClauses = [];
  const values = [];

  if (measureCode) {
    values.push(measureCode);
    whereClauses.push(`he.measure_code ILIKE $${values.length}`);
  }
  if (measurementYear) {
    values.push(measurementYear);
    whereClauses.push(`p.measure ILIKE $${values.length}`);
  }
  if (plan) {
    values.push(plan);
    whereClauses.push(`p.plan ILIKE $${values.length}`);
  }

  const joinStr = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he.patient_id = p.id` : "";
  const whereClauseStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const query = `
    SELECT
      he.measure_code,
      MAX(he.measure_name) AS measure_name,
      COUNT(he.id) AS total_evaluations,
      COUNT(q.id) FILTER (WHERE q.qa_status = 'QA_PASS') AS ready_count
    FROM ${schema}.hedis_evaluations he
    LEFT JOIN ${schema}.hedis_qa_measure_decisions q
      ON q.measure_id = he.id
    ${joinStr}
    ${whereClauseStr}
    GROUP BY he.measure_code
    ORDER BY he.measure_code
  `;

  const { rows } = await db.query(query, values);

  return rows.map((row) => {
    const totalEvaluations = Number(row.total_evaluations) || 0;
    const readyCount = Number(row.ready_count) || 0;

    const readiness =
      totalEvaluations > 0
        ? Number(((readyCount / totalEvaluations) * 100).toFixed(1))
        : 0;

    const target =
      SUBMISSION_TARGETS[row.measure_code.toUpperCase()] || 80;

    const difference = Number((readiness - target).toFixed(1));

    return {
      measureCode: row.measure_code,
      measureName: row.measure_name,
      totalEvaluations,
      readyCount,
      readiness,
      target,
      difference,
      aboveTarget: readiness >= target,
    };
  });
}

/**
 * Get Gap Closure Trend Report.
 *
 * Calculates the Trend (Open vs Closed gaps) monthly or weekly,
 * along with the summary cards (current month open gaps, closed gaps, and gap rate delta).
 *
 * Gaps classification:
 * - Closed: he.status ILIKE 'complete' OR he.status ILIKE 'compliant'
 * - Open: he.status IS NULL OR (he.status NOT ILIKE 'complete' AND he.status NOT ILIKE 'compliant')
 */
async function getGapClosureTrend(db, schema, { view = "monthly", measureCode, measurementYear, plan } = {}) {
  const isWeekly = String(view).toLowerCase() === "weekly";

  let queryValues = [];
  let filterClauses = [];

  if (measureCode) {
    queryValues.push(measureCode);
    filterClauses.push(`he_sub.measure_code ILIKE $${queryValues.length}`);
  }
  if (measurementYear) {
    queryValues.push(measurementYear);
    filterClauses.push(`p.measure ILIKE $${queryValues.length}`);
  }
  if (plan) {
    queryValues.push(plan);
    filterClauses.push(`p.plan ILIKE $${queryValues.length}`);
  }

  const subqueryWhere = filterClauses.length > 0 ? `WHERE ${filterClauses.join(" AND ")}` : "";
  const subqueryJoin = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he_sub.patient_id = p.id` : "";

  const filteredEvaluationsSubquery = `
    (
      SELECT he_sub.* 
      FROM ${schema}.hedis_evaluations he_sub
      ${subqueryJoin}
      ${subqueryWhere}
    )
  `;

  let trendQuery = "";

  if (isWeekly) {
    trendQuery = `
      WITH week_range AS (
        SELECT (DATE_TRUNC('week', CURRENT_DATE) - (w.week_val * INTERVAL '1 week'))::date AS week_start
        FROM generate_series(0, 3) AS w(week_val)
      )
      SELECT 
        TO_CHAR(wr.week_start, 'Mon DD') AS label,
        wr.week_start,
        COALESCE(COUNT(he.id) FILTER (WHERE he.status NOT ILIKE 'complete' AND he.status NOT ILIKE 'compliant'), 0) AS open_gaps,
        COALESCE(COUNT(he.id) FILTER (WHERE he.status ILIKE 'complete' OR he.status ILIKE 'compliant'), 0) AS closed_gaps
      FROM week_range wr
      LEFT JOIN ${filteredEvaluationsSubquery} he 
        ON DATE_TRUNC('week', he.created_at)::date = wr.week_start
      GROUP BY wr.week_start
      ORDER BY wr.week_start ASC
    `;
  } else {
    trendQuery = `
      WITH month_range AS (
        SELECT (DATE_TRUNC('month', CURRENT_DATE) - (m.month_val * INTERVAL '1 month'))::date AS month_start
        FROM generate_series(0, 6) AS m(month_val)
      )
      SELECT 
        TO_CHAR(mr.month_start, 'Mon') AS label,
        mr.month_start,
        COALESCE(COUNT(he.id) FILTER (WHERE he.status NOT ILIKE 'complete' AND he.status NOT ILIKE 'compliant'), 0) AS open_gaps,
        COALESCE(COUNT(he.id) FILTER (WHERE he.status ILIKE 'complete' OR he.status ILIKE 'compliant'), 0) AS closed_gaps
      FROM month_range mr
      LEFT JOIN ${filteredEvaluationsSubquery} he 
        ON DATE_TRUNC('month', he.created_at)::date = mr.month_start
      GROUP BY mr.month_start
      ORDER BY mr.month_start ASC
    `;
  }

  // Summary Query (Fetches open / closed counts from current and previous months)
  let summaryWhereClauses = [`he.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'`];
  if (measureCode) {
    summaryWhereClauses.push(`he.measure_code ILIKE $${queryValues.indexOf(measureCode) + 1}`);
  }
  if (measurementYear) {
    summaryWhereClauses.push(`p.measure ILIKE $${queryValues.indexOf(measurementYear) + 1}`);
  }
  if (plan) {
    summaryWhereClauses.push(`p.plan ILIKE $${queryValues.indexOf(plan) + 1}`);
  }

  const joinStr = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he.patient_id = p.id` : "";
  const summaryWhereClauseStr = `WHERE ${summaryWhereClauses.join(" AND ")}`;

  const summaryQuery = `
    SELECT 
      TO_CHAR(DATE_TRUNC('month', he.created_at)::date, 'YYYY-MM-DD') AS month_start_str,
      COALESCE(COUNT(he.id) FILTER (WHERE he.status NOT ILIKE 'complete' AND he.status NOT ILIKE 'compliant'), 0) AS open_gaps,
      COALESCE(COUNT(he.id) FILTER (WHERE he.status ILIKE 'complete' OR he.status ILIKE 'compliant'), 0) AS closed_gaps
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    ${summaryWhereClauseStr}
    GROUP BY DATE_TRUNC('month', he.created_at)::date
  `;

  const [trendResult, summaryResult] = await Promise.all([
    db.query(trendQuery, queryValues),
    db.query(summaryQuery, queryValues),
  ]);

  const trendRows = trendResult.rows || [];
  const summaryRows = summaryResult.rows || [];

  const trend = trendRows.map((row) => ({
    label: row.label,
    openGaps: parseInt(row.open_gaps, 10),
    closedGaps: parseInt(row.closed_gaps, 10),
  }));

  // Identify current and previous month dates
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Helper to format ISO date string to YYYY-MM-DD
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentMonthKey = formatDateKey(currentMonthStart);
  const prevMonthKey = formatDateKey(prevMonthStart);

  // Match rows by month_start
  const currentMonthRow = summaryRows.find((r) => r.month_start_str === currentMonthKey);
  const prevMonthRow = summaryRows.find((r) => r.month_start_str === prevMonthKey);

  const currentOpen = parseInt(currentMonthRow?.open_gaps || 0, 10);
  const currentClosed = parseInt(currentMonthRow?.closed_gaps || 0, 10);
  const currentTotal = currentOpen + currentClosed;

  const prevOpen = parseInt(prevMonthRow?.open_gaps || 0, 10);
  const prevClosed = parseInt(prevMonthRow?.closed_gaps || 0, 10);
  const prevTotal = prevOpen + prevClosed;

  // Rate Calculations (Gap Rate = Open Gaps / Total Gaps * 100)
  const currentRate = currentTotal > 0 ? (currentOpen / currentTotal) * 100 : 0;
  const prevRate = prevTotal > 0 ? (prevOpen / prevTotal) * 100 : 0;
  const gapRateDelta = parseFloat((currentRate - prevRate).toFixed(1));

  return {
    summary: {
      openGaps: currentOpen,
      closedGaps: currentClosed,
      gapRateDelta,
    },
    trend,
  };
}

/**
 * Get Dashboard Statistics Report.
 *
 * Calculates overall KPIs:
 * 1. Overall Gap Rate & Delta (vs last month)
 *    Gap Rate = (Open Gaps / Total Eligible) * 100
 * 2. Numerator Compliance & Delta (vs last month)
 *    Compliance = (numerator / denominator) * 100
 * 3. Charts Completed (completed count, total count, percentage)
 * 4. QA Disagreement Rate & Delta (vs last week)
 *    Disagreement = (QA_FAIL / Total QA Decisions) * 100
 * 5. Submission Readiness & Delta (vs this quarter)
 *    Readiness = (QA_PASS / Total Evaluations) * 100
 */
async function getDashboardStatistics(db, schema, { measurementYear, plan } = {}) {
  let queryValues = [];
  let filterClauses = [];
  if (measurementYear) {
    queryValues.push(measurementYear);
    filterClauses.push(`p.measure ILIKE $${queryValues.length}`);
  }
  if (plan) {
    queryValues.push(plan);
    filterClauses.push(`p.plan ILIKE $${queryValues.length}`);
  }

  const joinStr = (measurementYear || plan) ? `JOIN ${schema}.patients p ON he.patient_id = p.id` : "";
  const joinStrForCharts = (measurementYear || plan) ? `JOIN ${schema}.patients p ON pc.patient_id = p.id` : "";
  const joinStrForQA = (measurementYear || plan) ? `JOIN ${schema}.patients p ON qmd.patient_id = p.id` : "";
  const filterClauseStr = filterClauses.length > 0 ? `WHERE ${filterClauses.join(" AND ")}` : "";

  // 1. Overall Gap Rate (this month and last month)
  const gapRateSql = `
    SELECT 
      TO_CHAR(DATE_TRUNC('month', he.created_at)::date, 'YYYY-MM-DD') AS month_start_str,
      COALESCE(COUNT(he.id) FILTER (WHERE he.status NOT ILIKE 'complete' AND he.status NOT ILIKE 'compliant' AND he.status NOT ILIKE 'Not Eligible'), 0) AS open_gaps,
      COALESCE(COUNT(he.id) FILTER (WHERE he.status NOT ILIKE 'Not Eligible'), 0) AS total_eligible
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    WHERE he.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      ${filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : ""}
    GROUP BY DATE_TRUNC('month', he.created_at)::date
  `;

  // 2. Numerator Compliance (this month and last month)
  const complianceSql = `
    SELECT 
      TO_CHAR(DATE_TRUNC('month', he.created_at)::date, 'YYYY-MM-DD') AS month_start_str,
      COALESCE(COUNT(he.id) FILTER (WHERE he.numerator = true), 0) AS numerator_count,
      COALESCE(COUNT(he.id) FILTER (WHERE he.denominator = true), 0) AS denominator_count
    FROM ${schema}.hedis_evaluations he
    ${joinStr}
    WHERE he.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      ${filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : ""}
    GROUP BY DATE_TRUNC('month', he.created_at)::date
  `;

  // 3. Charts Completed
  const chartsSql = `
    SELECT 
      COALESCE(COUNT(pc.id) FILTER (WHERE pc.status = 'Completed'), 0) AS completed_count,
      COALESCE(COUNT(pc.id), 0) AS total_count
    FROM ${schema}.patient_charts pc
    ${joinStrForCharts}
    ${filterClauseStr}
  `;

  // 4. QA Disagreement Rate (this week and last week)
  const qaSql = `
    SELECT 
      TO_CHAR(DATE_TRUNC('week', qmd.created_at)::date, 'YYYY-MM-DD') AS week_start_str,
      COALESCE(COUNT(qmd.id) FILTER (WHERE qmd.qa_status = 'QA_FAIL'), 0) AS fail_count,
      COALESCE(COUNT(qmd.id) FILTER (WHERE qmd.qa_status IN ('QA_PASS', 'QA_FAIL')), 0) AS total_count
    FROM ${schema}.hedis_qa_measure_decisions qmd
    ${joinStrForQA}
    WHERE qmd.created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
      ${filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : ""}
    GROUP BY DATE_TRUNC('week', qmd.created_at)::date
  `;

  // 5. Submission Readiness (this quarter and last quarter)
  const submissionSql = `
    SELECT 
      TO_CHAR(DATE_TRUNC('quarter', he.created_at)::date, 'YYYY-MM-DD') AS quarter_start_str,
      COALESCE(COUNT(he.id), 0) AS total_evaluations,
      COALESCE(COUNT(qmd.id) FILTER (WHERE qmd.qa_status = 'QA_PASS'), 0) AS ready_count
    FROM ${schema}.hedis_evaluations he
    LEFT JOIN ${schema}.hedis_qa_measure_decisions qmd ON he.id = qmd.measure_id
    ${joinStr}
    WHERE he.created_at >= DATE_TRUNC('quarter', CURRENT_DATE) - INTERVAL '3 months'
      ${filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : ""}
    GROUP BY DATE_TRUNC('quarter', he.created_at)::date
  `;

  const [gapRes, complianceRes, chartsRes, qaRes, submissionRes] = await Promise.all([
    db.query(gapRateSql, queryValues),
    db.query(complianceSql, queryValues),
    db.query(chartsSql, queryValues),
    db.query(qaSql, queryValues),
    db.query(submissionSql, queryValues)
  ]);

  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const curMonthKey = formatDateKey(currentMonthStart);
  const prevMonthKey = formatDateKey(prevMonthStart);

  // Overall Gap Rate
  const curMonthGapRow = gapRes.rows.find(r => r.month_start_str === curMonthKey);
  const prevMonthGapRow = gapRes.rows.find(r => r.month_start_str === prevMonthKey);

  const curOpen = parseInt(curMonthGapRow?.open_gaps || 0, 10);
  const curEligible = parseInt(curMonthGapRow?.total_eligible || 0, 10);
  const curGapRate = curEligible > 0 ? (curOpen / curEligible) * 100 : 0;

  const prevOpen = parseInt(prevMonthGapRow?.open_gaps || 0, 10);
  const prevEligible = parseInt(prevMonthGapRow?.total_eligible || 0, 10);
  const prevGapRate = prevEligible > 0 ? (prevOpen / prevEligible) * 100 : 0;

  const gapRateDelta = parseFloat((curGapRate - prevGapRate).toFixed(1));

  // Numerator Compliance
  const curMonthCompRow = complianceRes.rows.find(r => r.month_start_str === curMonthKey);
  const prevMonthCompRow = complianceRes.rows.find(r => r.month_start_str === prevMonthKey);

  const curNum = parseInt(curMonthCompRow?.numerator_count || 0, 10);
  const curDen = parseInt(curMonthCompRow?.denominator_count || 0, 10);
  const curCompRate = curDen > 0 ? (curNum / curDen) * 100 : 0;

  const prevNum = parseInt(prevMonthCompRow?.numerator_count || 0, 10);
  const prevDen = parseInt(prevMonthCompRow?.denominator_count || 0, 10);
  const prevCompRate = prevDen > 0 ? (prevNum / prevDen) * 100 : 0;

  const complianceDelta = parseFloat((curCompRate - prevCompRate).toFixed(1));

  // Charts Completed
  const chartsCompleted = parseInt(chartsRes.rows[0]?.completed_count || 0, 10);
  const chartsTotal = parseInt(chartsRes.rows[0]?.total_count || 0, 10);
  const chartsPercentage = chartsTotal > 0 ? parseFloat(((chartsCompleted / chartsTotal) * 100).toFixed(1)) : 0;

  // QA Disagreement Rate
  const getMonday = (d) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const result = new Date(d);
    result.setDate(diff);
    return result;
  };
  const currentWeekStart = getMonday(new Date(today));
  currentWeekStart.setHours(0, 0, 0, 0);
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const curWeekKey = formatDateKey(currentWeekStart);
  const prevWeekKey = formatDateKey(prevWeekStart);

  const curWeekQARow = qaRes.rows.find(r => r.week_start_str === curWeekKey);
  const prevWeekQARow = qaRes.rows.find(r => r.week_start_str === prevWeekKey);

  const curQAFail = parseInt(curWeekQARow?.fail_count || 0, 10);
  const curQATotal = parseInt(curWeekQARow?.total_count || 0, 10);
  const curQARate = curQATotal > 0 ? (curQAFail / curQATotal) * 100 : 0;

  const prevQAFail = parseInt(prevWeekQARow?.fail_count || 0, 10);
  const prevQATotal = parseInt(prevWeekQARow?.total_count || 0, 10);
  const prevQARate = prevQATotal > 0 ? (prevQAFail / prevQATotal) * 100 : 0;

  const qaDisagreementDelta = parseFloat((curQARate - prevQARate).toFixed(1));

  // Submission Readiness (vs this quarter / previous quarter. Delas are this quarter vs prev quarter)
  const getQuarterStart = (d) => {
    const q = Math.floor(d.getMonth() / 3);
    return new Date(d.getFullYear(), q * 3, 1);
  };
  const currentQuarterStart = getQuarterStart(new Date(today));
  const prevQuarterStart = new Date(currentQuarterStart);
  prevQuarterStart.setMonth(prevQuarterStart.getMonth() - 3);

  const curQuarterKey = formatDateKey(currentQuarterStart);
  const prevQuarterKey = formatDateKey(prevQuarterStart);

  const curQuarterSubRow = submissionRes.rows.find(r => r.quarter_start_str === curQuarterKey);
  const prevQuarterSubRow = submissionRes.rows.find(r => r.quarter_start_str === prevQuarterKey);

  const curSubReady = parseInt(curQuarterSubRow?.ready_count || 0, 10);
  const curSubTotal = parseInt(curQuarterSubRow?.total_evaluations || 0, 10);
  const curSubRate = curSubTotal > 0 ? (curSubReady / curSubTotal) * 100 : 0;

  const prevSubReady = parseInt(prevQuarterSubRow?.ready_count || 0, 10);
  const prevSubTotal = parseInt(prevQuarterSubRow?.total_evaluations || 0, 10);
  const prevSubRate = prevSubTotal > 0 ? (prevSubReady / prevSubTotal) * 100 : 0;

  const submissionReadinessDelta = parseFloat((curSubRate - prevSubRate).toFixed(1));

  return {
    overallGapRate: {
      rate: parseFloat(curGapRate.toFixed(1)),
      delta: gapRateDelta
    },
    numeratorCompliance: {
      rate: parseFloat(curCompRate.toFixed(1)),
      delta: complianceDelta
    },
    chartsCompleted: {
      completed: chartsCompleted,
      total: chartsTotal,
      percentage: chartsPercentage
    },
    qaDisagreementRate: {
      rate: parseFloat(curQARate.toFixed(1)),
      delta: qaDisagreementDelta
    },
    submissionReadiness: {
      rate: parseFloat(curSubRate.toFixed(1)),
      delta: submissionReadinessDelta
    }
  };
}

/**
 * Get Abstractor Productivity Report.
 *
 * Returns productivity metrics per Chart Abstractor:
 * - Assigned charts count
 * - Completed charts count & percentage
 * - Average completion time (from hedis_measure_evidence)
 * - QA Fail percentage & at-risk flag
 *
 * Data sources:
 * - users + user_roles (to identify Chart Abstractors)
 * - patients (assigned via abstractor_id, stage for completion/QA status)
 * - hedis_measure_evidence (evidence submission timing, via created_by)
 *
 * @param {object} db - Database client
 * @param {string} schema - Tenant schema name
 * @param {object} params - Optional measurementYear, plan filters
 * @returns {Promise<object>} chartData and tableData arrays, plus summary
 */
async function getAbstractorProductivity(db, schema, { measurementYear, plan } = {}) {
  let queryValues = [];
  let filterClauses = [];

  if (measurementYear) {
    queryValues.push(measurementYear);
    filterClauses.push(`p.measure ILIKE $${queryValues.length}`);
  }
  if (plan) {
    queryValues.push(plan);
    filterClauses.push(`p.plan ILIKE $${queryValues.length}`);
  }

  const patientFilterStr = filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : "";

  const query = `
    SELECT
      u.id AS abstractor_id,
      u.full_name AS abstractor_name,
      COUNT(DISTINCT p.id) AS assigned,
      COUNT(DISTINCT CASE WHEN p.stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready', 'QA_APPROVED') THEN p.id END) AS completed,
      COUNT(DISTINCT CASE WHEN p.stage IN ('QA Failed', 'Revision Required', 'QA Returned', 'QA Return', 'QA_REJECTED') THEN p.id END) AS qa_failed,
      AVG(
        EXTRACT(EPOCH FROM (hme.created_at - p.created_at)) / 60
      ) AS avg_time_minutes
    FROM ${schema}.users u
    JOIN ${schema}.user_roles ur ON u.user_role_id = ur.id
    LEFT JOIN ${schema}.patients p ON p.abstractor_id = u.id ${patientFilterStr}
    LEFT JOIN ${schema}.hedis_measure_evidence hme
      ON hme.patient_id = p.id
      AND hme.created_by = u.id
      AND hme.is_draft = false
    WHERE ur.name = 'Chart Abstractor'
    GROUP BY u.id, u.full_name
    ORDER BY completed DESC
  `;

  const result = await db.query(query, queryValues);

  let totalAssigned = 0;
  let totalCompleted = 0;
  let atRiskCount = 0;

  const tableData = result.rows.map((row) => {
    const assigned = parseInt(row.assigned || 0, 10);
    const completed = parseInt(row.completed || 0, 10);
    const qaFailed = parseInt(row.qa_failed || 0, 10);

    totalAssigned += assigned;
    totalCompleted += completed;

    const completedPercentage =
      assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
    const qaFailPercentage =
      completed > 0
        ? parseFloat(((qaFailed / completed) * 100).toFixed(1))
        : 0;
    const avgTime = row.avg_time_minutes
      ? `${parseFloat(row.avg_time_minutes).toFixed(1)} min`
      : "0.0 min";
    const atRisk = qaFailPercentage > 6.0;

    if (atRisk) atRiskCount++;

    return {
      abstractorId: row.abstractor_id,
      abstractorName: row.abstractor_name,
      assigned,
      completed,
      completedPercentage,
      avgTime,
      qaFailPercentage,
      atRisk,
    };
  });

  // Chart data: one entry per abstractor showing completed count
  const chartData = tableData.map((item) => {
    // Use last name or full name for chart label
    const nameParts = item.abstractorName ? item.abstractorName.split(" ") : ["Unknown"];
    const label = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    return {
      label,
      completed: item.completed,
    };
  });

  return {
    summary: {
      totalAbstractors: tableData.length,
      totalAssigned,
      totalCompleted,
      atRiskCount,
    },
    chartData,
    tableData,
  };
}

module.exports = {
  getMeasurePerformanceReport,
  getSubmissionReadinessReport,
  exportSubmissionReadinessReport,
  getGapClosureTrend,
  getDashboardStatistics,
  getAbstractorProductivity,
};
