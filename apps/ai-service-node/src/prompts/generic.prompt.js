function buildExtractionPrompt(text) {
  return `
  You are a clinical HEDIS extraction engine.
  
  Extract timeline events.
  
  Return ONLY JSON array.
  
  Fields:
  - measure
  - event_type
  - evidence
  - provider
  - event_date (should be in ISO format)
  - confidence
  
  Clinical Text:
  ${text}
  `;
}

module.exports = {
  buildExtractionPrompt,
};
