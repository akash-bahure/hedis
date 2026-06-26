const { extractPdfText } = require("../services/pdf.service");
const clinicalTimelineService = require("../services/clinicalTimeline.service");

/**
 * Controller for Clinical Timeline logic.
 */
exports.extractTimeline = async (req, res) => {
  try {
    const { patient_id, pdfPath } = req.body;

    if (!req.file && !pdfPath) {
      return res.status(400).json({ error: "No chart file uploaded or pdfPath provided." });
    }

    const chartPath = pdfPath || req.file.path;

    console.log(`Starting Clinical Timeline extraction for Patient: ${patient_id}, Path: ${chartPath}`);

    // 1. Extract Text from PDF (OCR)
    const text = await extractPdfText(chartPath);

    // 2. Extract Timeline Events using LLM
    const timeline = await clinicalTimelineService.extractTimelineEvents(text);

    console.log(`Extracted ${timeline.length} timeline events.`);

    res.json({
      patient_id,
      timeline
    });
  } catch (err) {
    console.error("Clinical Timeline Extraction Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
