const { extractPdfText } = require("../services/pdf.service");
const { chunkText } = require("../services/chunk.service");
const { extractTimelineEvents } = require("../services/extraction.service");

exports.uploadChart = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      console.error("[AI ERROR] No file uploaded or file path missing");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`[AI] PDF Received. File Path: ${req.file.path}`);
    console.log(`[AI] File Size: ${req.file.size} bytes`);

    // 1. PDF Extraction
    console.log("[Upload] Starting PDF extraction...");
    let text;
    try {
      text = await extractPdfText(req.file.path);
    } catch (err) {
      console.error("[Upload] PDF extraction failed:", err.message);
      throw new Error(`PDF extraction failed: ${err.message}`);
    }

    // 2. Chunk Processing
    console.log("[Upload] Chunking text...");
    let chunks;
    try {
      chunks = chunkText(text);
      console.log(`[Upload] Created ${chunks.length} text chunks`);
    } catch (err) {
      console.error("[Upload] Chunking failed:", err.message);
      throw new Error(`Chunking failed: ${err.message}`);
    }

    // 3. AI Extraction Response
    console.log("[Upload] Extracting timeline events from AI...");
    let events;
    try {
      events = await extractTimelineEvents(chunks);
      console.log(`[Upload] Extracted ${events.length} timeline events`);
    } catch (err) {
      console.error("[Upload] AI extraction failed:", err);
      throw new Error(`AI extraction failed: ${err}`);
    }

    // 4. Validate, Normalize, and Deduplicate
    console.log(`[AI] Timeline Events Created`);
    console.log(`[AI] Deduplication Started`);
    const normalizedEvents = [];
    const seenEvents = new Set();

    for (const event of events) {
      // Check hallucination: evidence text must exist in the raw PDF text
      const evidenceFound = event.evidence && text.includes(event.evidence);
      if (!evidenceFound) {
        console.warn(`[Upload] Filtered out hallucinated event (evidence not found in text):`, event);
        continue;
      }

      // Normalize date to ISO YYYY-MM-DD
      let normalizedDate = event.event_date;
      if (normalizedDate) {
        const d = new Date(normalizedDate);
        if (!isNaN(d.getTime())) {
          normalizedDate = d.toISOString().split("T")[0];
        }
      }

      // Deduplication based on measure, type, and date
      const uniqueKey = `${event.measure}|${event.event_type}|${normalizedDate}|${event.evidence}`;
      if (seenEvents.has(uniqueKey)) {
        continue;
      }
      seenEvents.add(uniqueKey);

      normalizedEvents.push({
        ...event,
        event_date: normalizedDate,
        evidence_found: true,
      });
    }

    console.log(`[AI] Final Event Count: ${normalizedEvents.length}`);
    console.log(`[AI] Sending Response To Core API`);

    res.json({
      extracted_text: text,
      events: normalizedEvents,
    });
  } catch (err) {
    console.error(`[AI ERROR]\nMessage: ${err.message}\nStack Trace: ${err.stack}\nChart ID: ${req.body.chart_id}\nPatient ID: ${req.body.patient_id}`);
    res.status(500).json({
      error: err.message,
    });
  }
};
