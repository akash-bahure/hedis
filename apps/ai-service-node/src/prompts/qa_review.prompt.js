/**
 * HEDIS QA Review Analysis Prompt - Matched to Figma UI
 * Evaluates abstractor evidence against medical chart and HEDIS measure rules.
 */
function buildQAReviewAnalysisPrompt(
  chartText,
  measureRules,
  abstractorEvidence
) {
  return `
You are an expert HEDIS Quality Assurance Auditor. Your role is to critically validate the abstractor's submitted evidence against the patient's actual medical chart and the official HEDIS measure specifications.

---
PATIENT MEDICAL CHART (Extracted Text):
${chartText}

---
MEASURE RULES:
${JSON.stringify(measureRules, null, 2)}

---
ABSTRACTOR SUBMITTED EVIDENCE:
${JSON.stringify(abstractorEvidence, null, 2)}

---
TASK:
Thoroughly analyze the chart for all relevant evidence. Then return **ONLY** a valid JSON object in the exact structure below. Do not include any explanations, markdown, or additional text outside the JSON.

{
  "extractedEvidence": [
    {
      "field": "Service Date",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "Screening Type",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "CPT Code",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "ICD-10 Diagnosis",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "BI-RADS Result",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "Ordering Physician",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "Facility",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    },
    {
      "field": "Report Status",
      "abstractorValue": "",
      "sourceDocumentValue": "",
      "status": "MATCH" | "DISCREPANCY" | "MISSING_IN_SOURCE",
      "reason": ""
    }
  ],
  "validationChecklist": {
    "eligibility": [
      {
        "rule": "Age Criteria",
        "status": "PASS" | "FAIL" | "WARN",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Continuous Enrollment Verified",
        "status": "PASS" | "FAIL" | "WARN",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      }
    ],
    "evidence": [
      {
        "rule": "Mammography Screening Found in Chart",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Service Date Valid in Lookback Period",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Lookback Period Met",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Bilateral Notation Present",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      }
    ],
    "documentation": [
      {
        "rule": "Source Document Uploaded",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Abstractor Entry Matches Source",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Highlight / Annotation Present",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Provider Signature & Credentials",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      }
    ],
    "coding": [
      {
        "rule": "CPT 77067 - Bilateral Screening Mammography",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "ICD-10 Z12.31 - Screening Diagnosis",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      },
      {
        "rule": "Rendering Provider NPI Documented",
        "status": "PASS" | "FAIL",
        "abstractorEntry": "",
        "sourceDocument": "",
        "message": ""
      }
    ]
  },
  "summary": {
    "totalChecks": 0,
    "passed": 0,
    "warnings": 0,
    "failed": 0,
    "confidence": 85
  }
}

**CRITICAL INSTRUCTIONS:**
- Base every comparison strictly on the PATIENT MEDICAL CHART provided.
- Be precise, objective, and critical. Do not assume or infer missing information.
- Fill **all** "abstractorEntry", "sourceDocument", "message", and "reason" fields with specific details.
- Calculate summary counts accurately based on the checklist results.
- Return **ONLY** the JSON object. No other text.
`;
}

module.exports = { buildQAReviewAnalysisPrompt };
