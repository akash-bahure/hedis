/**
 * Prompt to extract a comprehensive clinical timeline from patient charts.
 */
function buildClinicalTimelinePrompt(text) {
  return `
You are a highly advanced medical data extraction engine. Your goal is to analyze the provided clinical chart text and extract EVERY clinically relevant event to create a longitudinal patient record (Clinical Timeline).

### Extraction Instructions:
1.  **Identify Events**: Extract every encounter, lab result, vital check, medication renewal, procedure, and assessment.
2.  **Date Handling**: Precisely extract the event date. If a specific day is missing, use the month and year.
3.  **No Hallucinations**: Only extract information explicitly stated in the text.
4.  **Chronological Order**: Ensure events are returned in chronological order (newest to oldest).
5.  **Summarize**: Provide a concise title and a short summary for each event.
6.  **Structured Data**: Extract relevant fields like ICD codes, CPT codes, medication names/dosages, vitals values, etc., into a structured format.
7. **Measures / Vitals**: Pay special attention to **vitals, measurements, and clinical history** (BP, BMI, HbA1c, weight, etc.). Extract them under \`extracted_fields.vitals\` and also as a top-level \`measures\` array for easy HEDIS / quality reporting use.

### Expected JSON Structure:
Return ONLY a JSON array of event objects:
[
  {
    "event_title": "string (e.g., 'Annual Wellness Visit', 'HbA1c Lab Result')",
    "event_date": "ISO-8601 Date String",
    "year": number,
    "month": "string (Full month name)",
    "event_type": "string (e.g., 'Lab Result', 'Visit', 'Medication', 'Vitals', 'Imaging', 'Procedure')",
    "encounter_type": "string (e.g., 'Office Visit', 'Telehealth', 'Inpatient', 'Emergency')",
    "provider": "string (Name and Title)",
    "organization": "string (Facility/Practice name)",
    "specialty": "string (Provider specialty)",
    "document_type": "string (e.g., 'Progress Note', 'Lab Report')",
    "summary": "string (Concise description of the event)",
    "measures": [                     // ← NEW: Top-level array for quick access in UI/DB
      {
        "type": "string",             // e.g., "BP", "BMI", "HbA1c", "Weight"
        "value": "string",            // e.g., "138/88", "28.4", "7.2"
        "unit": "string",             // e.g., "mmHg", "kg/m²", "%"
        "flag": "string"              // e.g., "Borderline", "High", null
      }
    ],
    "extracted_fields": {
      "diagnoses": [{"code": "string", "description": "string"}],
      "cpt_codes": ["string"],
      "medications": [{"name": "string", "dosage": "string", "frequency": "string"}],
      "vitals": [{"type": "string", "value": "string", "unit": "string"}],
      "lab_results": [{"test": "string", "value": "string", "unit": "string", "flag": "string"}],
      "procedures": ["string"],
      "imaging": [{"study": "string", "finding": "string"}]
    },
    "evidence": "string (Exact quote from the text justifying this event)",
    "confidence": number (0.0 to 1.0)
  }
]

### Clinical Chart Text:
${text}
`;
}

module.exports = {
  buildClinicalTimelinePrompt,
};
