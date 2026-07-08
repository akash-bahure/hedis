const path = require("path");
const fs = require("fs");

class DashboardAnalyticsService {
  constructor() {
    this.measureLibrary = null;
    this.loadMeasureLibrary();
  }

  loadMeasureLibrary() {
    try {
      const filePath = path.join(__dirname, "../data/measureLibrary.json");
      const fileContent = fs.readFileSync(filePath, "utf8");
      this.measureLibrary = JSON.parse(fileContent);
    } catch (err) {
      console.error(
        "Failed to load measureLibrary.json in DashboardAnalyticsService:",
        err
      );
      this.measureLibrary = { measures: [] };
    }
  }

  /**
   * Map measure code to HEDIS domain
   * @param {string} measureCode
   * @returns {string} Domain name
   */
  getDomainForMeasure(measureCode) {
    if (!this.measureLibrary || !this.measureLibrary.measures) {
      return "Other";
    }

    const measure = this.measureLibrary.measures.find(
      (m) =>
        String(m.measureCode).toLowerCase() ===
        String(measureCode).toLowerCase()
    );

    if (!measure || !measure.category) {
      return "Other";
    }

    const category = measure.category;

    // Domain mapping definition
    const domainMapping = {
      Preventive: [
        "Cancer Screening",
        "Immunizations",
        "Women's Health",
        "Geriatric Care",
        "Older Adult Care",
        "Preventive Care",
      ],
      Diabetes: ["Diabetes Care"],
      Cardiovascular: ["Cardiovascular"],
      "Mental Health": ["Behavioral Health", "Mental Health"],
      Respiratory: ["Respiratory"],
      "Child Health": ["Pediatric Care", "Child Health", "Dental"],
    };

    for (const [domain, categories] of Object.entries(domainMapping)) {
      if (
        categories.some((cat) => cat.toLowerCase() === category.toLowerCase())
      ) {
        return domain;
      }
    }

    return "Other";
  }

  /**
   * Get measure name from library for a given code.
   * @param {string} measureCode
   * @returns {string|null}
   */
  getMeasureNameFromLibrary(measureCode) {
    if (!this.measureLibrary || !this.measureLibrary.measures) return null;
    const m = this.measureLibrary.measures.find(
      (m) =>
        String(m.measureCode).toLowerCase() ===
        String(measureCode).toLowerCase()
    );
    return m ? m.measureName : null;
  }

  /**
   * Get default target rate for a measure from environment overrides.
   * Returns null if no target is configured (no hardcoded defaults).
   * @param {string} measureCode
   * @returns {number|null}
   */
  getTargetRateForMeasure(measureCode) {
    if (!measureCode) return 80;

    // 1. Per-measure override (highest priority)
    const envKey = `DASHBOARD_TARGET_RATE_${String(measureCode).toUpperCase()}`;
    if (process.env[envKey]) {
      const parsed = parseFloat(process.env[envKey]);
      if (!isNaN(parsed)) return parsed;
    }

    // 2. Global default
    if (process.env.DASHBOARD_TARGET_RATE) {
      const parsed = parseFloat(process.env.DASHBOARD_TARGET_RATE);
      if (!isNaN(parsed)) return parsed;
    }

    // 3. Ultimate fallback
    return 80;
  }
  // ─────────────────────────────────────────────────────────────────────────────
  // EXISTING APIS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * GET /dashboard/abstraction-velocity
   * Returns productivity velocity counts for a configured timeframe.
   * Total charts vs AI-assisted chart extraction volume day by day.
   */
  async getAbstractionVelocity(db, schema, { days = 14 } = {}) {
    const targetValue = parseInt(
      process.env.DASHBOARD_TARGET_CHARTS_PER_DAY ||
        process.env.DASHBOARD_TARGET_CHARTS ||
        "40",
      10
    );

    // SQL query to generate the date series and fetch aggregates per day.
    // The date generated will be in the tenant local timezone or UTC.
    // Using left joins to preserve all days within the duration.
    const query = `
      WITH date_range AS (
        SELECT (CURRENT_DATE - (days_series.val * INTERVAL '1 day'))::date AS date
        FROM generate_series(0, $1 - 1) AS days_series(val)
      )
      SELECT
        TO_CHAR(dr.date, 'YYYY-MM-DD') AS formatted_date,
        COALESCE(pc.total_charts, 0) AS total_charts,
        COALESCE(he.ai_assisted, 0) AS ai_assisted
      FROM date_range dr
      LEFT JOIN (
        SELECT (created_at AT TIME ZONE 'UTC')::date AS day, COUNT(*) AS total_charts
        FROM ${schema}.patient_charts
        WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
        GROUP BY (created_at AT TIME ZONE 'UTC')::date
      ) pc ON dr.date = pc.day
      LEFT JOIN (
        SELECT (created_at AT TIME ZONE 'UTC')::date AS day, COUNT(DISTINCT patient_id) AS ai_assisted
        FROM ${schema}.hedis_evaluations
        WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
        GROUP BY (created_at AT TIME ZONE 'UTC')::date
      ) he ON dr.date = he.day
      ORDER BY dr.date ASC;
    `;

    const result = await db.query(query, [days]);
    const rows = result.rows || [];

    const data = rows.map((row) => ({
      date: row.formatted_date,
      totalCharts: parseInt(row.total_charts, 10),
      aiAssisted: parseInt(row.ai_assisted, 10),
      target: targetValue,
    }));

    return data;
  }

