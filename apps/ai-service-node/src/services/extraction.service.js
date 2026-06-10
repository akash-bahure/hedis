// const { buildExtractionPrompt } = require("../prompts/generic.prompt");

// const { callOllama } = require("./ollama.service");

// async function extractTimelineEvents(chunks) {
//   let allEvents = [];

//   for (const chunk of chunks) {
//     const prompt = buildExtractionPrompt(chunk);

//     const events = await callOllama(prompt);

//     allEvents.push(...events);
//   }

//   return allEvents; // timeline events for all pages of pdf (all chunks of text extracted from pdf)
// }

// module.exports = {
//   extractTimelineEvents,
// };


const { buildExtractionPrompt } = require("../prompts/generic.prompt");
const { callOllama } = require("./ollama.service");
const { normalizeDate } = require("./date-normalizer.service");

function deduplicateEvents(events) {
  const seen = new Set();

  return events.filter((event) => {
    const key = [
      event.event_date,
      event.event_type,
      (event.evidence || "").trim().toLowerCase(),
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function extractTimelineEvents(chunks) {
  let allEvents = [];

  for (const chunk of chunks) {
    const prompt = buildExtractionPrompt(chunk);

    const events = await callOllama(prompt);

    const normalizedEvents = events.map((event) => ({
      ...event,

      // Normalize dates
      event_date: normalizeDate(event.event_date),

      // Cleanup strings
      evidence: event.evidence?.trim(),
      provider: event.provider?.trim() || null,
      measure: event.measure?.trim() || null,
      event_type: event.event_type?.trim(),
    }));

    allEvents.push(...normalizedEvents);
  }

  // Remove duplicate events across all chunks
  const uniqueEvents = deduplicateEvents(allEvents);

  // Sort timeline chronologically
  uniqueEvents.sort(
    (a, b) =>
      new Date(a.event_date || "1900-01-01") -
      new Date(b.event_date || "1900-01-01")
  );

  return uniqueEvents;
}

module.exports = {
  extractTimelineEvents,
};