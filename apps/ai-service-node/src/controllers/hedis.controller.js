const { extractPdfText } = require("../services/pdf.service");
const hedisService = require("../services/hedis.service");
const hedisEvaluationService = require("../services/hedis_evaluation.service");

exports.analyzeChart = async (req, res) => {
  try {
    const { patient_id, tenant_subdomain = "default" } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No chart file uploaded." });
    }

    console.log(`Starting HEDIS analysis for Patient: ${patient_id}, Tenant: ${tenant_subdomain}`);

    // 1. Extract Text from PDF (OCR)
    const text = await extractPdfText(req.file.path);

    // 2. Extract Demographics and Conditions from Text
    const criteria = await hedisService.extractCriteria(text);
    console.log("Extracted Criteria:", criteria);

    // 3. Fetch Measure Library from Core API
    const allMeasures = await hedisService.fetchMeasures(tenant_subdomain);
    console.log(`Fetched ${allMeasures.length} measures from Core API`);

    // 4. Filter Measures
    const relevantMeasures = hedisService.filterMeasures(allMeasures, criteria);
    console.log(`Filtered down to ${relevantMeasures.length} relevant measures`);

    // 5. Evaluate Filtered Measures
    console.log("Starting measure evaluations...");
    const evaluations = await hedisEvaluationService.evaluateMeasures(text, relevantMeasures);
    
    res.json({
      patient_id,
      criteria,
      evaluations
    });
  } catch (err) {
    console.error("HEDIS Analysis Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