  /**
   * GET /dashboard/queue-by-domain
   * Returns counts and percentage distribution of active queue items grouped by domain.
   */
  async getQueueByDomain(db, schema) {
    // Option A: Join hedis_evaluations with active patients (stage not Completed or Submission Ready)
    // where evaluation status is active (e.g. not Compliant, Complete, or Not Eligible).
    const query = `
      SELECT he.measure_code, COUNT(*) AS count
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      WHERE p.stage NOT IN ('Completed', 'Submission Ready', 'QA Passed')
        AND he.status NOT IN ('Compliant', 'Complete', 'Not Eligible')
      GROUP BY he.measure_code;
    `;

    const result = await db.query(query);
    const rows = result.rows || [];

    // Map each measure_code to its domain and aggregate counts
    const domainCounts = {
      Preventive: 0,
      Diabetes: 0,
      Cardiovascular: 0,
      "Mental Health": 0,
      Respiratory: 0,
      "Child Health": 0,
      Other: 0,
    };

    let totalCount = 0;

    for (const row of rows) {
      const measureCode = row.measure_code;
      const count = parseInt(row.count, 10);
      const domain = this.getDomainForMeasure(measureCode);
      domainCounts[domain] += count;
      totalCount += count;
    }

    // Prepare response formatting with percentages
    const data = Object.entries(domainCounts).map(([domain, count]) => {
      const percentage =
        totalCount > 0
          ? parseFloat(((count / totalCount) * 100).toFixed(1))
          : 0.0;
      return {
        domain,
        count,
        percentage,
      };
    });

    return data;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW APIS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * GET /dashboard/measure-rates
   * Returns HEDIS measure performance statistics per measure code.
   *
   * Current Rate  = numerator_true / denominator_true * 100 (all-time)
   * Target Rate   = from env override or null (no hardcoded values)
   * YOY           = current-year rate minus prior-year rate (null if no prior data)
   * Benchmark     = "Above" | "At Target" | "Below" | null
   */
  async getMeasureRates(db, schema, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();
    const priorYear = currentYear - 1;

    // Single aggregation: all-time + current-year + prior-year counts per measure
    const dataQuery = `
      SELECT
        he.measure_code,
        MAX(he.measure_name)                                                        AS measure_name,

        COUNT(*) FILTER (WHERE he.denominator = TRUE)                               AS denom_all,
        COUNT(*) FILTER (WHERE he.numerator   = TRUE)                               AS numer_all,

        COUNT(*) FILTER (WHERE he.denominator = TRUE
                           AND EXTRACT(YEAR FROM he.created_at) = $1)              AS denom_current,
        COUNT(*) FILTER (WHERE he.numerator   = TRUE
                           AND EXTRACT(YEAR FROM he.created_at) = $1)              AS numer_current,

        COUNT(*) FILTER (WHERE he.denominator = TRUE
                           AND EXTRACT(YEAR FROM he.created_at) = $2)              AS denom_prior,
        COUNT(*) FILTER (WHERE he.numerator   = TRUE
                           AND EXTRACT(YEAR FROM he.created_at) = $2)              AS numer_prior
      FROM ${schema}.hedis_evaluations he
      GROUP BY he.measure_code
      ORDER BY he.measure_code ASC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT measure_code) AS total
      FROM ${schema}.hedis_evaluations
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, [currentYear, priorYear, limit, offset]),
      db.query(countQuery),
    ]);

    const rows = dataResult.rows || [];
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    const data = rows.map((row) => {
      const measureCode = row.measure_code;

      // Current Rate (all-time)
      const denomAll = parseInt(row.denom_all, 10) || 0;
      const numerAll = parseInt(row.numer_all, 10) || 0;
      const currentRate =
        denomAll > 0
          ? parseFloat(((numerAll / denomAll) * 100).toFixed(1))
          : null;

      // YOY delta
      const denomCurrent = parseInt(row.denom_current, 10) || 0;
      const numerCurrent = parseInt(row.numer_current, 10) || 0;
      const denomPrior = parseInt(row.denom_prior, 10) || 0;
      const numerPrior = parseInt(row.numer_prior, 10) || 0;

      const rateCurrent =
        denomCurrent > 0 ? (numerCurrent / denomCurrent) * 100 : null;
      const ratePrior = denomPrior > 0 ? (numerPrior / denomPrior) * 100 : null;

      let yoy = null;
      if (rateCurrent !== null && ratePrior !== null) {
        yoy = parseFloat((rateCurrent - ratePrior).toFixed(1));
      }

      // Target & Benchmark
      const targetRate = this.getTargetRateForMeasure(measureCode);
      let benchmarkStatus = null;
      if (currentRate !== null && targetRate !== null) {
        if (currentRate > targetRate) benchmarkStatus = "Above";
        else if (currentRate < targetRate) benchmarkStatus = "Below";
        else benchmarkStatus = "At Target";
      }

      const domain = this.getDomainForMeasure(measureCode);
      const measureName =
        row.measure_name ||
        this.getMeasureNameFromLibrary(measureCode) ||
        measureCode;

      return {
        measureCode,
        measureName,
        domain,
        currentRate,
        targetRate,
        yoy,
        benchmarkStatus,
      };
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /dashboard/queue-by-measure
   * Returns abstraction workload grouped by measure code.
   *
   * Open        = patient stage: Unassigned / Not Started / Assigned
   * In Progress = patient stage: In Progress / Rework / QA Evidence Requested /
   *               Pending QA / Ready for QA Review / QA Returned
   * Completed   = patient stage: Completed / QA Approved / QA Passed / Submission Ready
   *               OR hedis_evaluations.status IN (Compliant, Complete)
   */
  async getQueueByMeasure(db, schema, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    // Paginated per-measure breakdown
    const dataQuery = `
    SELECT
      he.measure_code,
      COUNT(*) AS total,

      -- Open: Still needs work
      COUNT(*) FILTER (
        WHERE he.status IN ('Open', 'Gap', 'Not Eligible', 'Pending', 'Draft')
      ) AS open,

      -- In Progress: Under QA or Revision
      COUNT(*) FILTER (
        WHERE he.status IN ('In Progress', 'QA Review', 'QA Requested', 
                           'Rework', 'Revision Needed', 'QA Returned')
          OR qm.qa_status IN ('REQUEST_REVISION', 'QA_FAIL')
      ) AS in_progress,

      -- Completed
      COUNT(*) FILTER (
        WHERE he.status IN ('Compliant', 'Complete', 'Completed', 'Approved', 'QA Pass', 'Pass')
          OR qm.qa_status = 'QA_PASS'
      ) AS completed

    FROM ${schema}.hedis_evaluations he
    LEFT JOIN ${schema}.hedis_qa_measure_decisions qm 
      ON he.id = qm.measure_id
    GROUP BY he.measure_code
    ORDER BY he.measure_code ASC
    LIMIT $1 OFFSET $2
  `;

    const summaryQuery = `
    SELECT
      COUNT(*) FILTER (WHERE he.status IN ('Open', 'Gap', 'Not Eligible', 'Pending', 'Draft')) AS total_open,
      COUNT(*) FILTER (WHERE he.status IN ('In Progress', 'QA Review', 'Rework', 'Revision Needed', 'QA Returned')
                        OR qm.qa_status IN ('REQUEST_REVISION', 'QA_FAIL')) AS total_in_progress,
      COUNT(*) FILTER (WHERE he.status IN ('Compliant', 'Complete', 'Completed', 'Approved', 'QA Pass')
                        OR qm.qa_status = 'QA_PASS') AS total_completed,
      COUNT(*) AS total_all
    FROM ${schema}.hedis_evaluations he
    LEFT JOIN ${schema}.hedis_qa_measure_decisions qm ON he.id = qm.measure_id
  `;

    // Total distinct measures for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT he.measure_code) AS total
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
    `;

    const [dataResult, summaryResult, countResult] = await Promise.all([
      db.query(dataQuery, [limit, offset]),
      db.query(summaryQuery),
      db.query(countQuery),
    ]);

    const rows = dataResult.rows || [];
    const summaryRow = summaryResult.rows[0] || {};
    const totalMeasures = parseInt(countResult.rows[0]?.total || 0, 10);

    const data = rows.map((row) => {
      const open = parseInt(row.open, 10) || 0;
      const inProgress = parseInt(row.in_progress, 10) || 0;
      const completed = parseInt(row.completed, 10) || 0;
      const total = parseInt(row.total, 10) || 0;
      const completionPercentage =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        measureCode: row.measure_code,
        completionPercentage,
        open,
        inProgress,
        completed,
      };
    });

    const totalOpen = parseInt(summaryRow.total_open, 10) || 0;
    const totalInProgress = parseInt(summaryRow.total_in_progress, 10) || 0;
    const totalCompleted = parseInt(summaryRow.total_completed, 10) || 0;
    const grandTotal = parseInt(summaryRow.total_all, 10) || 0;
    const summaryCompletionPct =
      grandTotal > 0 ? Math.round((totalCompleted / grandTotal) * 100) : 0;

    return {
      data,
      summary: {
        completionPercentage: summaryCompletionPct,
        totalOpen,
        totalInProgress,
        totalCompleted,
      },
      pagination: {
        total: totalMeasures,
        page,
        limit,
        totalPages: Math.ceil(totalMeasures / limit),
      },
    };
  }

