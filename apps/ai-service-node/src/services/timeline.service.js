const pool = require("../config/db");

async function saveTimelineEvents(patientId, events) {
  for (const event of events) {
    await pool.query(
      `
      INSERT INTO timeline_events
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
}

module.exports = {
  saveTimelineEvents,
};
