const { extractPdfText } = require("../services/pdf.service");
const hedisService = require("../services/hedis.service");
const hedisEvaluationService = require("../services/hedis_evaluation.service");
const { buildQAReviewAnalysisPrompt } = require("../prompts/qa_review.prompt");

exports.analyzeChart = async (req, res) => {
  try {
    const { patient_id, tenant_subdomain = "default", pdfPath } = req.body;

    if (!req.file && !pdfPath) {
      return res.status(400).json({ error: "No chart file uploaded or pdfPath provided." });
    }

    const chartPath = pdfPath || req.file.path;

    console.log(`Starting HEDIS analysis for Patient: ${patient_id}, Tenant: ${tenant_subdomain}, Path: ${chartPath}`);

    // 1. Extract Text from PDF (OCR)
    const text = await extractPdfText(chartPath);

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

/**
 * POST /api/hedis/analyze-single
 * Evaluate a single pre-selected measure against a patient chart.
 * Skips criteria extraction and measure filtering — used by the Add Measure flow.
 */
exports.analyzeSingleMeasure = async (req, res) => {
  try {
    const { patient_id, pdfPath, measure } = req.body;

    if (!patient_id || !pdfPath || !measure) {
      return res.status(400).json({
        error: "patient_id, pdfPath, and measure are required.",
      });
    }

    console.log(
      `Starting single-measure HEDIS analysis for Patient: ${patient_id}, Measure: ${measure.measureCode}`
    );

    // 1. Extract chart text from PDF
    const text = await extractPdfText(pdfPath);

    // 2. Evaluate the single measure directly — no filtering needed
    const evaluations = await hedisEvaluationService.evaluateMeasures(text, [measure]);

    res.json({
      patient_id,
      evaluations,
    });
  } catch (err) {
    console.error("Analyze Single Measure Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.qaReviewAnalysis = async (req, res) => {
  try {
    const { patientId, measureCode, pdfPath, measureRules, manualEvidence } = req.body;

    console.log(`Starting QA Review Analysis for Patient: ${patientId}, Measure: ${measureCode}`);

    // 1. Extract Text from PDF
    console.log(`Extracting text from: ${pdfPath}`);
    const text = await extractPdfText(pdfPath);
    console.log(`Extraction complete. Text length: ${text.length}`);

    // 2. Build Prompt
    const prompt = buildQAReviewAnalysisPrompt(text, measureRules, manualEvidence);

    // 3. Call LLM
    console.log("Submitting LLM job for QA Review Analysis...");
    const { executeOllamaJob } = require("../queues/ollama.queue");
    const response = await executeOllamaJob("qa-review", {
      model: "gemma4:31b-cloud",
      messages: [{ role: "user", content: prompt }],
      format: "json",
    });
    console.log("LLM response received from queue.");

    let raw = response.message.content.trim();
    
    // Robust JSON extraction
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.substring(firstBrace, lastBrace + 1);
    }

    const validationResult = JSON.parse(raw);

    res.json(validationResult);

  } catch (err) {
    console.error("QA Review Analysis Error:", err);
    res.status(500).json({ error: err.message });
  }
};
