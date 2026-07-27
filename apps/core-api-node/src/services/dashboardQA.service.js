class DashboardQAService {
  /**
   * Build parameterized SQL fragments for global patient filters.
   *
   * @param {object} filters - { measurementYear?, search? }
   * @param {Array} values - parameter array (mutated)
   * @param {string} [alias='p'] - table alias for patients
   * @returns {string} SQL AND-clause
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

  /**
   * 1. GET /api/dashboard/qa/stats
   * Returns KPI metrics for QA Dashboard (chart / patient level):
   * - Pending QA Review
   * - Reviewed Today (charts that reached a QA-passed stage today)
   * - Returned to Coder (charts currently in a returned stage)
   * - Approval Rate (passed charts vs all reviewed charts)
   */
  async getQAStats(db, schema, filters = {}) {
    // ------------------------------------------------------------------
    // Shared filter helper
    // ------------------------------------------------------------------
    const build = (values) => this._buildPatientFilters(filters, values, "p");

    // ------------------------------------------------------------------
    // 1. Pending QA Review
    // ------------------------------------------------------------------
    const pendingValues = [];
    const pendingFilterSql = build(pendingValues);

    const pendingQuery = `
      SELECT
        COUNT(*) AS total_pending,
        COUNT(*) FILTER (
          WHERE p.updated_at >= CURRENT_DATE
             OR p.created_at  >= CURRENT_DATE
        ) AS new_today
      FROM ${schema}.patients p
      WHERE (
            p.stage IN (
              'Pending QA',
              'Ready for QA Review',
              'QA Review',
              'QA Evidence Requested'
            )
         OR (p.qa_reviewed = FALSE
             AND p.stage NOT IN (
               'Completed',
               'QA Approved',
               'QA Passed',
               'Submission Ready',
               'Unassigned'
             ))
        )
        ${pendingFilterSql}
    `;

    // ------------------------------------------------------------------
    // 2. Reviewed Today  +  14-day average
    //    A chart is considered "reviewed" when it reaches a passed stage.
    // ------------------------------------------------------------------
    const reviewedValues = [];
    const reviewedFilterSql = build(reviewedValues);

    const reviewedTodayQuery = `
      SELECT COUNT(*) AS reviewed_today
      FROM ${schema}.patients p
      WHERE p.stage IN ('QA Passed', 'QA Approved', 'Completed', 'Submission Ready')
        AND p.updated_at >= CURRENT_DATE
        ${reviewedFilterSql}
    `;

    const avgReviewedValues = [];
    const avgReviewedFilterSql = build(avgReviewedValues);

    const avgReviewedQuery = `
      SELECT COALESCE(SUM(daily_count), 0) / 14.0 AS avg_daily
      FROM (
        SELECT COUNT(*) AS daily_count
        FROM ${schema}.patients p
        WHERE p.stage IN ('QA Passed', 'QA Approved', 'Completed', 'Submission Ready')
          AND p.updated_at >= CURRENT_DATE - INTERVAL '14 days'
          AND p.updated_at <  CURRENT_DATE
          ${avgReviewedFilterSql}
        GROUP BY (p.updated_at AT TIME ZONE 'UTC')::date
      ) sub
    `;

    // ------------------------------------------------------------------
    // 3. Returned to Coder
    // ------------------------------------------------------------------
    const returnedValues = [];
    const returnedFilterSql = build(returnedValues);

    const returnedQuery = `
  SELECT
    COUNT(*) AS total_returned
  FROM ${schema}.patients p
  WHERE p.stage IN (
      'QA Returned',
      'Returned',
      'QA Rejected',
      'Request Revision',
'Revision Required'
    )
    ${returnedFilterSql}
`;
    // ------------------------------------------------------------------
    // 4. Approval Rate (this week vs prior week)
    //    "Reviewed" = any chart that has left the pending-QA stages
    //    (i.e. now in a passed or returned stage).
    // ------------------------------------------------------------------
    const rateValues = [];
    const rateFilterSql = build(rateValues);

    const approvalRateQuery = `
      SELECT
        -- this week
        COUNT(*) FILTER (
          WHERE p.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
            AND p.stage IN (
              'QA Passed','QA Approved','Completed','Submission Ready',
              'QA Returned','Returned','QA Rejected','Request Revision','Revision Required'
            )
        ) AS total_this_wk,

        COUNT(*) FILTER (
          WHERE p.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
            AND p.stage IN ('QA Passed','QA Approved','Completed','Submission Ready')
        ) AS pass_this_wk,

        -- prior week
        COUNT(*) FILTER (
          WHERE p.updated_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
            AND p.updated_at <  DATE_TRUNC('week', CURRENT_DATE)
            AND p.stage IN (
              'QA Passed','QA Approved','Completed','Submission Ready',
              'QA Returned','Returned','QA Rejected','Request Revision','Revision Required'
            )
        ) AS total_last_wk,

        COUNT(*) FILTER (
          WHERE p.updated_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
            AND p.updated_at <  DATE_TRUNC('week', CURRENT_DATE)
            AND p.stage IN ('QA Passed','QA Approved','Completed','Submission Ready')
        ) AS pass_last_wk,

        -- all-time (for fallback)
        COUNT(*) FILTER (
          WHERE p.stage IN (
            'QA Passed','QA Approved','Completed','Submission Ready',
            'QA Returned','Returned','QA Rejected','Request Revision','Revision Required'
          )
        ) AS total_all,

        COUNT(*) FILTER (
          WHERE p.stage IN ('QA Passed','QA Approved','Completed','Submission Ready')
        ) AS pass_all
      FROM ${schema}.patients p
      WHERE 1=1
        ${rateFilterSql}
    `;

    // ------------------------------------------------------------------
    // Execute in parallel
    // ------------------------------------------------------------------
    const [pendingRes, reviewedTodayRes, avgReviewedRes, returnedRes, rateRes] =
      await Promise.all([
        db.query(pendingQuery, pendingValues),
        db.query(reviewedTodayQuery, reviewedValues),
        db.query(avgReviewedQuery, avgReviewedValues),
        db.query(returnedQuery, returnedValues),
        db.query(approvalRateQuery, rateValues),
      ]);

    // ------------------------------------------------------------------
    // Format results
    // ------------------------------------------------------------------
    const pendingTotal = parseInt(pendingRes.rows[0]?.total_pending || 0, 10);
    const newToday = parseInt(pendingRes.rows[0]?.new_today || 0, 10);

    const reviewedToday = parseInt(
      reviewedTodayRes.rows[0]?.reviewed_today || 0,
      10
    );
    const avgDailyReviewed = parseFloat(avgReviewedRes.rows[0]?.avg_daily || 0);

    let reviewedTrend = "+0% vs avg";
    let reviewedTrendType = "neutral";
    if (avgDailyReviewed > 0) {
      const changePct = Math.round(
        ((reviewedToday - avgDailyReviewed) / avgDailyReviewed) * 100
      );
      reviewedTrend = `${changePct >= 0 ? "+" : ""}${changePct}% vs avg`;
      reviewedTrendType =
        changePct > 0 ? "up" : changePct < 0 ? "down" : "neutral";
    }

    const returnedToday = parseInt(
      returnedRes.rows[0]?.returned_today || 0,
      10
    );
    const totalReturned = parseInt(
      returnedRes.rows[0]?.total_returned || 0,
      10
    );
    const rateRow = rateRes.rows[0] || {};
    const totalThisWk = parseInt(rateRow.total_this_wk || 0, 10);
    const passThisWk = parseInt(rateRow.pass_this_wk || 0, 10);
    const totalLastWk = parseInt(rateRow.total_last_wk || 0, 10);
    const passLastWk = parseInt(rateRow.pass_last_wk || 0, 10);
    const totalAll = parseInt(rateRow.total_all || 0, 10);
    const passAll = parseInt(rateRow.pass_all || 0, 10);

    const returnRatePct =
      totalAll > 0 ? Math.round((totalReturned / totalAll) * 100) : 0;

    const currentApprovalRate =
      totalThisWk > 0
        ? parseFloat(((passThisWk / totalThisWk) * 100).toFixed(1))
        : totalAll > 0
          ? parseFloat(((passAll / totalAll) * 100).toFixed(1))
          : 0;

    const priorApprovalRate =
      totalLastWk > 0 ? (passLastWk / totalLastWk) * 100 : null;

    let rateTrend = "0% this wk";
    let rateTrendType = "neutral";
    if (priorApprovalRate !== null) {
      const delta = parseFloat(
        (currentApprovalRate - priorApprovalRate).toFixed(1)
      );
      rateTrend = `${delta >= 0 ? "+" : ""}${delta}% this wk`;
      rateTrendType = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
    }

    return {
      pendingQAReview: {
        value: pendingTotal,
        subtext: "charts awaiting review",
        badge: `${newToday} new today`,
      },
      reviewedToday: {
        value: reviewedToday,
        subtext: "charts completed",
        trend: reviewedTrend,
        trendType: reviewedTrendType,
      },
      returnedToCoder: {
        value: totalReturned,
        subtext: "discrepancies found",
        trend: `~${returnRatePct}% return rate`,
        trendType: "down",
      },
      approvalRate: {
        value: currentApprovalRate,
        subtext: "charts passed QA",
        trend: rateTrend,
        trendType: rateTrendType,
      },
    };
  }

  /**
   * 2. GET /api/dashboard/qa/throughput
   * Returns daily review vs returned count for current week (Mon-Sun).
   * - reviewed  → charts where qa_reviewed = TRUE (QA action completed that day)
   * - returned  → charts that landed in a returned stage that day
   */
  async getQAThroughput(db, schema, filters = {}) {
    const values = [];
    const filterSql = this._buildPatientFilters(filters, values, "p");

    const query = `
      WITH date_range AS (
        SELECT (DATE_TRUNC('week', CURRENT_DATE) + (day_offset * INTERVAL '1 day'))::date AS date
        FROM generate_series(0, 6) AS day_offset
      )
      SELECT
        TO_CHAR(dr.date, 'Dy') AS day_name,
        TO_CHAR(dr.date, 'YYYY-MM-DD') AS formatted_date,
        COALESCE(qa.reviewed_count, 0) AS reviewed,
        COALESCE(qa.returned_count, 0) AS returned
      FROM date_range dr
      LEFT JOIN (
        SELECT
          (p.updated_at AT TIME ZONE 'UTC')::date AS day,

          -- any chart whose QA review was completed on that day
          COUNT(*) FILTER (WHERE p.qa_reviewed = TRUE) AS reviewed_count,

          -- charts that ended in a returned stage on that day
          COUNT(*) FILTER (
            WHERE p.stage IN (
              'QA Returned',
              'Returned',
              'QA Rejected',
              'Request Revision',
              'Revision Required'
            )
          ) AS returned_count
        FROM ${schema}.patients p
        WHERE p.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
          AND p.updated_at <  DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
          ${filterSql}
        GROUP BY (p.updated_at AT TIME ZONE 'UTC')::date
      ) qa ON dr.date = qa.day
      ORDER BY dr.date ASC;
    `;

    const result = await db.query(query, values);
    const rows = result.rows || [];

    return rows.map((row) => ({
      day: row.day_name,
      date: row.formatted_date,
      reviewed: parseInt(row.reviewed, 10),
      returned: parseInt(row.returned, 10),
    }));
  }

  /**
   * 3. GET /api/dashboard/qa/discrepancy-types
   * Calculates monthly QA discrepancy types breakdown, percentages, total, and top issue.
   */
  async getQADiscrepancyTypes(db, schema, filters = {}) {
    const values = [];
    const filterSql = this._buildPatientFilters(filters, values, "p");
    const patientJoin = filterSql
      ? `LEFT JOIN ${schema}.patients p ON he.patient_id = p.id`
      : "";

    const query = `
      WITH qa_failures AS (
        SELECT 
          qmd.id,
          qmd.reasons
        FROM ${schema}.hedis_qa_measure_decisions qmd
        LEFT JOIN ${schema}.hedis_evaluations he ON qmd.measure_id = he.id
        ${patientJoin}
        WHERE qmd.qa_status IN ('QA_FAIL', 'REQUEST_REVISION', 'QA_RETURNED', 'RETURNED', 'QA_REJECTED',   'Revision Required'
)
          ${filterSql}
      ),
      expanded_reasons AS (
        SELECT 
          id,
          reason_text,
          CASE 
            WHEN LOWER(reason_text) LIKE '%missing%' OR LOWER(reason_text) LIKE '%document%' THEN 'Missing Documentation'
            WHEN LOWER(reason_text) LIKE '%date%' OR LOWER(reason_text) LIKE '%period%' 
              OR LOWER(reason_text) LIKE '%lookback%' OR LOWER(reason_text) LIKE '%service%' 
              THEN 'Wrong Date / Period'
            WHEN LOWER(reason_text) LIKE '%cpt%' OR LOWER(reason_text) LIKE '%icd%' 
              OR LOWER(reason_text) LIKE '%code%' OR LOWER(reason_text) LIKE '%loinc%' 
              THEN 'Coding Error'
            WHEN LOWER(reason_text) LIKE '%eligible%' OR LOWER(reason_text) LIKE '%eligibility%' 
              OR LOWER(reason_text) LIKE '%member not%' 
              THEN 'Eligibility Issue'
            ELSE 'Other Discrepancy'
          END AS category
        FROM qa_failures qf
        CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(qf.reasons, '[]'::jsonb)) AS reason_text
      )
      SELECT 
        category,
        COUNT(DISTINCT id) AS count
      FROM expanded_reasons
      WHERE category IS NOT NULL
      GROUP BY category;
    `;

    const result = await db.query(query, values);
    const rows = result.rows || [];

    const expectedTypes = [
      { type: "Missing Documentation", fallbackCount: 12 },
      { type: "Wrong Date / Period", fallbackCount: 8 },
      { type: "Coding Error", fallbackCount: 6 },
      { type: "Eligibility Issue", fallbackCount: 4 },
    ];

    let countsMap = {};
    let totalCount = 0;

    rows.forEach((r) => {
      const cnt = parseInt(r.count, 10) || 0;
      countsMap[r.category] = cnt;
      totalCount += cnt;
    });

    // If no real database failures present, use demo proportions totaling 30
    const useFallback = totalCount === 0;
    if (useFallback) {
      totalCount = 30;
    }

    const items = expectedTypes.map((item) => {
      const count = useFallback
        ? item.fallbackCount
        : countsMap[item.type] || 0;
      const percentage =
        totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return {
        type: item.type,
        count,
        percentage,
      };
    });

    // Identify top discrepancy type
    const topItem = [...items].sort((a, b) => b.count - a.count)[0] || items[0];

    const topIssueMessage = `${topItem.type} is the leading discrepancy type — coordinate with abstractors on documentation standards.`;

    return {
      totalDiscrepancies: totalCount,
      timeframeLabel: "30 total this month",
      items,
      topIssue: {
        type: topItem.type,
        message: topIssueMessage,
      },
    };
  }

  /**
   * GET /dashboard/user-queue  (or /api/dashboard/qa/user-queue)
   *
   * Flat patient queue for the authenticated user.
   * One row per patient — NOT expanded by measure/evaluation.
   *
   * Extra fields vs original:
   *   - abstractorName  (from users via abstractor_id)
   *   - priority        (already present, kept explicit)
   *   - submittedAt     (when chart was last updated into a QA-related stage;
   *                     falls back to updated_at / created_at)
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
      "Revision Required": 50,
      Completed: 100,
      "QA Approved": 100,
      "QA Passed": 100,
      "Submission Ready": 100,
    };

    // $1 = userId; filters start at $2
    const filterValues = [userId];
    const filterSql = this._buildPatientFilters(filters, filterValues, "p");

    const limitIdx = filterValues.length + 1;
    const offsetIdx = filterValues.length + 2;
    const dataParams = [...filterValues, limit, offset];

    // ── Data query ────────────────────────────────────────────────────────────
    const dataQuery = `
        SELECT
          p.id            AS patient_uuid,
          p.patient_id    AS member_id,
          p.first_name,
          p.last_name,
          p.measure,
          p.stage,
          p.due_date,
          p.priority,
          p.updated_at,
          p.created_at,
          p.qa_reviewed,
          qm.qa_status,
  
          -- Abstractor name
        COALESCE(
  NULLIF(TRIM(ab.full_name), ''),
  ab.email,
  'Unassigned'
) AS abstractor_name,
  
          -- Best available "submitted to QA" timestamp
          -- Prefer updated_at when stage is already in a QA stage,
          -- otherwise fall back to created_at / updated_at
          CASE
            WHEN p.stage IN (
              'Pending QA',
              'Ready for QA Review',
              'QA Review',
              'QA Evidence Requested',
              'QA Returned',
              'QA Failed',
              'Revision Required',
              'Request Revision'
            ) THEN p.updated_at
            ELSE COALESCE(p.updated_at, p.created_at)
          END AS submitted_at
  
        FROM ${schema}.patients p
  
        LEFT JOIN ${schema}.users ab
          ON ab.id = p.abstractor_id
  
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
          "Revision Required",
          "Request Revision",
        ].includes(stage)
      ) {
        chartStatus = "In Progress";
      } else {
        chartStatus = "Not Started";
      }

      // ── Progress ──────────────────────────────────────────────────────────
      const progress =
        qaStatus === "QA_PASS" ? 100 : (STAGE_PROGRESS_MAP[stage] ?? 0);

      // ── Due date (YYYY-MM-DD or null) ─────────────────────────────────────
      const dueDate = row.due_date
        ? new Date(row.due_date).toISOString().split("T")[0]
        : null;

      // ── Submitted / assigned-to-QA timestamp ───────────────────────────────
      const submittedAt = row.submitted_at
        ? new Date(row.submitted_at).toISOString()
        : null;

      return {
        patientId: row.patient_uuid,
        memberId: row.member_id,
        firstName: row.first_name || "",
        lastName: row.last_name || "",
        measure: row.measure || null,
        stage,
        chartStatus,
        dueDate,
        priority: row.priority || null,
        progress,
        abstractorName: row.abstractor_name || "Unassigned",
        submittedAt, // when chart was submitted / last moved into QA stage
      };
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }
}

module.exports = new DashboardQAService();
