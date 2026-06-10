const { buildExtractionPrompt } = require("../prompts/generic.prompt");

const { callOllama } = require("./ollama.service");

async function extractTimelineEvents(chunks) {
  let allEvents = [];

  for (const chunk of chunks) {
    const prompt = buildExtractionPrompt(chunk);

    const events = await callOllama(prompt);

    allEvents.push(...events);
  }

  return allEvents; // timeline events for all pages of pdf (all chunks of text extracted from pdf)
}

module.exports = {
  extractTimelineEvents,
};
