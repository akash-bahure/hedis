const { forwardChartToAiService } = require("../services/aiIntegration.service");

/**
 * Upload chart and forward to AI service
 */
exports.uploadChart = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`[Upload API] Forwarding PDF to AI Service for patient ${patientId}`);
    // Forward to AI service
    const aiResponse = await forwardChartToAiService(patientId, req.file);

    // Clean up local uploaded file
    const fs = require("fs");
    fs.unlinkSync(req.file.path);

    console.log(`[Upload API] Received ${aiResponse.events?.length || 0} events from AI Service. Saving to DB...`);

    // Save events to local database
    if (aiResponse.events && aiResponse.events.length > 0) {
      for (const event of aiResponse.events) {
        await req.db.query(
          `
          INSERT INTO ${schema}.timeline_events
          (
            patient_id,
            measure,
            event_type,
            evidence,
            provider,
            event_date,
            confidence,
            source_text
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8
          )
          `,
          [
            patientId,
            event.measure,
            event.event_type,
            event.evidence,
            event.provider,
            event.event_date,
            event.confidence,
            JSON.stringify(event),
          ]
        );
      }
      console.log(`[Upload API] Successfully saved events for patient ${patientId}`);
    }

    return res.json({
      message: "Chart uploaded and processed successfully",
      data: aiResponse,
    });
  } catch (err) {
    console.error("[Upload API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process chart upload",
    });
  }
};

/**
 * Get timeline evidence
 */
exports.getTimelineEvidence = async (req, res) => {
  try {
    const { patientId } = req.params;
    const schema = req.tenant.schema_name;

    console.log(`[Timeline API] Fetching events for patient ${patientId}`);

    const result = await req.db.query(
      `
      SELECT *
      FROM ${schema}.timeline_events
      WHERE patient_id = $1
      ORDER BY event_date DESC
      `,
      [patientId]
    );

    console.log(`[Timeline API] Found ${result.rows.length} events for patient ${patientId}`);

    return res.json({
      message: "Timeline evidence fetched successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error("[Timeline API] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch timeline evidence",
    });
  }
};