  /**
   * GET /dashboard/stats
   * Returns summary counts and trend information for all 5 dashboard stats cards:
   * 1. Open Queue
   * 2. Completed Today
   * 3. Overall HEDIS Rate
   * 4. AI Assist Rate
   * 5. SLA Compliance
   */
  async getDashboardStats(db, schema) {
    const currentYear = new Date().getFullYear();
    const priorYear = currentYear - 1;

    // 1. Open Queue
    const openQueueQuery = `
      SELECT COUNT(*) AS total_open
      FROM ${schema}.patients
      WHERE stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready');
    `;
    const openTodayQuery = `
      SELECT COUNT(*) AS today_count
      FROM ${schema}.patient_charts
      WHERE created_at >= CURRENT_DATE;
    `;

    // 2. Completed Today & Daily completions history
    const completedTodayQuery = `
      SELECT COUNT(*) AS completed_today
      FROM ${schema}.patients
      WHERE stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready')
        AND updated_at >= CURRENT_DATE;
    `;
    const avgCompletedQuery = `
      SELECT COALESCE(SUM(count), 0) / 14.0 AS avg_daily
      FROM (
        SELECT COUNT(*) AS count
        FROM ${schema}.patients
        WHERE stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready')
          AND updated_at >= CURRENT_DATE - INTERVAL '14 days'
          AND updated_at < CURRENT_DATE
        GROUP BY (updated_at AT TIME ZONE 'UTC')::date
      ) sub;
    `;

    // 3. Overall HEDIS Rate
    const hedisQuery = `
      SELECT
        COUNT(*) FILTER (WHERE denominator = TRUE) AS denom_all,
        COUNT(*) FILTER (WHERE numerator = TRUE) AS numer_all,
        
        COUNT(*) FILTER (WHERE denominator = TRUE AND EXTRACT(YEAR FROM created_at) = $1) AS denom_current,
        COUNT(*) FILTER (WHERE numerator = TRUE AND EXTRACT(YEAR FROM created_at) = $1) AS numer_current,
        
        COUNT(*) FILTER (WHERE denominator = TRUE AND EXTRACT(YEAR FROM created_at) = $2) AS denom_prior,
        COUNT(*) FILTER (WHERE numerator = TRUE AND EXTRACT(YEAR FROM created_at) = $2) AS numer_prior
      FROM ${schema}.hedis_evaluations;
    `;

    // 4. AI Assist Rate
    const aiAssistQuery = `
      SELECT
        COUNT(*) FILTER (WHERE review_status = 'ACCEPTED') AS accepted_all,
        COUNT(*) FILTER (WHERE review_status = 'REJECTED') AS rejected_all,
        
        COUNT(*) FILTER (WHERE review_status = 'ACCEPTED' AND reviewed_at >= CURRENT_DATE - INTERVAL '7 days') AS accepted_this_week,
        COUNT(*) FILTER (WHERE review_status = 'REJECTED' AND reviewed_at >= CURRENT_DATE - INTERVAL '7 days') AS rejected_this_week,
        
        COUNT(*) FILTER (WHERE review_status = 'ACCEPTED' AND reviewed_at >= CURRENT_DATE - INTERVAL '14 days' AND reviewed_at < CURRENT_DATE - INTERVAL '7 days') AS accepted_last_week,
        COUNT(*) FILTER (WHERE review_status = 'REJECTED' AND reviewed_at >= CURRENT_DATE - INTERVAL '14 days' AND reviewed_at < CURRENT_DATE - INTERVAL '7 days') AS rejected_last_week
      FROM ${schema}.clinical_timeline_events
      WHERE source_type IS NULL OR source_type = 'AI';
    `;

    // 5. SLA Compliance
    const slaQuery = `
      SELECT
        COUNT(*) AS total_charts,
        COUNT(CASE WHEN 
          (stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR updated_at <= due_date))
          OR (stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR due_date >= CURRENT_DATE))
          THEN 1 END) AS on_time_charts,
          
        COUNT(*) FILTER (WHERE due_date >= CURRENT_DATE - INTERVAL '7 days' AND due_date < CURRENT_DATE + INTERVAL '1 day') AS due_this_week,
        COUNT(*) FILTER (WHERE due_date >= CURRENT_DATE - INTERVAL '7 days' AND due_date < CURRENT_DATE + INTERVAL '1 day' AND (
          (stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR updated_at <= due_date))
          OR (stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR due_date >= CURRENT_DATE))
        )) AS on_time_this_week,

        COUNT(*) FILTER (WHERE due_date >= CURRENT_DATE - INTERVAL '14 days' AND due_date < CURRENT_DATE - INTERVAL '7 days') AS due_last_week,
        COUNT(*) FILTER (WHERE due_date >= CURRENT_DATE - INTERVAL '14 days' AND due_date < CURRENT_DATE - INTERVAL '7 days' AND (
          (stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR updated_at <= due_date))
          OR (stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR due_date >= CURRENT_DATE))
        )) AS on_time_last_week
      FROM ${schema}.patients;
    `;

    // Execute queries in parallel
    const [
      openQueueRes,
      openTodayRes,
      completedTodayRes,
      avgCompletedRes,
      hedisRes,
      aiAssistRes,
      slaRes,
    ] = await Promise.all([
      db.query(openQueueQuery),
      db.query(openTodayQuery),
      db.query(completedTodayQuery),
      db.query(avgCompletedQuery),
      db.query(hedisQuery, [currentYear, priorYear]),
      db.query(aiAssistQuery),
      db.query(slaQuery),
    ]);

    // Format outputs

    // 1. Open Queue
    const openValue = parseInt(openQueueRes.rows[0]?.total_open || 0, 10);
    const openToday = parseInt(openTodayRes.rows[0]?.today_count || 0, 10);
    const openTrend = `+${openToday} today`;
    const openTrendType = openToday > 0 ? "up" : "neutral";

    // 2. Completed Today
    const completedValue = parseInt(completedTodayRes.rows[0]?.completed_today || 0, 10);
    const avgCompleted = parseFloat(avgCompletedRes.rows[0]?.avg_daily || 0.0);
    let completedTrend = null;
    let completedTrendType = "neutral";
    if (avgCompleted > 0) {
      const changePct = Math.round(((completedValue - avgCompleted) / avgCompleted) * 100);
      completedTrend = `${changePct >= 0 ? "+" : ""}${changePct}% vs avg`;
      completedTrendType = changePct > 0 ? "up" : (changePct < 0 ? "down" : "neutral");
    } else {
      completedTrend = "+0% vs avg";
    }

    // 3. Overall HEDIS Rate
    const hedisRow = hedisRes.rows[0] || {};
    const denomCurrent = parseInt(hedisRow.denom_current || 0, 10);
    const numerCurrent = parseInt(hedisRow.numer_current || 0, 10);
    const denomAll = parseInt(hedisRow.denom_all || 0, 10);
    const numerAll = parseInt(hedisRow.numer_all || 0, 10);
    const denomPrior = parseInt(hedisRow.denom_prior || 0, 10);
    const numerPrior = parseInt(hedisRow.numer_prior || 0, 10);

    const currentRate = denomCurrent > 0 
      ? parseFloat(((numerCurrent / denomCurrent) * 100).toFixed(1))
      : (denomAll > 0 ? parseFloat(((numerAll / denomAll) * 100).toFixed(1)) : 0.0);
    const priorRate = denomPrior > 0 
      ? parseFloat(((numerPrior / denomPrior) * 100).toFixed(1))
      : null;

    let hedisTrend = null;
    let hedisTrendType = "neutral";
    if (priorRate !== null) {
      const delta = parseFloat((currentRate - priorRate).toFixed(1));
      hedisTrend = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs MY${priorYear}`;
      hedisTrendType = delta > 0 ? "up" : (delta < 0 ? "down" : "neutral");
    }

    // 4. AI Assist Rate
    const aiAssistRow = aiAssistRes.rows[0] || {};
    const acceptedAll = parseInt(aiAssistRow.accepted_all || 0, 10);
    const rejectedAll = parseInt(aiAssistRow.rejected_all || 0, 10);
    const totalAll = acceptedAll + rejectedAll;

    const acceptedThisWeek = parseInt(aiAssistRow.accepted_this_week || 0, 10);
    const rejectedThisWeek = parseInt(aiAssistRow.rejected_this_week || 0, 10);
    const totalThisWeek = acceptedThisWeek + rejectedThisWeek;

    const acceptedLastWeek = parseInt(aiAssistRow.accepted_last_week || 0, 10);
    const rejectedLastWeek = parseInt(aiAssistRow.rejected_last_week || 0, 10);
    const totalLastWeek = acceptedLastWeek + rejectedLastWeek;

    const aiAssistRate = totalAll > 0 
      ? parseFloat(((acceptedAll / totalAll) * 100).toFixed(1))
      : null;

    const rateThisWeek = totalThisWeek > 0 
      ? (acceptedThisWeek / totalThisWeek) * 100 
      : null;
    const rateLastWeek = totalLastWeek > 0 
      ? (acceptedLastWeek / totalLastWeek) * 100 
      : null;

    let aiAssistTrend = null;
    let aiAssistTrendType = "neutral";
    if (rateThisWeek !== null && rateLastWeek !== null) {
      const delta = parseFloat((rateThisWeek - rateLastWeek).toFixed(1));
      aiAssistTrend = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% this wk`;
      aiAssistTrendType = delta > 0 ? "up" : (delta < 0 ? "down" : "neutral");
    }

    // 5. SLA Compliance
    const slaRow = slaRes.rows[0] || {};
    const totalCharts = parseInt(slaRow.total_charts || 0, 10);
    const onTimeCharts = parseInt(slaRow.on_time_charts || 0, 10);

    const dueThisWeek = parseInt(slaRow.due_this_week || 0, 10);
    const onTimeThisWeek = parseInt(slaRow.on_time_this_week || 0, 10);

    const dueLastWeek = parseInt(slaRow.due_last_week || 0, 10);
    const onTimeLastWeek = parseInt(slaRow.on_time_last_week || 0, 10);

    const slaCompliance = totalCharts > 0 
      ? parseFloat(((onTimeCharts / totalCharts) * 100).toFixed(1))
      : 100.0;

    const complianceThisWeek = dueThisWeek > 0 
      ? (onTimeThisWeek / dueThisWeek) * 100 
      : null;
    const complianceLastWeek = dueLastWeek > 0 
      ? (onTimeLastWeek / dueLastWeek) * 100 
      : null;

    let slaTrend = null;
    let slaTrendType = "neutral";
    if (complianceThisWeek !== null && complianceLastWeek !== null) {
      const delta = parseFloat((complianceThisWeek - complianceLastWeek).toFixed(1));
      slaTrend = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% this wk`;
      slaTrendType = delta > 0 ? "up" : (delta < 0 ? "down" : "neutral");
    }

    return {
      openQueue: {
        value: openValue,
        trend: openTrend,
        trendType: openTrendType,
      },
      completedToday: {
        value: completedValue,
        trend: completedTrend,
        trendType: completedTrendType,
      },
      overallHedisRate: {
        value: currentRate,
        trend: hedisTrend,
        trendType: hedisTrendType,
      },
      aiAssistRate: {
        value: aiAssistRate,
        trend: aiAssistTrend,
        trendType: aiAssistTrendType,
      },
      slaCompliance: {
        value: slaCompliance,
        trend: slaTrend,
        trendType: slaTrendType,
      },
    };
  }
}

module.exports = new DashboardAnalyticsService();
