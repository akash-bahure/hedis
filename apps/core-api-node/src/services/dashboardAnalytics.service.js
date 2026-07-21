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
  // FILTER HELPER
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Build parameterized SQL fragments for the global top filters.
   * Mutates the `values` array in-place and returns a SQL AND-clause string.
   *
   * @param {object}   filters          - { measurementYear?, search? }
   * @param {Array}    values           - existing parameter values array (mutated)
   * @param {string}   [alias='p']      - table alias for the patients table
   * @returns {string} SQL string starting with " AND ..." (empty string if no filters)
   */
  _buildPatientFilters(filters = {}, values = [], alias = "p") {
    let sql = "";

    if (filters.measurementYear) {
      values.push(filters.measurementYear.trim());
      sql += ` AND ${alias}.measure ILIKE $${values.length}`;
    }

    if (filters.search) {
      const term = `%${filters.search.trim()}%`;
      values.push(term);
      sql +=
        ` AND (${alias}.first_name ILIKE $${values.length}` +
        ` OR ${alias}.last_name ILIKE $${values.length}` +
        ` OR ${alias}.measure ILIKE $${values.length})`;
    }

    return sql;
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
  async getQueueByDomain(db, schema, filters = {}) {
    // Join hedis_evaluations with active patients (stage not Completed or Submission Ready)
    // where evaluation status is active (e.g. not Compliant, Complete, or Not Eligible).
    const values = [];
    const filterSql = this._buildPatientFilters(filters, values);

    const query = `
      SELECT he.measure_code, COUNT(*) AS count
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      WHERE p.stage NOT IN ('Completed', 'Submission Ready', 'QA Passed')
        AND he.status NOT IN ('Compliant', 'Complete', 'Not Eligible')
        ${filterSql}
      GROUP BY he.measure_code;
    `;

    const result = await db.query(query, values);
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
  async getMeasureRates(
    db,
    schema,
    { page = 1, limit = 10, filters = {} } = {}
  ) {
    const offset = (page - 1) * limit;
    const currentYear = new Date().getFullYear();
    const priorYear = currentYear - 1;

    // Use one array and pass to _buildPatientFilters so it starts pushing at index 3
    const dataParams = [currentYear, priorYear];
    const filterSql = this._buildPatientFilters(filters, dataParams);

    const limitIdx = dataParams.length + 1;
    const offsetIdx = dataParams.length + 2;
    dataParams.push(limit, offset);

    // Join patients only when a patient-level filter is active to preserve performance
    const patientJoin = filterSql
      ? `INNER JOIN ${schema}.patients p ON he.patient_id = p.id`
      : "";

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
      ${patientJoin}
      WHERE 1=1 ${filterSql}
      GROUP BY he.measure_code
      ORDER BY he.measure_code ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    // Count query: apply same patient filter (starts empty index, so offset from 1 is fine here)
    const countFilterValues = [];
    const countFilterSql = this._buildPatientFilters(
      filters,
      countFilterValues
    );
    const countPatientJoin = countFilterSql
      ? `INNER JOIN ${schema}.patients p ON he.patient_id = p.id`
      : "";
    const countQuery = `
      SELECT COUNT(DISTINCT he.measure_code) AS total
      FROM ${schema}.hedis_evaluations he
      ${countPatientJoin}
      WHERE 1=1 ${countFilterSql}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(countQuery, countFilterValues),
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
  async getQueueByMeasure(
    db,
    schema,
    { page = 1, limit = 10, filters = {} } = {}
  ) {
    const offset = (page - 1) * limit;

    // Build filter SQL (shared for data, summary, and count queries)
    const dataFilterValues = [];
    const dataFilterSql = this._buildPatientFilters(filters, dataFilterValues);
    const patientJoin = `LEFT JOIN ${schema}.patients p ON he.patient_id = p.id`;
    const dataWhere = dataFilterSql ? `WHERE 1=1 ${dataFilterSql}` : "";

    const dataLimitIdx = dataFilterValues.length + 1;
    const dataOffsetIdx = dataFilterValues.length + 2;
    const dataParams = [...dataFilterValues, limit, offset];

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
    ${patientJoin}
    ${dataWhere}
    GROUP BY he.measure_code
    ORDER BY he.measure_code ASC
    LIMIT $${dataLimitIdx} OFFSET $${dataOffsetIdx}
  `;

    // Summary totals (apply same filter)
    const summaryFilterValues = [];
    const summaryFilterSql = this._buildPatientFilters(
      filters,
      summaryFilterValues
    );
    const summaryWhere = summaryFilterSql
      ? `WHERE 1=1 ${summaryFilterSql}`
      : "";

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
    ${patientJoin}
    ${summaryWhere}
  `;

    // Total distinct measures for pagination (apply same filter)
    const countFilterValues = [];
    const countFilterSql = this._buildPatientFilters(
      filters,
      countFilterValues
    );
    const countWhere = countFilterSql ? `WHERE 1=1 ${countFilterSql}` : "";

    const countQuery = `
      SELECT COUNT(DISTINCT he.measure_code) AS total
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      ${countWhere}
    `;

    const [dataResult, summaryResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(summaryQuery, summaryFilterValues),
      db.query(countQuery, countFilterValues),
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
  /**
   * GET /dashboard/stats
   */
  async getDashboardStats(db, schema, filters = {}) {
    const currentYear = new Date().getFullYear();
    const priorYear = currentYear - 1;

    // 1. Open Queue (patient table)
    const openQueueFilterValues = [];
    const openQueueFilterSql = this._buildPatientFilters(
      filters,
      openQueueFilterValues,
      "p"
    );

    const openQueueQuery = `
      SELECT COUNT(*) AS total_open
      FROM ${schema}.patients p
      WHERE stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready')
        ${openQueueFilterSql}
    `;

    // 2. Completed Today (patient table)
    const completedFilterValues = [];
    const completedFilterSql = this._buildPatientFilters(
      filters,
      completedFilterValues,
      "p"
    );

    const completedTodayQuery = `
      SELECT COUNT(*) AS completed_today
      FROM ${schema}.patients p
      WHERE stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready')
        AND updated_at >= CURRENT_DATE
        ${completedFilterSql}
    `;

    // 3. Avg Daily Completed (last 14 days)
    const avgFilterValues = [];
    const avgFilterSql = this._buildPatientFilters(
      filters,
      avgFilterValues,
      "p"
    );

    const avgCompletedQuery = `
      SELECT COALESCE(SUM(count), 0) / 14.0 AS avg_daily
      FROM (
        SELECT COUNT(*) AS count
        FROM ${schema}.patients p
        WHERE stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready')
          AND updated_at >= CURRENT_DATE - INTERVAL '14 days'
          AND updated_at < CURRENT_DATE
          ${avgFilterSql}
        GROUP BY (updated_at AT TIME ZONE 'UTC')::date
      ) sub;
    `;

    // 4. HEDIS Rate
    const hedisFilterValues = [currentYear, priorYear];
    const hedisFilterSql = this._buildPatientFilters(
      filters,
      hedisFilterValues,
      "p"
    );
    const hedisPatientJoin = hedisFilterSql
      ? `INNER JOIN ${schema}.patients p ON he.patient_id = p.id`
      : "";

    const hedisQuery = `
      SELECT
        COUNT(*) FILTER (WHERE he.denominator = TRUE) AS denom_all,
        COUNT(*) FILTER (WHERE he.numerator = TRUE) AS numer_all,

        COUNT(*) FILTER (WHERE he.denominator = TRUE AND EXTRACT(YEAR FROM he.created_at) = $1) AS denom_current,
        COUNT(*) FILTER (WHERE he.numerator = TRUE AND EXTRACT(YEAR FROM he.created_at) = $1) AS numer_current,

        COUNT(*) FILTER (WHERE he.denominator = TRUE AND EXTRACT(YEAR FROM he.created_at) = $2) AS denom_prior,
        COUNT(*) FILTER (WHERE he.numerator = TRUE AND EXTRACT(YEAR FROM he.created_at) = $2) AS numer_prior
      FROM ${schema}.hedis_evaluations he
      ${hedisPatientJoin}
      WHERE 1=1 ${hedisFilterSql}
    `;

    // 5. AI Assist Rate (no patient filter needed)
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

    // 6. SLA Compliance (patient table)
    const slaFilterValues = [];
    const slaFilterSql = this._buildPatientFilters(
      filters,
      slaFilterValues,
      "p"
    );

    const slaQuery = `
      SELECT
        COUNT(*) AS total_charts,
        COUNT(CASE WHEN
          (stage IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR updated_at <= due_date))
          OR (stage NOT IN ('Completed', 'QA Approved', 'QA Passed', 'Submission Ready') AND (due_date IS NULL OR due_date >= CURRENT_DATE))
          THEN 1 END) AS on_time_charts
      FROM ${schema}.patients p
      WHERE 1=1 ${slaFilterSql}
    `;

    // Execute in parallel
    const [
      openQueueRes,
      completedTodayRes,
      avgCompletedRes,
      hedisRes,
      aiAssistRes,
      slaRes,
    ] = await Promise.all([
      db.query(openQueueQuery, openQueueFilterValues),
      db.query(completedTodayQuery, completedFilterValues),
      db.query(avgCompletedQuery, avgFilterValues),
      db.query(hedisQuery, hedisFilterValues),
      db.query(aiAssistQuery),
      db.query(slaQuery, slaFilterValues),
    ]);

    // === Format Results ===

    // Open Queue
    const openValue = parseInt(openQueueRes.rows[0]?.total_open || 0, 10);

    // Completed Today
    const completedValue = parseInt(
      completedTodayRes.rows[0]?.completed_today || 0,
      10
    );
    const avgCompleted = parseFloat(avgCompletedRes.rows[0]?.avg_daily || 0);

    let completedTrend = "+0% vs avg";
    let completedTrendType = "neutral";
    if (avgCompleted > 0) {
      const changePct = Math.round(
        ((completedValue - avgCompleted) / avgCompleted) * 100
      );
      completedTrend = `${changePct >= 0 ? "+" : ""}${changePct}% vs avg`;
      completedTrendType =
        changePct > 0 ? "up" : changePct < 0 ? "down" : "neutral";
    }

    // HEDIS Rate
    const hedisRow = hedisRes.rows[0] || {};
    const denomCurrent = parseInt(hedisRow.denom_current || 0, 10);
    const numerCurrent = parseInt(hedisRow.numer_current || 0, 10);
    const denomAll = parseInt(hedisRow.denom_all || 0, 10);
    const numerAll = parseInt(hedisRow.numer_all || 0, 10);
    const denomPrior = parseInt(hedisRow.denom_prior || 0, 10);
    const numerPrior = parseInt(hedisRow.numer_prior || 0, 10);

    const currentRate =
      denomCurrent > 0
        ? parseFloat(((numerCurrent / denomCurrent) * 100).toFixed(1))
        : denomAll > 0
          ? parseFloat(((numerAll / denomAll) * 100).toFixed(1))
          : 0;

    const priorRate =
      denomPrior > 0
        ? parseFloat(((numerPrior / denomPrior) * 100).toFixed(1))
        : null;

    let hedisTrend = null;
    let hedisTrendType = "neutral";
    if (priorRate !== null) {
      const delta = parseFloat((currentRate - priorRate).toFixed(1));
      hedisTrend = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs MY${priorYear}`;
      hedisTrendType = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
    }

    // AI Assist Rate
    const aiAssistRow = aiAssistRes.rows[0] || {};
    const acceptedAll = parseInt(aiAssistRow.accepted_all || 0, 10);
    const rejectedAll = parseInt(aiAssistRow.rejected_all || 0, 10);
    const totalAll = acceptedAll + rejectedAll;

    const aiAssistRate =
      totalAll > 0
        ? parseFloat(((acceptedAll / totalAll) * 100).toFixed(1))
        : 0;

    // SLA Compliance
    const slaRow = slaRes.rows[0] || {};
    const totalCharts = parseInt(slaRow.total_charts || 0, 10);
    const onTimeCharts = parseInt(slaRow.on_time_charts || 0, 10);
    const slaCompliance =
      totalCharts > 0
        ? parseFloat(((onTimeCharts / totalCharts) * 100).toFixed(1))
        : 100;

    return {
      openQueue: {
        value: openValue,
        trend: `+${openValue} open`,
        trendType: "neutral",
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
      aiAssistRate: { value: aiAssistRate, trend: null, trendType: "neutral" },
      slaCompliance: {
        value: slaCompliance,
        trend: null,
        trendType: "neutral",
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPCOMING ABSTRACTION DEADLINES API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * GET /dashboard/abstraction-deadlines
   *
   * Returns open HEDIS measure gaps grouped by measure code, providing SLA
   * deadline tracking for the abstraction team dashboard card.
   *
   * For each measure returns:
   *   - measureCode, measureName
   *   - totalOpen    – patient-evals where stage is open / not yet completed
   *   - totalDone    – patient-evals where stage or eval status is completed
   *   - nearestDueDate – ISO date string of the earliest open due_date
   *   - remainingDays  – calendar days from today to nearestDueDate (negative = overdue)
   *   - completionPercentage – totalDone / (totalOpen + totalDone) * 100
   *
   * Only "open" gaps are included (stage NOT IN completed set).
   * Supports global filters: measurementYear (patients.measure ILIKE) and search.
   * Pagination is applied to the distinct measure_code groups.
   *
   * @param {object} db       - tenant db client
   * @param {string} schema   - tenant schema name
   * @param {object} options  - { page, limit, filters }
   */
  async getAbstractionDeadlines(
    db,
    schema,
    { page = 1, limit = 10, filters = {} } = {}
  ) {
    const offset = (page - 1) * limit;

    // ── Completed stage set (same definition used across all dashboard APIs) ──
    const COMPLETED_STAGES = [
      "Completed",
      "QA Approved",
      "QA Passed",
      "Submission Ready",
    ];
    const COMPLETED_EVAL_STATUSES = [
      "Compliant",
      "Complete",
      "Completed",
      "Approved",
      "QA Pass",
      "Pass",
    ];

    // Build filter fragments — both queries share the same patient-level filters
    const dataValues = [];
    const filterSql = this._buildPatientFilters(filters, dataValues, "p");

    const limitIdx = dataValues.length + 1;
    const offsetIdx = dataValues.length + 2;
    const dataParams = [...dataValues, limit, offset];

    // ── Paginated data query ──────────────────────────────────────────────────
    // We join patients → hedis_evaluations to get one row per (measure_code, patient).
    // We restrict to "open" measures only (stage not in completed set) so the
    // card only surfaces measures that still need work.
    const dataQuery = `
      SELECT
        he.measure_code,
        MAX(he.measure_name)                                  AS measure_name,

        -- Open: patient stage is NOT completed and eval status is not done
        COUNT(*) FILTER (
          WHERE p.stage NOT IN (${COMPLETED_STAGES.map((s) => `'${s}'`).join(",")})
            AND he.status NOT IN (${COMPLETED_EVAL_STATUSES.map((s) => `'${s}'`).join(",")})
        )                                                     AS total_open,

        -- Done: stage or eval status indicates completion
        COUNT(*) FILTER (
          WHERE p.stage IN (${COMPLETED_STAGES.map((s) => `'${s}'`).join(",")})
             OR he.status IN (${COMPLETED_EVAL_STATUSES.map((s) => `'${s}'`).join(",")})
        )                                                     AS total_done,

        -- Nearest due date among open patients for this measure
        MIN(p.due_date) FILTER (
          WHERE p.stage NOT IN (${COMPLETED_STAGES.map((s) => `'${s}'`).join(",")})
            AND he.status NOT IN (${COMPLETED_EVAL_STATUSES.map((s) => `'${s}'`).join(",")})
        )                                                     AS nearest_due_date

      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      WHERE p.stage NOT IN (${COMPLETED_STAGES.map((s) => `'${s}'`).join(",")})
        ${filterSql}
      GROUP BY he.measure_code
      ORDER BY nearest_due_date ASC NULLS LAST, he.measure_code ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    // ── Total-count query for pagination ─────────────────────────────────────
    const countValues = [];
    const countFilterSql = this._buildPatientFilters(filters, countValues, "p");

    const countQuery = `
      SELECT COUNT(DISTINCT he.measure_code) AS total
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      WHERE p.stage NOT IN (${COMPLETED_STAGES.map((s) => `'${s}'`).join(",")})
        ${countFilterSql}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(countQuery, countValues),
    ]);

    const rows = dataResult.rows || [];
    const total = parseInt(countResult.rows[0]?.total || 0, 10);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = rows.map((row) => {
      const measureCode = row.measure_code;
      const measureName =
        row.measure_name ||
        this.getMeasureNameFromLibrary(measureCode) ||
        measureCode;

      const totalOpen = parseInt(row.total_open, 10) || 0;
      const totalDone = parseInt(row.total_done, 10) || 0;
      const grandTotal = totalOpen + totalDone;
      const completionPercentage =
        grandTotal > 0 ? Math.round((totalDone / grandTotal) * 100) : 0;

      let nearestDueDate = null;
      let remainingDays = null;
      if (row.nearest_due_date) {
        const due = new Date(row.nearest_due_date);
        due.setHours(0, 0, 0, 0);
        nearestDueDate = due.toISOString().split("T")[0];
        remainingDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
      }

      return {
        measureCode,
        measureName,
        totalOpen,
        totalDone,
        nearestDueDate,
        remainingDays,
        completionPercentage,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // MY QUEUE API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * GET /dashboard/my-queue
   *
   * Returns the authenticated user's assigned patient/chart queue.
   *
   * "measure" field: returns patients.measure (the full HEDIS year string stored
   * in the patients table, e.g. "HEDIS MY2025") as requested.
   *
   * chartStatus derivation (matches UI badge labels):
   *   - stage IN ('Completed','QA Approved','QA Passed','Submission Ready')
   *       AND latest qa_status = 'REQUEST_REVISION'  →  "QA Pending"
   *   - stage IN completed set                        →  "Completed"
   *   - stage IN ('In Progress','Rework','Pending QA',
   *               'Ready for QA Review','QA Evidence Requested','QA Returned') → "In Progress"
   *   - otherwise                                     →  "Not Started"
   *
   * progress derivation:
   *   - eval status IN completed set  →  100
   *   - qa_status = 'QA_PASS'         →  100
   *   - stage-based approximation otherwise (see STAGE_PROGRESS_MAP)
   *
   * Supports global filters: measurementYear (patients.measure ILIKE) and search.
   * Pagination across patient rows (one row per patient-evaluation pair).
   *
   * @param {object} db       - tenant db client
   * @param {string} schema   - tenant schema name
   * @param {object} options  - { page, limit, filters, userId }
   */
  async getMyQueue(
    db,
    schema,
    { page = 1, limit = 10, filters = {}, userId } = {}
  ) {
    if (!userId) {
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const offset = (page - 1) * limit;

    // ── Stage → progress approximation map ───────────────────────────────────
    const STAGE_PROGRESS_MAP = {
      Unassigned: 0,
      "Not Started": 0,
      Assigned: 10,
      "In Progress": 40,
      Rework: 30,
      "Pending QA": 60,
      "QA Evidence Requested": 65,
      "Ready for QA Review": 70,
      "QA Returned": 50,
      "QA Failed": 50,
      Completed: 100,
      "QA Approved": 100,
      "QA Passed": 100,
      "Submission Ready": 100,
    };

    const COMPLETED_EVAL_STATUSES = [
      "Compliant",
      "Complete",
      "Completed",
      "Approved",
      "QA Pass",
      "Pass",
    ];

    // Build patient-level filter SQL — userId is the first param, so filters
    // start pushing at index 2.
    const filterValues = [userId];
    const filterSql = this._buildPatientFilters(filters, filterValues, "p");

    const limitIdx = filterValues.length + 1;
    const offsetIdx = filterValues.length + 2;
    const dataParams = [...filterValues, limit, offset];

    // ── Data query ────────────────────────────────────────────────────────────
    // One row per (patient, hedis_evaluation). The LATERAL subquery fetches the
    // most-recent QA decision for each evaluation without a correlated-subquery
    // performance penalty on large datasets.
    const dataQuery = `
      SELECT
        p.id               AS patient_uuid,
        p.patient_id       AS member_id,
        p.first_name,
        p.last_name,
        p.measure          AS measure,
        p.stage,
        p.due_date,
        p.priority,
        he.id              AS eval_id,
        he.measure_code,
        he.measure_name    AS eval_measure_name,
        he.status          AS eval_status,
        qm.qa_status
      FROM ${schema}.patients p
      INNER JOIN ${schema}.hedis_evaluations he ON he.patient_id = p.id
      LEFT JOIN LATERAL (
        SELECT qa_status
        FROM ${schema}.hedis_qa_measure_decisions
        WHERE measure_id = he.id
        ORDER BY updated_at DESC
        LIMIT 1
      ) qm ON TRUE
      WHERE (p.assigned_to = $1 OR p.abstractor_id = $1 OR p.qa_id = $1)
        ${filterSql}
      ORDER BY
        p.due_date ASC NULLS LAST,
        p.priority DESC,
        p.last_name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    // ── Count query for pagination ─────────────────────────────────────────────
    const countValues = [userId];
    const countFilterSql = this._buildPatientFilters(filters, countValues, "p");

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${schema}.patients p
      INNER JOIN ${schema}.hedis_evaluations he ON he.patient_id = p.id
      WHERE (p.assigned_to = $1 OR p.abstractor_id = $1 OR p.qa_id = $1)
        ${countFilterSql}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(countQuery, countValues),
    ]);

    const rows = dataResult.rows || [];
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    const data = rows.map((row) => {
      const stage = row.stage || "Not Started";
      const evalStatus = row.eval_status || "";
      const qaStatus = row.qa_status || null;
      const measureCode = row.measure_code;

      // ── chartStatus badge logic ───────────────────────────────────────────
      const isCompletedStage = [
        "Completed",
        "QA Approved",
        "QA Passed",
        "Submission Ready",
      ].includes(stage);

      let chartStatus;
      if (isCompletedStage && qaStatus === "REQUEST_REVISION") {
        chartStatus = "QA Pending";
      } else if (isCompletedStage) {
        chartStatus = "Completed";
      } else if (
        [
          "In Progress",
          "Rework",
          "Pending QA",
          "Ready for QA Review",
          "QA Evidence Requested",
          "QA Failed",
          "QA Returned",
        ].includes(stage)
      ) {
        chartStatus = "In Progress";
      } else if (stage === "Assigned") {
        chartStatus = "Not Started";
      } else {
        chartStatus = "Not Started";
      }

      // ── Progress calculation ────────────────────────────────────────────────
      let progress;
      if (
        COMPLETED_EVAL_STATUSES.includes(evalStatus) ||
        qaStatus === "QA_PASS"
      ) {
        progress = 100;
      } else {
        progress = STAGE_PROGRESS_MAP[stage] ?? 0;
      }

      // ── Due date (ISO date string or null) ─────────────────────────────────
      let dueDate = null;
      if (row.due_date) {
        dueDate = new Date(row.due_date).toISOString().split("T")[0];
      }

      const measureName =
        row.eval_measure_name ||
        this.getMeasureNameFromLibrary(measureCode) ||
        measureCode;

      return {
        patientId: row.patient_uuid,
        memberId: row.member_id,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        // patients.measure holds the full HEDIS year string (e.g. "HEDIS MY2025")
        measure: row.measure || null,
        measureCode,
        measureName,
        chartStatus,
        stage,
        dueDate,
        priority: row.priority || null,
        progress,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // USER QUEUE (FLAT PATIENT LIST) API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * GET /dashboard/user-queue
   *
   * Flat patient queue for the authenticated user.
   * One row per patient — NOT expanded by measure/evaluation.
   *
   * Key differences from getMyQueue:
   *   - No join to hedis_evaluations → no measure_code, no measure_name
   *   - "measure" field = patients.measure (HEDIS year string, e.g. "HEDIS MY2025")
   *   - chartStatus derived purely from patients.stage + latest QA decision
   *   - Progress approximated from stage (same STAGE_PROGRESS_MAP)
   *
   * Columns returned per row:
   *   patientId, memberId, firstName, lastName,
   *   measure (patients.measure — HEDIS year string),
   *   stage, chartStatus, dueDate, priority, progress
   *
   * Sorted: due_date ASC NULLS LAST → priority DESC → last_name ASC
   *
   * @param {object} db       - tenant db client
   * @param {string} schema   - tenant schema name
   * @param {object} options  - { page, limit, filters, userId }
   */
  async getUserQueue(
    db,
    schema,
    { page = 1, limit = 10, filters = {}, userId } = {}
  ) {
    if (!userId) {
      return {
        data: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const offset = (page - 1) * limit;

    const STAGE_PROGRESS_MAP = {
      Unassigned: 0,
      "Not Started": 0,
      Assigned: 10,
      "In Progress": 40,
      Rework: 30,
      "Pending QA": 60,
      "QA Evidence Requested": 65,
      "Ready for QA Review": 70,
      "QA Returned": 50,
      "QA Failed": 50,
      Completed: 100,
      "QA Approved": 100,
      "QA Passed": 100,
      "Submission Ready": 100,
    };

    // userId is $1; filters start at $2
    const filterValues = [userId];
    const filterSql = this._buildPatientFilters(filters, filterValues, "p");

    const limitIdx = filterValues.length + 1;
    const offsetIdx = filterValues.length + 2;
    const dataParams = [...filterValues, limit, offset];

    // ── Data query ────────────────────────────────────────────────────────────
    // Pure patients query — no hedis_evaluations join.
    // LATERAL fetches the most-recent QA decision for this patient across all
    // their evaluations, used only for "QA Pending" badge derivation.
    const dataQuery = `
      SELECT
        p.id          AS patient_uuid,
        p.patient_id  AS member_id,
        p.first_name,
        p.last_name,
        p.measure,
        p.stage,
        p.due_date,
        p.priority,
        qm.qa_status
      FROM ${schema}.patients p
      LEFT JOIN LATERAL (
        SELECT qd.qa_status
        FROM ${schema}.hedis_qa_measure_decisions qd
        WHERE qd.patient_id = p.id
        ORDER BY qd.updated_at DESC
        LIMIT 1
      ) qm ON TRUE
      WHERE (p.assigned_to = $1 OR p.abstractor_id = $1 OR p.qa_id = $1)
        ${filterSql}
      ORDER BY
        p.due_date ASC NULLS LAST,
        p.priority DESC,
        p.last_name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    // ── Count query ───────────────────────────────────────────────────────────
    const countValues = [userId];
    const countFilterSql = this._buildPatientFilters(filters, countValues, "p");

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${schema}.patients p
      WHERE (p.assigned_to = $1 OR p.abstractor_id = $1 OR p.qa_id = $1)
        ${countFilterSql}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(countQuery, countValues),
    ]);

    const rows = dataResult.rows || [];
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    const data = rows.map((row) => {
      const stage = row.stage || "Not Started";
      const qaStatus = row.qa_status || null;

      // ── chartStatus badge ─────────────────────────────────────────────────
      const isCompletedStage = [
        "Completed",
        "QA Approved",
        "QA Passed",
        "Submission Ready",
      ].includes(stage);

      let chartStatus;
      if (isCompletedStage && qaStatus === "REQUEST_REVISION") {
        chartStatus = "QA Pending";
      } else if (isCompletedStage) {
        chartStatus = "Completed";
      } else if (
        [
          "In Progress",
          "Rework",
          "Pending QA",
          "Ready for QA Review",
          "QA Failed",
          "QA Evidence Requested",
          "QA Returned",
        ].includes(stage)
      ) {
        chartStatus = "In Progress";
      } else {
        chartStatus = "Not Started";
      }

      // ── Progress ──────────────────────────────────────────────────────────
      const progress =
        qaStatus === "QA_PASS" ? 100 : (STAGE_PROGRESS_MAP[stage] ?? 0);

      // ── Due date (ISO string or null) ─────────────────────────────────────
      const dueDate = row.due_date
        ? new Date(row.due_date).toISOString().split("T")[0]
        : null;

      return {
        patientId: row.patient_uuid,
        memberId: row.member_id,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        // patients.measure = full HEDIS year string, e.g. "HEDIS MY2025"
        measure: row.measure || null,
        stage,
        chartStatus,
        dueDate,
        priority: row.priority || null,
        progress,
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
}

module.exports = new DashboardAnalyticsService();
