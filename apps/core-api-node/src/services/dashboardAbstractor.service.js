/**
 * DashboardAbstractorService
 * Provides KPI stats, abstraction velocity, and AI pre-analysis data
 */
class DashboardAbstractorService {
  /**
   * Build parameterized SQL AND-clause from global top filters.
   * Mutates `values` in-place and returns a SQL string.
   *
   * @param {object} filters         - { measurementYear?, search? }
   * @param {Array}  values          - existing parameter array (mutated)
   * @param {string} [alias='p']     - table alias for the patients table
   * @returns {string}
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

  // ─────────────────────────────────────────────────────────────────────────
  // 1. DASHBOARD STATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/dashboard/abstractor/stats
   *
   * Returns the 4 KPI cards shown on the Chart Abstractor Dashboard:
   *   - My Queue        → charts currently assigned and pending abstraction
   *   - Completed Today → charts completed by this abstractor today
   *   - QA Pending      → abstractor's charts currently awaiting QA review
   *   - My Accuracy     → QA pass rate for this abstractor's submitted charts
   *
   * @param {object} db
   * @param {string} schema
   * @param {object} filters   - global filters { measurementYear?, search? }
   * @param {string} userId    - authenticated abstractor's user id
   * @returns {Promise<object>}
   */
  async getAbstractorStats(db, schema, filters = {}, userId) {
    if (!userId) {
      return {
        myQueue: {
          value: 0,
          subtext: "charts assigned to me",
          badge: "0 new today",
        },
        completedToday: {
          value: 0,
          subtext: "abstractions finalized",
          trend: "+0% vs avg",
          trendType: "neutral",
        },
        qaPending: { value: 0, subtext: "awaiting QA review" },
        myAccuracy: {
          value: 0,
          subtext: "QA pass rate this month",
          trend: "0% this wk",
          trendType: "neutral",
        },
      };
    }

    const build = (baseValues) =>
      this._buildPatientFilters(filters, baseValues, "p");

    // ── 1. My Queue ────────────────────────────────────────────────────────
    // Charts assigned to this abstractor that have NOT been completed yet.
    const queueValues = [userId];
    const queueFilterSql = build(queueValues);

    const queueQuery = `
  SELECT
    COUNT(*) AS total_in_queue,
    COUNT(*) FILTER (
      WHERE p.created_at >= CURRENT_DATE
         OR p.updated_at >= CURRENT_DATE
    ) AS new_today
  FROM ${schema}.patients p
  WHERE p.abstractor_id = $1
    ${queueFilterSql}
`;

    // ── 2. Completed Today ─────────────────────────────────────────────────
    // Charts abstracted by this user whose stage moved to completed TODAY.
    const completedValues = [userId];
    const completedFilterSql = build(completedValues);

    const completedTodayQuery = `
      SELECT COUNT(*) AS completed_today
      FROM ${schema}.patients p
      WHERE p.abstractor_id = $1
        AND p.stage IN (
          'Completed', 'QA Approved', 'QA Passed',
          'Submission Ready', 'Pending QA', 'Ready for QA Review'
        )
        AND p.updated_at >= CURRENT_DATE
        ${completedFilterSql}
    `;

    // 14-day trailing average (for trend calculation)
    const avgValues = [userId];
    const avgFilterSql = build(avgValues);

    const avgCompletedQuery = `
      SELECT COALESCE(SUM(daily), 0) / 14.0 AS avg_daily
      FROM (
        SELECT COUNT(*) AS daily
        FROM ${schema}.patients p
        WHERE p.abstractor_id = $1
          AND p.stage IN (
            'Completed', 'QA Approved', 'QA Passed', 'Submission Ready',
            'Pending QA', 'Ready for QA Review'
          )
          AND p.updated_at >= CURRENT_DATE - INTERVAL '14 days'
          AND p.updated_at < CURRENT_DATE
          ${avgFilterSql}
        GROUP BY (p.updated_at AT TIME ZONE 'UTC')::date
      ) sub
    `;

    // ── 3. QA Pending ──────────────────────────────────────────────────────
    // This abstractor's charts currently stuck in QA-waiting stages.
    const qaPendingValues = [userId];
    const qaPendingFilterSql = build(qaPendingValues);
    const qaPendingQuery = `
  SELECT COUNT(*) AS qa_pending
  FROM ${schema}.patients p
  WHERE p.abstractor_id = $1
    AND (
      p.stage IN (
        'Pending QA',
        'Ready for QA Review',
        'QA Review',
        'QA Evidence Requested'
      )
      OR (
        p.qa_reviewed = FALSE
        AND p.stage NOT IN (
          'Completed',
          'QA Approved',
          'QA Passed',
          'Submission Ready',
          'Unassigned'
        )
      )
    )
    ${qaPendingFilterSql}
`;

    // ── 4. My Accuracy ─────────────────────────────────────────────────────
    // QA pass rate for charts abstracted by this user (via hedis_qa_measure_decisions).
    // "abstractor_id" on qa_measure_decisions links the submission to the abstractor.
    const accuracyValues = [userId];
    const accuracyFilterSql = build(accuracyValues);

    const accuracyQuery = `
      SELECT
        -- This week
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
        ) AS total_this_wk,
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
            AND qmd.qa_status = 'QA_PASS'
        ) AS pass_this_wk,

        -- Prior week
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
            AND qmd.updated_at <  DATE_TRUNC('week', CURRENT_DATE)
        ) AS total_last_wk,
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 week'
            AND qmd.updated_at <  DATE_TRUNC('week', CURRENT_DATE)
            AND qmd.qa_status = 'QA_PASS'
        ) AS pass_last_wk,

        -- This month (used in KPI card subtext)
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('month', CURRENT_DATE)
        ) AS total_month,
        COUNT(*) FILTER (
          WHERE qmd.updated_at >= DATE_TRUNC('month', CURRENT_DATE)
            AND qmd.qa_status = 'QA_PASS'
        ) AS pass_month

      FROM ${schema}.hedis_qa_measure_decisions qmd
      INNER JOIN ${schema}.patients p ON qmd.patient_id = p.id
      WHERE (qmd.abstractor_id = $1 OR qmd.assigned_abstractor_id = $1)
        ${accuracyFilterSql}
    `;

    // Execute in parallel
    const [queueRes, completedRes, avgRes, qaPendingRes, accuracyRes] =
      await Promise.all([
        db.query(queueQuery, queueValues),
        db.query(completedTodayQuery, completedValues),
        db.query(avgCompletedQuery, avgValues),
        db.query(qaPendingQuery, qaPendingValues),
        db.query(accuracyQuery, accuracyValues),
      ]);

    // ── Format results ─────────────────────────────────────────────────────
    const totalInQueue = parseInt(queueRes.rows[0]?.total_in_queue || 0, 10);
    const newToday = parseInt(queueRes.rows[0]?.new_today || 0, 10);

    const completedToday = parseInt(
      completedRes.rows[0]?.completed_today || 0,
      10
    );
    const avgDailyCompleted = parseFloat(avgRes.rows[0]?.avg_daily || 0);

    let completedTrend = "+0% vs avg";
    let completedTrendType = "neutral";
    if (avgDailyCompleted > 0) {
      const changePct = Math.round(
        ((completedToday - avgDailyCompleted) / avgDailyCompleted) * 100
      );
      completedTrend = `${changePct >= 0 ? "+" : ""}${changePct}% vs avg`;
      completedTrendType =
        changePct > 0 ? "up" : changePct < 0 ? "down" : "neutral";
    }

    const qaPending = parseInt(qaPendingRes.rows[0]?.qa_pending || 0, 10);

    const accRow = accuracyRes.rows[0] || {};
    const totalMonth = parseInt(accRow.total_month || 0, 10);
    const passMonth = parseInt(accRow.pass_month || 0, 10);
    const totalThisWk = parseInt(accRow.total_this_wk || 0, 10);
    const passThisWk = parseInt(accRow.pass_this_wk || 0, 10);
    const totalLastWk = parseInt(accRow.total_last_wk || 0, 10);
    const passLastWk = parseInt(accRow.pass_last_wk || 0, 10);

    const myAccuracyRate =
      totalMonth > 0
        ? parseFloat(((passMonth / totalMonth) * 100).toFixed(1))
        : 0;

    const rateThisWk =
      totalThisWk > 0 ? (passThisWk / totalThisWk) * 100 : null;
    const rateLastWk =
      totalLastWk > 0 ? (passLastWk / totalLastWk) * 100 : null;

    let accuracyTrend = "0% this wk";
    let accuracyTrendType = "neutral";
    if (rateThisWk !== null && rateLastWk !== null) {
      const delta = parseFloat((rateThisWk - rateLastWk).toFixed(1));
      accuracyTrend = `${delta >= 0 ? "+" : ""}${delta}% this wk`;
      accuracyTrendType = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
    }

    return {
      myQueue: {
        value: totalInQueue,
        subtext: "charts assigned to me",
        badge: `${newToday} new today`,
      },
      completedToday: {
        value: completedToday,
        subtext: "abstractions finalized",
        trend: completedTrend,
        trendType: completedTrendType,
      },
      qaPending: {
        value: qaPending,
        subtext: "awaiting QA review",
        badge: "from last wk",
      },
      myAccuracy: {
        value: myAccuracyRate,
        subtext: "QA pass rate this month",
        trend: accuracyTrend,
        trendType: accuracyTrendType,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ABSTRACTION VELOCITY (current week, per abstractor)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/dashboard/abstractor/velocity
   *
   * Returns daily "Charts Done" vs "AI-Assisted" counts for the current week
   * (Monday through today), scoped to the logged-in abstractor.
   *
   * AI-Assisted logic reuses the same approach as DashboardAnalyticsService:
   *   a chart is "AI-assisted" if a hedis_evaluations row exists for that
   *   patient on that day (meaning the AI pipeline ran for it).
   *
   * @param {object} db
   * @param {string} schema
   * @param {object} filters   - global filters
   * @param {string} userId    - authenticated abstractor's user id
   * @returns {Promise<Array>}
   */
  async getAbstractionVelocity(db, schema, filters = {}, userId) {
    if (!userId) return [];

    const values = [userId];
    const filterSql = this._buildPatientFilters(filters, values, "p");

    // We generate Mon-to-today for the current week. Using generate_series with
    // DATE_TRUNC('week', CURRENT_DATE) as start, CURRENT_DATE as end.
    const query = `
     WITH date_range AS (
  SELECT
    d::date AS day
  FROM generate_series(
    DATE_TRUNC('week', CURRENT_DATE)::date,
    DATE_TRUNC('week', CURRENT_DATE)::date + INTERVAL '6 days',
    INTERVAL '1 day'
  ) d
),

      -- Charts marked as done (moved to a completed or QA-ready stage) on each day
      charts_done AS (
        SELECT (p.updated_at AT TIME ZONE 'UTC')::date AS day, COUNT(*) AS done_count
        FROM ${schema}.patients p
        WHERE p.abstractor_id = $1
          AND p.stage IN (
            'Pending QA', 'Ready for QA Review', 'Completed',
            'QA Approved', 'QA Passed', 'Submission Ready'
          )
          AND p.updated_at >= DATE_TRUNC('week', CURRENT_DATE)
          AND p.updated_at <= CURRENT_TIMESTAMP
          ${filterSql}
        GROUP BY (p.updated_at AT TIME ZONE 'UTC')::date
      ),

      -- AI-assisted: patients with at least one hedis_evaluation (AI pipeline ran)
      -- updated/created within the same day range for this abstractor's patients.
      ai_assisted AS (
        SELECT (he.created_at AT TIME ZONE 'UTC')::date AS day, COUNT(DISTINCT he.patient_id) AS ai_count
        FROM ${schema}.hedis_evaluations he
        INNER JOIN ${schema}.patients p ON he.patient_id = p.id
        WHERE p.abstractor_id = $1
          AND he.created_at >= DATE_TRUNC('week', CURRENT_DATE)
          AND he.created_at <= CURRENT_TIMESTAMP
        GROUP BY (he.created_at AT TIME ZONE 'UTC')::date
      )

      SELECT
        TO_CHAR(dr.day, 'Dy') AS day_name,
        TO_CHAR(dr.day, 'YYYY-MM-DD') AS formatted_date,
        COALESCE(cd.done_count, 0) AS charts_done,
        COALESCE(ai.ai_count, 0) AS ai_assisted,
        dr.day = CURRENT_DATE AS is_today
      FROM date_range dr
      LEFT JOIN charts_done cd ON cd.day = dr.day
      LEFT JOIN ai_assisted ai ON ai.day = dr.day
      ORDER BY dr.day ASC;
    `;

    const result = await db.query(query, values);
    const rows = result.rows || [];

    return rows.map((row) => ({
      day: row.day_name, // Mon, Tue, …
      date: row.formatted_date, // 2026-07-21
      chartsDone: parseInt(row.charts_done, 10),
      aiAssisted: parseInt(row.ai_assisted, 10),
      isToday: row.is_today === true || row.is_today === "true",
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. AI PRE-ANALYSIS (high-confidence clinical findings)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/dashboard/abstractor/ai-findings
   *
   * Returns the top AI-detected clinical findings for charts assigned to this
   * abstractor, ordered by confidence (highest first).
   *
   * Data sources (mirrors existing AI evaluation + evidence patterns):
   *   - hedis_evaluations  → confidence, measure_code, patient_id
   *   - patients           → member_id (patient_id field), first/last name
   *   - hedis_measure_evidence + hedis_qa_review_analyses → detail text
   *   - clinical_timeline_events → AI-extracted evidence (source_type = 'AI')
   *
   * @param {object} db
   * @param {string} schema
   * @param {object} filters   - global filters
   * @param {string} userId    - authenticated abstractor
   * @param {number} [limit=10]
   * @returns {Promise<object>}
   */
  async getAIPreAnalysis(db, schema, filters = {}, userId, limit = 10) {
    if (!userId) return { findings: [], total: 0 };

    const values = [userId, limit];
    const filterSql = this._buildPatientFilters(filters, values, "p");

    // ── Primary source: hedis_evaluations (AI evaluated measures) ──────────
    // confidence column stores 0-1 float from the AI pipeline.
    // We surface findings with confidence >= 0.5, sorted desc.
    const evalQuery = `
      SELECT
        p.patient_id             AS member_id,
        p.first_name,
        p.last_name,
        he.measure_code,
        COALESCE(he.measure_name, he.measure_code) AS measure_name,
        he.confidence,
        he.reasoning             AS finding_summary,
        he.eligible,
        he.numerator,
        he.denominator,
        he.created_at            AS found_at
      FROM ${schema}.hedis_evaluations he
      INNER JOIN ${schema}.patients p ON he.patient_id = p.id
      WHERE p.abstractor_id = $1
        AND he.confidence IS NOT NULL
        AND he.confidence >= 0.5
        ${filterSql}
      ORDER BY he.confidence DESC
      LIMIT $2
    `;

    // ── Secondary source: clinical_timeline_events (AI source_type) ───────
    // ai_confidence / ai_confidence_score are available on this table.
    // We join patients to filter by abstractor and pull high-confidence events.
    const timelineQuery = `
      SELECT
        p.patient_id             AS member_id,
        p.first_name,
        p.last_name,
        cte.event_type           AS measure_code,
        cte.event_type           AS measure_name,
        COALESCE(
          cte.ai_confidence_score,
          cte.ai_confidence
        )                        AS confidence,
        COALESCE(
          cte.summary,
          cte.evidence,
          cte.source_text
        )                        AS finding_summary,
        cte.event_date           AS found_at
      FROM ${schema}.clinical_timeline_events cte
      INNER JOIN ${schema}.patients p ON cte.patient_id = p.id
      WHERE p.abstractor_id = $1
        AND cte.source_type = 'AI'
        AND COALESCE(cte.ai_confidence_score, cte.ai_confidence) IS NOT NULL
        AND COALESCE(cte.ai_confidence_score, cte.ai_confidence) >= 0.5
        ${filterSql}
      ORDER BY confidence DESC
      LIMIT $2
    `;

    // ── Execute in parallel ─────────────────────────────────────────────────
    const [evalResult, timelineResult] = await Promise.all([
      db.query(evalQuery, values),
      db.query(timelineQuery, values),
    ]);

    const evalRows = evalResult.rows || [];
    const timelineRows = timelineResult.rows || [];

    // Merge, de-dup by (member_id + measure_code), sort desc confidence, cap at limit
    const allRows = [...evalRows, ...timelineRows];
    const seen = new Set();
    const deduped = [];

    for (const row of allRows) {
      const key = `${row.member_id}::${row.measure_code}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(row);
      }
    }

    deduped.sort(
      (a, b) =>
        (parseFloat(b.confidence) || 0) - (parseFloat(a.confidence) || 0)
    );

    const topFindings = deduped.slice(0, limit);

    const findings = topFindings.map((row) => {
      const confidenceFloat = parseFloat(row.confidence) || 0;
      const confidencePct =
        confidenceFloat <= 1
          ? Math.round(confidenceFloat * 100)
          : Math.round(confidenceFloat);

      const measureCode = (row.measure_code || "").toUpperCase();
      const memberId = row.member_id || "";

      // Build a concise finding label like "CDC · MBR-789456"
      const label = `${measureCode} · ${memberId}`;

      // Truncate reasoning/summary to a single-line snippet ≤ 80 chars
      const rawSummary = row.finding_summary || "";
      const snippet =
        rawSummary.length > 80 ? rawSummary.substring(0, 77) + "…" : rawSummary;

      return {
        label,
        memberId,
        measureCode,
        measureName: row.measure_name || measureCode,
        confidencePct, // 96
        confidenceLabel: `${confidencePct}% conf.`,
        findingSummary: snippet,
        foundAt: row.found_at ? new Date(row.found_at).toISOString() : null,
      };
    });

    return {
      findings,
      total: findings.length,
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

module.exports = new DashboardAbstractorService();
