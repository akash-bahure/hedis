/**
 * HEDIS QA Review Analysis Prompt - Matched to Figma UI
 * Evaluates abstractor evidence against medical chart and HEDIS measure rules.
 */
function buildQAReviewAnalysisPrompt(chartText, measureRules) {
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
2. **Extract from Chart**: Use relevant data points from the PATIENT MEDICAL CHART as the baseline for the "abstractorValue" (or "abstractorEntry") fields.
3. **Use Rules as Expected**: Use the specific criteria from the MEASURE LIBRARY RULES for the "sourceDocumentValue" (or "sourceDocument").
4. **Compare Chart vs Rules**: Evaluate whether the abstractor extraction complies with the Measure Library rules.
5. **Identify Gaps**: If a required rule is not met or evidence is missing from the chart, mark it as "FAIL" or "MISSING_IN_SOURCE" without assumptions.

Return **ONLY** a valid JSON object in the exact structure below. Do not include any explanations, markdown, or additional text outside the JSON.

{
 "extractedEvidence": [
{
"field": "Evidence field from the Measure Library (Procedure, Diagnosis, CPT Code, HCPCS Code, ICD-10 Code, Medication, Lab Result, Service Date, Provider Documentation, Imaging, Clinical Finding, etc.). DO NOT include demographic eligibility fields such as Age, Gender, Enrollment, Denominator or Exclusions.",
"abstractorValue": "Actual value extracted from the PATIENT MEDICAL CHART. If no evidence exists, return null.",
"sourceDocumentValue": "Expected evidence requirement from the Measure Library.",
"status": "MATCH | DISCREPANCY | MISSING_IN_SOURCE",
"reason": "Explain why the evidence matches or fails the Measure Library requirement.",
"highlightText": "Shortest unique phrase that exists verbatim in the chart (maximum 4 words). Never generate or paraphrase.",
"highlightWords": ["Tokenized words from highlightText"],
"pageNumber": 1
}
]

  "validationChecklist": {
    "eligibility": [
      {
        "rule": "Specific eligibility criterion from rules (Age, Gender, Enrollment, Denominator, Exclusions)",
        "status": "PASS" | "FAIL" | "WARN",
        "abstractorEntry": "Corresponding evidence found in chart",
        "sourceDocument": "Rule definition from library",
        "message": "Detail about compliance"
      }
    ],
    "evidence": [
      {
        "rule": "Numerator/Service requirement from library (Service Date, Lookback, Procedure Found)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Corresponding evidence found in chart",
        "sourceDocument": "Rule definition from library",
        "message": ""
      }
    ],
    "documentation": [
      {
        "rule": "Documentation requirement from library (Signature, Facility, Highlights, Source Type)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Evidence found in chart",
        "sourceDocument": "Requirement from library",
        "message": ""
      }
    ],
    "coding": [
      {
        "rule": "Coding requirement from library (CPT, HCPCS, ICD-10 codes)",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "Codes found in chart",
        "sourceDocument": "Coding rule from library",
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
- **Abstractor vs Rules**: "abstractorValue" and "abstractorEntry" must always contain data from the PATIENT CHART. "sourceDocumentValue" and "sourceDocument" must contain the rule/requirement from the Measure Library.
- **Strict Evidence**: Do not assume missing info. If evidence is not in the chart, it is a FAIL / MISSING_IN_SOURCE.
- **Highlight Anchors**: "highlightText" must be the shortest unique anchor found verbatim in the chart (at most 4 words, e.g. a date, a code, short phrase). "highlightWords" must be an array of each individual whitespace-separated token from "highlightText" (e.g. "01/01/1975" → ["01/01/1975"]; "PET/CT scan" → ["PET/CT", "scan"]). If no highlight is possible, set highlightText to null and highlightWords to [].
- **Detailed Excerpts**: Populate "allEvidence" with every piece of text relevant to the measure rules, including page numbers.
- **Calculations**: Ensure the summary counts match the checklist results.
- **JSON Format**: Return ONLY the JSON object.
`;
}

module.exports = { buildQAReviewAnalysisPrompt };
