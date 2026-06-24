/**
 * HEDIS QA Review Analysis Prompt - Matched to Figma UI
 * Evaluates abstractor evidence against medical chart and HEDIS measure rules.
 */
function buildQAReviewAnalysisPrompt(
  chartText,
  measureRules
) {
  return `
You are an expert HEDIS Quality Assurance Auditor. Your role is to perform a fully dynamic, rule-based audit by comparing the patient's medical chart directly against the official HEDIS Measure Library rules.

---
PATIENT MEDICAL CHART (Extracted Text):
${chartText}

---
MEASURE LIBRARY RULES (Expected/Ground Truth):
${JSON.stringify(measureRules, null, 2)}

---
TASK:
1. **Identify Required Rules**: Parse the MEASURE LIBRARY RULES to identify all eligibility, evidence, documentation, and coding requirements.
2. **Treat Rules as "Expected"**: Use the specific criteria from the rules as the baseline for the "abstractorValue" (or "abstractorEntry") fields.
3. **Extract Chart Evidence**: Find all relevant data points in the PATIENT MEDICAL CHART to serve as the "sourceDocumentValue" (or "sourceDocument").
4. **Compare Rules vs Chart**: Evaluate whether the chart text complies with the Measure Library rules.
5. **Identify Gaps**: If a required rule is not met or evidence is missing from the chart, mark it as "FAIL" or "MISSING_IN_SOURCE" without assumptions.

Return **ONLY** a valid JSON object in the exact structure below. Do not include any explanations, markdown, or additional text outside the JSON.

{
  "extractedEvidence": [
    {
      "field": "Rule field from Measure Library (e.g. Age Requirement, Service Date Rule, CPT Requirement)",
      "abstractorValue": "Expected value/rule definition from Measure Library",
      "sourceDocumentValue": "Actual value found in the medical chart",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": "Specific rationale for the match or gap"
    }
  ],
  "validationChecklist": {
    "eligibility": [
      {
        "rule": "Specific eligibility criterion from rules (Age, Gender, Enrollment, Denominator, Exclusions)",
        "status": "PASS" | "FAIL" | "WARN",
        "abstractorEntry": "Rule definition from library",
        "sourceDocument": "Corresponding evidence found in chart",
        "message": "Detail about compliance"
      }
    ],
    "evidence": [
      {
        "rule": "Numerator/Service requirement from library (Service Date, Lookback, Procedure Found)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Rule definition from library",
        "sourceDocument": "Corresponding evidence found in chart",
        "message": ""
      }
    ],
    "documentation": [
      {
        "rule": "Documentation requirement from library (Signature, Facility, Highlights, Source Type)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Requirement from library",
        "sourceDocument": "Evidence found in chart",
        "message": ""
      }
    ],
    "coding": [
      {
        "rule": "Coding requirement from library (CPT, HCPCS, ICD-10 codes)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Coding rule from library",
        "sourceDocument": "Codes found in chart",
        "message": ""
      }
    ]
  },
  "summary": {
    "totalChecks": 0,
    "passed": 0,
    "warnings": 0,
    "failed": 0,
    "confidence": 0
  },
  "allEvidence": [
    {
      "content": "Full quote or specific excerpt from the chart",
      "pageNumber": 1,
      "relevance": "How this specific evidence supports or fails a measure rule"
    }
  ]
}

**CRITICAL INSTRUCTIONS:**
- **Fully Dynamic**: Do NOT use hardcoded criteria. Extract EVERY checklist item and evidence field directly from the provided MEASURE LIBRARY RULES.
- **Rules as Baseline**: "abstractorValue" and "abstractorEntry" must always contain the rule/requirement from the library.
- **Strict Evidence**: Do not assume missing info. If evidence is not in the chart, it is a FAIL / MISSING_IN_SOURCE.
- **Detailed Excerpts**: Populate "allEvidence" with every piece of text relevant to the measure rules, including page numbers.
- **Calculations**: Ensure the summary counts match the checklist results.
- **JSON Format**: Return ONLY the JSON object.
`;
}

module.exports = { buildQAReviewAnalysisPrompt };
