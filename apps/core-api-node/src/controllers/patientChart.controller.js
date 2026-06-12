const { forwardChartToAiService, fetchTimelineFromAiService } = require("../services/aiIntegration.service");

/**
 * Upload chart and forward to AI service
 */
exports.uploadChart = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Forward to AI service
    const aiResponse = await forwardChartToAiService(patientId, req.file);

    // Clean up local uploaded file
    const fs = require("fs");
    fs.unlinkSync(req.file.path);

    return res.json({
      message: "Chart uploaded and processed successfully",
      data: aiResponse,
    });
  } catch (err) {
    console.error("Upload Chart Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process chart upload",
    });
  }
};

/**
 * Get timeline evidence from AI service
 */
exports.getTimelineEvidence = async (req, res) => {
  try {
    const { patientId } = req.params;

    const timelineData = await fetchTimelineFromAiService(patientId);

    return res.json({
      message: "Timeline evidence fetched successfully",
      data: timelineData,
    });
  } catch (err) {
    console.error("Get Timeline Evidence Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch timeline evidence",
    });
  }
};
