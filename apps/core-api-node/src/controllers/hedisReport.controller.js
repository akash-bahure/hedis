const hedisReportService = require("../services/hedisReportr.service");

/**
 * GET /api/reports/measure-performance
 * Retrieves paginated and filtered HEDIS Measure Performance Report.
 */
exports.getMeasurePerformanceReport = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { page = 1, limit = 10, measureCode, measurementYear, plan } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'page'. Must be a positive integer.",
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'limit'. Must be between 1 and 100.",
      });
    }

    const reportData = await hedisReportService.getMeasurePerformanceReport(req.db, schema, {
      page: pageNum,
      limit: limitNum,
      measureCode: measureCode ? String(measureCode).trim() : undefined,
      measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
      plan: plan ? String(plan).trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      data: {
        items: reportData.items,
        pagination: reportData.pagination,
      },
    });
  } catch (err) {
    console.error("Get Measure Performance Report Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


/**
 * GET /api/hedis-reports/submission-readiness
 *
 * Returns paginated Submission Readiness report.
 */
exports.getSubmissionReadinessReport = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;

    const {
      page = 1,
      limit = 10,
      measureCode,
      measurementYear,
      plan,
    } = req.query;

    const report =
      await hedisReportService.getSubmissionReadinessReport(
        req.db,
        schema,
        {
          page,
          limit,
          measureCode: measureCode ? String(measureCode).trim() : undefined,
          measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
          plan: plan ? String(plan).trim() : undefined,
        }
      );

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/**
 * GET /api/hedis-reports/submission-readiness/export
 *
 * Export Submission Readiness Report as CSV.
 */
exports.exportSubmissionReadinessReport = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { measureCode, measurementYear, plan } = req.query;

    const rows =
      await hedisReportService.exportSubmissionReadinessReport(
        req.db,
        schema,
        {
          measureCode: measureCode ? String(measureCode).trim() : undefined,
          measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
          plan: plan ? String(plan).trim() : undefined,
        }
      );

    const headers = [
      "Measure Code",
      "Measure Name",
      "Total Evaluations",
      "Ready Count",
      "Readiness %",
      "Target %",
      "Difference %",
      "Status"
    ];

    const csvRows = rows.map((item) => [
      item.measureCode,
      `"${item.measureName}"`,
      item.totalEvaluations,
      item.readyCount,
      item.readiness,
      item.target,
      item.difference,
      item.aboveTarget ? "Above Target" : "Below Target"
    ].join(","));

    const csv = [
      headers.join(","),
      ...csvRows
    ].join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="submission-readiness-report.csv"'
    );

    return res.status(200).send(csv);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


/**
 * GET /api/hedis-reports/gap-closure-trend
 *
 * Returns the Gap Closure Trend report with monthly or weekly view.
 * Includes chart trend series and current-month summary cards.
 */
exports.getGapClosureTrend = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { view = "monthly", measureCode, measurementYear, plan } = req.query;

    const validViews = ["monthly", "weekly"];
    if (!validViews.includes(String(view).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameter 'view'. Must be 'monthly' or 'weekly'.",
      });
    }

    const reportData = await hedisReportService.getGapClosureTrend(req.db, schema, {
      view: String(view).toLowerCase(),
      measureCode: measureCode ? String(measureCode).trim() : undefined,
      measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
      plan: plan ? String(plan).trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (err) {
    console.error("Get Gap Closure Trend Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


/**
 * GET /api/hedis-reports/dashboard-stats
 *
 * Returns the overarching HEDIS Report Dashboard Statistics (KPI stats & deltas).
 */
exports.getDashboardStatistics = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { measurementYear, plan } = req.query;

    const stats = await hedisReportService.getDashboardStatistics(req.db, schema, {
      measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
      plan: plan ? String(plan).trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("Get Dashboard Statistics Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


/**
 * GET /api/hedis-reports/abstractor-productivity
 *
 * Returns Abstractor Productivity report with chart data and summary table.
 */
exports.getAbstractorProductivity = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { measurementYear, plan } = req.query;

    const reportData = await hedisReportService.getAbstractorProductivity(req.db, schema, {
      measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
      plan: plan ? String(plan).trim() : undefined,
    });

    return res.status(200).json({
      success: true,
      data: reportData,
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


/**
 * GET /api/hedis-reports/export
 *
 * Exports the complete filtered HEDIS Reports dashboard in CSV, PDF, or XLSX format.
 */
exports.exportDashboardReport = async (req, res) => {
  try {
    const schema = req.tenant.schema_name;
    const { format, measurementYear, plan, measureCode } = req.query;

    if (!format) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'format' is required.",
      });
    }

    const exportFormat = String(format).toLowerCase();
    if (!["csv", "pdf", "xlsx"].includes(exportFormat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid format. Supported formats are 'csv', 'pdf', and 'xlsx'.",
      });
    }

    const filters = {
      measurementYear: measurementYear ? String(measurementYear).trim() : undefined,
      plan: plan ? String(plan).trim() : undefined,
      measureCode: measureCode ? String(measureCode).trim() : undefined,
    };

    // Gather all dashboard sections data in parallel
    const [stats, performance, readiness, trend, productivity] = await Promise.all([
      hedisReportService.getDashboardStatistics(req.db, schema, {
        measurementYear: filters.measurementYear,
        plan: filters.plan,
      }),
      hedisReportService.getMeasurePerformanceReport(req.db, schema, {
        page: 1,
        limit: 999999, // retrieve all matches
        measureCode: filters.measureCode,
        measurementYear: filters.measurementYear,
        plan: filters.plan,
      }),
      hedisReportService.getSubmissionReadinessReport(req.db, schema, {
        page: 1,
        limit: 999999, // retrieve all matches
        measureCode: filters.measureCode,
        measurementYear: filters.measurementYear,
        plan: filters.plan,
      }),
      hedisReportService.getGapClosureTrend(req.db, schema, {
        view: "monthly",
        measureCode: filters.measureCode,
        measurementYear: filters.measurementYear,
        plan: filters.plan,
      }),
      hedisReportService.getAbstractorProductivity(req.db, schema, {
        measurementYear: filters.measurementYear,
        plan: filters.plan,
      }),
    ]);

    // Handle formats
    if (exportFormat === "csv") {
      let csv = "HEDIS REPORT DASHBOARD EXPORT\n";
      csv += `Filters: Year=${filters.measurementYear || "All"}, Plan=${filters.plan || "All"}, Measure=${filters.measureCode || "All"}\n`;
      csv += `Generated At: ${new Date().toISOString()}\n\n`;

      csv += "=== DASHBOARD STATISTICS ===\n";
      csv += "Metric,Value,Delta\n";
      csv += `Overall Gap Rate,${stats.overallGapRate.rate}%,${stats.overallGapRate.delta}%\n`;
      csv += `Numerator Compliance,${stats.numeratorCompliance.rate}%,${stats.numeratorCompliance.delta}%\n`;
      csv += `Charts Completed (%),${stats.chartsCompleted.percentage}%,N/A\n`;
      csv += `Charts Completed (Count),"${stats.chartsCompleted.completed} / ${stats.chartsCompleted.total}",N/A\n`;
      csv += `QA Disagreement Rate,${stats.qaDisagreementRate.rate}%,${stats.qaDisagreementRate.delta}%\n`;
      csv += `Submission Readiness,${stats.submissionReadiness.rate}%,${stats.submissionReadiness.delta}%\n\n`;

      csv += "=== MEASURE PERFORMANCE ===\n";
      csv += "Measure Code,Measure Name,Numerator Count,Denominator Count,Exclusion Count,Rate %,Benchmark %,Status\n";
      performance.items.forEach((item) => {
        csv += `${item.measureCode},"${item.measureName}",${item.numerator},${item.denominator},${item.exclusion},${item.measureRate},${item.benchmark},${item.belowBenchmark ? "Below Benchmark" : "At/Above Benchmark"}\n`;
      });
      csv += "\n";

      csv += "=== SUBMISSION READINESS ===\n";
      csv += "Measure Code,Measure Name,Total Evaluations,Ready Count,Readiness %,Target %,Difference %,Status\n";
      readiness.items.forEach((item) => {
        csv += `${item.measureCode},"${item.measureName}",${item.totalEvaluations},${item.readyCount},${item.readiness},${item.target},${item.difference},${item.aboveTarget ? "Above Target" : "Below Target"}\n`;
      });
      csv += "\n";

      csv += "=== GAP CLOSURE TREND ===\n";
      csv += "Period,Open Gaps,Closed Gaps\n";
      trend.trend.forEach((item) => {
        csv += `${item.label},${item.openGaps},${item.closedGaps}\n`;
      });
      csv += "\n";

      csv += "=== ABSTRACTOR PRODUCTIVITY ===\n";
      csv += "Abstractor Name,Assigned,Completed,Completed %,Avg Time,QA Fail %,At Risk\n";
      productivity.tableData.forEach((item) => {
        csv += `"${item.abstractorName}",${item.assigned},${item.completed},${item.completedPercentage},${item.avgTime},${item.qaFailPercentage},${item.atRisk ? "At Risk" : "Normal"}\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="hedis-reports-dashboard.csv"');
      return res.status(200).send(csv);
    }

    if (exportFormat === "pdf") {
      const PDFDocument = require("pdfkit-table");
      const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="hedis-reports-dashboard.pdf"');
        return res.status(200).send(pdfBuffer);
      });

      // Title header
      doc.fontSize(18).text("HEDIS Reports Dashboard Export", { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(10).text(`Filters: Year: ${filters.measurementYear || "All"} | Plan: ${filters.plan || "All"} | Measure: ${filters.measureCode || "All"}`, { align: "center" });
      doc.fontSize(10).text(`Generated At: ${new Date().toLocaleString()}`, { align: "center" });
      doc.moveDown(1.5);

      // Section 1: Dashboard Statistics
      doc.fontSize(13).text("1. Dashboard KPI Statistics", { underline: true });
      doc.moveDown(0.5);
      const statsTable = {
        headers: ["Metric", "Value", "Delta (%)"],
        rows: [
          ["Overall Gap Rate", `${stats.overallGapRate.rate}%`, `${stats.overallGapRate.delta}%`],
          ["Numerator Compliance", `${stats.numeratorCompliance.rate}%`, `${stats.numeratorCompliance.delta}%`],
          ["Charts Completed", `${stats.chartsCompleted.percentage}% (${stats.chartsCompleted.completed}/${stats.chartsCompleted.total})`, "N/A"],
          ["QA Disagreement Rate", `${stats.qaDisagreementRate.rate}%`, `${stats.qaDisagreementRate.delta}%`],
          ["Submission Readiness", `${stats.submissionReadiness.rate}%`, `${stats.submissionReadiness.delta}%`],
        ],
      };
      doc.table(statsTable, { width: 750 });
      doc.moveDown(1.5);

      // Section 2: Measure Performance
      doc.fontSize(13).text("2. Measure Performance", { underline: true });
      doc.moveDown(0.5);
      const perfTable = {
        headers: ["Code", "Name", "Numerator", "Denominator", "Exclusion", "Rate %", "Benchmark %", "Status"],
        rows: performance.items.map((item) => [
          item.measureCode,
          item.measureName,
          item.numerator.toString(),
          item.denominator.toString(),
          item.exclusion.toString(),
          `${item.measureRate}%`,
          `${item.benchmark}%`,
          item.belowBenchmark ? "Below" : "At/Above",
        ]),
      };
      doc.table(perfTable, { width: 750 });
      doc.moveDown(1.5);

      // Section 3: Submission Readiness
      doc.fontSize(13).text("3. Submission Readiness", { underline: true });
      doc.moveDown(0.5);
      const readinessTable = {
        headers: ["Code", "Name", "Evs count", "Ready count", "Readiness %", "Target %", "Diff %", "Status"],
        rows: readiness.items.map((item) => [
          item.measureCode,
          item.measureName,
          item.totalEvaluations.toString(),
          item.readyCount.toString(),
          `${item.readiness}%`,
          `${item.target}%`,
          `${item.difference}%`,
          item.aboveTarget ? "Ready" : "Below",
        ]),
      };
      doc.table(readinessTable, { width: 750 });
      doc.moveDown(1.5);

      // Section 4: Gap Closure Trend
      doc.fontSize(13).text("4. Gap Closure Trend (Monthly)", { underline: true });
      doc.moveDown(0.5);
      const trendTable = {
        headers: ["Period", "Open Gaps", "Closed Gaps"],
        rows: trend.trend.map((item) => [
          item.label,
          item.openGaps.toString(),
          item.closedGaps.toString(),
        ]),
      };
      doc.table(trendTable, { width: 400 });
      doc.moveDown(1.5);

      // Section 5: Abstractor Productivity
      doc.fontSize(13).text("5. Abstractor Productivity", { underline: true });
      doc.moveDown(0.5);
      const prodTable = {
        headers: ["Abstractor Name", "Assigned", "Completed", "Completed %", "Avg Time", "QA Fail %", "At Risk"],
        rows: productivity.tableData.map((item) => [
          item.abstractorName,
          item.assigned.toString(),
          item.completed.toString(),
          `${item.completedPercentage}%`,
          item.avgTime,
          `${item.qaFailPercentage}%`,
          item.atRisk ? "YES" : "No",
        ]),
      };
      doc.table(prodTable, { width: 750 });

      doc.end();
      return;
    }

    if (exportFormat === "xlsx") {
      const xml = generateExcelXml(stats, performance, readiness, trend, productivity, filters);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="hedis-reports-dashboard.xlsx"');
      return res.status(200).send(Buffer.from(xml, "utf-8"));
    }
  } catch (err) {
    console.error("Export Dashboard Report Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


/**
 * Helper to generate spreadsheet XML.
 */
function generateExcelXml(stats, performance, readiness, trend, productivity, filters) {
  const { measurementYear, plan, measureCode } = filters;
  const createdDate = new Date().toISOString();

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>HEDIS System</Author>
    <Created>${createdDate}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="16" ss:Bold="1" ss:Color="#1F4E79"/>
    </Style>
    <Style ss:ID="SectionHeader">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="13" ss:Bold="1" ss:Color="#1F4E79"/>
      <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="TableHeader">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#2F5597" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Label">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Bold="1"/>
    </Style>
  </Styles>
  `;

  // Worksheet 1: Dashboard Summary
  xml += `
  <Worksheet ss:Name="Dashboard Summary">
    <Table>
      <Row>
        <Cell ss:StyleID="Title"><Data ss:Type="String">HEDIS Dashboard Export</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="Label"><Data ss:Type="String">Measurement Year:</Data></Cell>
        <Cell><Data ss:Type="String">${measurementYear || "All"}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="Label"><Data ss:Type="String">Plan:</Data></Cell>
        <Cell><Data ss:Type="String">${plan || "All"}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="Label"><Data ss:Type="String">Measure Code:</Data></Cell>
        <Cell><Data ss:Type="String">${measureCode || "All"}</Data></Cell>
      </Row>
      <Row>
        <Cell ss:StyleID="Label"><Data ss:Type="String">Export Date:</Data></Cell>
        <Cell><Data ss:Type="String">${createdDate}</Data></Cell>
      </Row>
      <Row/>
      <Row>
        <Cell ss:StyleID="SectionHeader"><Data ss:Type="String">Dashboard KPI Statistics</Data></Cell>
        <Cell ss:StyleID="SectionHeader"/>
        <Cell ss:StyleID="SectionHeader"/>
      </Row>
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Metric</Data></Cell>
        <Cell><Data ss:Type="String">Value</Data></Cell>
        <Cell><Data ss:Type="String">Delta (%)</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Overall Gap Rate</Data></Cell>
        <Cell><Data ss:Type="String">${stats.overallGapRate.rate}%</Data></Cell>
        <Cell><Data ss:Type="String">${stats.overallGapRate.delta}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Numerator Compliance</Data></Cell>
        <Cell><Data ss:Type="String">${stats.numeratorCompliance.rate}%</Data></Cell>
        <Cell><Data ss:Type="String">${stats.numeratorCompliance.delta}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Charts Completed (%)</Data></Cell>
        <Cell><Data ss:Type="String">${stats.chartsCompleted.percentage}%</Data></Cell>
        <Cell><Data ss:Type="String">N/A</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Charts Completed (Count)</Data></Cell>
        <Cell><Data ss:Type="String">${stats.chartsCompleted.completed} / ${stats.chartsCompleted.total}</Data></Cell>
        <Cell><Data ss:Type="String">N/A</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">QA Disagreement Rate</Data></Cell>
        <Cell><Data ss:Type="String">${stats.qaDisagreementRate.rate}%</Data></Cell>
        <Cell><Data ss:Type="String">${stats.qaDisagreementRate.delta}%</Data></Cell>
      </Row>
      <Row>
        <Cell><Data ss:Type="String">Submission Readiness</Data></Cell>
        <Cell><Data ss:Type="String">${stats.submissionReadiness.rate}%</Data></Cell>
        <Cell><Data ss:Type="String">${stats.submissionReadiness.delta}%</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
  `;

  // Worksheet 2: Measure Performance
  xml += `
  <Worksheet ss:Name="Measure Performance">
    <Table>
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Measure Code</Data></Cell>
        <Cell><Data ss:Type="String">Measure Name</Data></Cell>
        <Cell><Data ss:Type="String">Numerator Count</Data></Cell>
        <Cell><Data ss:Type="String">Denominator Count</Data></Cell>
        <Cell><Data ss:Type="String">Exclusion Count</Data></Cell>
        <Cell><Data ss:Type="String">Rate %</Data></Cell>
        <Cell><Data ss:Type="String">Benchmark %</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>`;
  performance.items.forEach((item) => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${item.measureCode}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.measureName)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.numerator}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.denominator}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.exclusion}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.measureRate}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.benchmark}</Data></Cell>
        <Cell><Data ss:Type="String">${item.belowBenchmark ? "Below Benchmark" : "At/Above Benchmark"}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>
  `;

  // Worksheet 3: Submission Readiness
  xml += `
  <Worksheet ss:Name="Submission Readiness">
    <Table>
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Measure Code</Data></Cell>
        <Cell><Data ss:Type="String">Measure Name</Data></Cell>
        <Cell><Data ss:Type="String">Total Evaluations</Data></Cell>
        <Cell><Data ss:Type="String">Ready Count</Data></Cell>
        <Cell><Data ss:Type="String">Readiness %</Data></Cell>
        <Cell><Data ss:Type="String">Target %</Data></Cell>
        <Cell><Data ss:Type="String">Difference %</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>`;
  readiness.items.forEach((item) => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${item.measureCode}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.measureName)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.totalEvaluations}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.readyCount}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.readiness}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.target}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.difference}</Data></Cell>
        <Cell><Data ss:Type="String">${item.aboveTarget ? "Above Target" : "Below Target"}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>
  `;

  // Worksheet 4: Gap Closure Trend
  xml += `
  <Worksheet ss:Name="Gap Closure Trend">
    <Table>
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Period</Data></Cell>
        <Cell><Data ss:Type="String">Open Gaps</Data></Cell>
        <Cell><Data ss:Type="String">Closed Gaps</Data></Cell>
      </Row>`;
  trend.trend.forEach((item) => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${item.label}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.openGaps}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.closedGaps}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>
  `;

  // Worksheet 5: Abstractor Productivity
  xml += `
  <Worksheet ss:Name="Abstractor Productivity">
    <Table>
      <Row ss:StyleID="TableHeader">
        <Cell><Data ss:Type="String">Abstractor Name</Data></Cell>
        <Cell><Data ss:Type="String">Assigned</Data></Cell>
        <Cell><Data ss:Type="String">Completed</Data></Cell>
        <Cell><Data ss:Type="String">Completed %</Data></Cell>
        <Cell><Data ss:Type="String">Avg Time</Data></Cell>
        <Cell><Data ss:Type="String">QA Fail %</Data></Cell>
        <Cell><Data ss:Type="String">At Risk</Data></Cell>
      </Row>`;
  productivity.tableData.forEach((item) => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escapeXml(item.abstractorName)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.assigned}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.completed}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.completedPercentage}</Data></Cell>
        <Cell><Data ss:Type="String">${item.avgTime}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.qaFailPercentage}</Data></Cell>
        <Cell><Data ss:Type="String">${item.atRisk ? "At Risk" : "Normal"}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>
  `;

  xml += `</Workbook>`;
  return xml;
}

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
    }
  });
}