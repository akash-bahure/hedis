// function buildExtractionPrompt(text) {
//   return `
//   You are a clinical HEDIS extraction engine.
  
//   Extract timeline events.
  
//   Return ONLY JSON array.
  
//   Fields:
//   - measure
//   - event_type
//   - evidence
//   - provider
//   - event_date (should be in ISO format)
//   - confidence
  
//   Clinical Text:
//   ${text}
//   `;
// }

// module.exports = {
//   buildExtractionPrompt,
// };


function buildExtractionPrompt(text) {
  return `
You are a clinical evidence extraction engine.

Your job is to extract factual timeline events directly from the medical chart.

IMPORTANT RULES:

1. Extract ONLY information explicitly present in the chart.
2. DO NOT invent measures, diagnoses, providers, dates, medications, or categories.
3. DO NOT create categories such as:
   - Medication Management
   - Cancer Screening/Monitoring
   - Laboratory Monitoring
   - Multiple Myeloma Monitoring
   unless those exact words appear in the chart.
4. Use the exact evidence text from the chart.
5. Every event must be traceable to source text.
6. If provider is not explicitly mentioned, return null.
7. Convert dates to ISO format (YYYY-MM-DD).
8. If only month/year is available:
   - 9/06 -> 2006-09-01
   - 8/09 -> 2009-08-01
   - 02.2017 -> 2017-02-01
9. Do not guess missing dates.
10. Do not create duplicate events.

Return ONLY a JSON array.

Schema:

[
  {
    "measure": null,
    "event_type": "Diagnosis | Treatment | Procedure | Encounter | Imaging | Lab | Medication | Surgery | Follow Up",
    "evidence": "Exact text from chart",
    "provider": "Provider name or null",
    "event_date": "YYYY-MM-DD",
    "confidence": 0.0-1.0
  }
]

Clinical Text:

${text}
`;
}

module.exports = {
  buildExtractionPrompt,
};              