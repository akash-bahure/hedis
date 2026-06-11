/**
 * Prompt to extract patient demographics and medical conditions from clinical text for HEDIS filtering.
 */
function buildHEDISCriteriaPrompt(text) {
  return `
You are a medical data extraction engine specialized in HEDIS (Healthcare Effectiveness Data and Information Set) measure criteria.

Analyze the following clinical chart text and extract:
1. Patient's Age (numeric value if found, otherwise null)
2. Patient's Gender (Male/Female/Other/null)
3. Medical Conditions (a list of diagnosed conditions, e.g., "Diabetes", "Hypertension", "Fracture", "Asthma", etc.)

Return ONLY a JSON object with the following structure:
{
  "age": number | null,
  "gender": "Male" | "Female" | "Other" | null,
  "conditions": string[]
}

Clinical Text:
${text}
  `;
}

module.exports = {
  buildHEDISCriteriaPrompt,
};
