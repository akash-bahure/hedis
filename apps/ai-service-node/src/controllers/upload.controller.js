const { extractPdfText } = require("../services/pdf.service");

const { chunkText } = require("../services/chunk.service");

const { extractTimelineEvents } = require("../services/extraction.service");

const { saveTimelineEvents } = require("../services/timeline.service");

exports.uploadChart = async (req, res) => {
  try {
    const { patient_id } = req.body;

    const text = await extractPdfText(req.file.path);

    const chunks = chunkText(text);

    console.log("Extracted Text:", text);
    console.log("Text Chunks:", chunks);

    const events = await extractTimelineEvents(chunks); // returns all events for all chunks of text extracted from pdf

    await saveTimelineEvents(patient_id, events);

    res.json({
      events,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
