/**
 * Bulk HEDIS Evaluation Prompt.
 * Evaluates multiple measures in a single AI call.
 */
function buildBulkHEDISEvaluationPrompt(chartText, measures) {
  const measureRulesSummary = measures.map((m) => ({
    measureCode: m.measureCode,
    measureName: m.measureName,
    eligibility: m.eligibility,
    denominator: m.denominator,
    numerator: m.numerator,
    exclusions: m.exclusions,
  }));

  return `
You are a HEDIS Compliance Auditor. Your task is to evaluate the provided patient medical chart against a specific HEDIS measure.

Patient Chart Text:
${chartText}

Measure to Evaluate:
${JSON.stringify(measureRulesSummary, null, 2)}

Instructions:
1. Review the patient chart for demographics (age, gender), diagnoses, and services performed.
2. Evaluate Eligibility: Check if the patient meets the age and gender criteria. If not, the status is "Not Eligible".
3. Evaluate Denominator: Check if the patient has the required diagnoses or conditions.
4. Evaluate Numerator: Check for evidence of the required service (e.g., tests, screenings) within the valid measurement window.
5. Identify Exclusions: Check for any conditions that exclude the patient from the measure.
6. Determine Status:
   - "Complete": Numerator criteria met.
   - "Gap": Patient is eligible but numerator criteria are NOT met and the window for service is still open or has passed without compliance.
   - "Pending": Evidence found but needs confirmation or is slightly outside the primary window.
   - "Not Eligible": Patient does not meet base eligibility criteria (age/gender).
7. Extract Evidence: Provide specific quotes from the chart for every finding.

Return ONLY a valid JSON object. Do not include any preamble, explanation, or markdown code fences. The response must start with '{' and end with '}'.

{
  "measureCode": "string",
  "measureName": "string",
  "status": "Complete" | "Pending" | "Gap" | "Not Eligible",
  "eligible": boolean,
  "denominator": boolean,
  "numerator": boolean,
  "exclusion": boolean,
  "overallReason": "Brief summary of the evaluation result",
  "eligibility_details": [
    { "label": "e.g., Age 18-75", "status": "Pass" | "Fail", "detail": "e.g., Age 58 — qualifies" },
    { "label": "e.g., Diabetes Diagnosis", "status": "Pass" | "Fail", "detail": "e.g., Type 2 DM — E11.9" }
  ],
  "numerator_details": [
    { 
      "label": "e.g., HbA1c Test Performed", 
      "status": "Pass" | "Warning" | "Fail", 
      "detail": "e.g., CPT 83036 — Jan 18, 2026", 
      "date": "YYYY-MM-DD", 
      "code": "string", 
      "value": "string" 
    }
  ],
  "denominator_details": [
    { "label": "string", "status": "Pass" | "Fail", "detail": "string" }
  ],
  "exclusion_details": [
    { "label": "string", "status": "Pass" | "Fail", "detail": "string" }
  ],
  "missing_evidence": [
    { "severity": "critical" | "warning", "message": "High-level description of what is missing or concerning" }
  ],
  "recommendations": ["Actionable steps for the provider or abstractor"],
  "evidence_quotes": ["Direct quotes from the chart"],
  "confidence": number (0-1)
}
  `;
}

module.exports = {
  buildBulkHEDISEvaluationPrompt,
};
