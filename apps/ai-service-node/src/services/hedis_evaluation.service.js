const pool = require("../config/db");
const ollama = require("../config/ollama");
const { buildBulkHEDISEvaluationPrompt } = require("../prompts/hedis_evaluation.prompt");

class HEDISEvaluationService {
  /**
   * Evaluate a list of measures against chart text using strictly sequential evaluation.
   */
  async evaluateMeasures(chartText, measures) {
    const allEvaluations = [];

    // Process STRICTLY one-by-one to avoid 429 Too Many Requests
    for (const measure of measures) {
      console.log(`Evaluating HEDIS measure: ${measure.measureCode}...`);

      try {
        const prompt = buildBulkHEDISEvaluationPrompt(chartText, [measure]);

        const response = await ollama.chat({
          model: "gemma4:31b-cloud",
          messages: [{ role: "user", content: prompt }],
          format: "json",
        });

        const raw = response.message.content
          .trim()
          .replace(/^```(?:json)?\n?/, "")
          .replace(/\n?```$/, "");

        const parsed = JSON.parse(raw);
        
        // Handle both wrapped evaluations array and flat object
        if (parsed.evaluations && Array.isArray(parsed.evaluations)) {
          allEvaluations.push(...parsed.evaluations);
        } else if (parsed.measureCode) {
          allEvaluations.push(parsed);
        }
      } catch (err) {
        console.error(`Error evaluating measure ${measure.measureCode}:`, err);
        allEvaluations.push({
            measureCode: measure.measureCode,
            measureName: measure.measureName,
            status: "Error",
            reason: "AI evaluation failed for this measure"
        });
      }
    }

    return allEvaluations;
  }

  /**
   * Save evaluation result to database.
   */
  async saveEvaluation(patientId, evalResult) {
    const query = `
      INSERT INTO hedis_evaluations (
        patient_id, measure_code, measure_name, eligible, 
        denominator, numerator, exclusion, status, 
        confidence, reasoning, evidence, detailed_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      patientId,
      evalResult.measureCode,
      evalResult.measureName,
      evalResult.eligible,
      evalResult.denominator,
      evalResult.numerator,
      evalResult.exclusion,
      evalResult.status,
      evalResult.confidence,
      evalResult.overallReason || evalResult.reason,
      JSON.stringify(evalResult.evidence_quotes || evalResult.evidence || []),
      JSON.stringify(evalResult),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all evaluations for a patient.
   */
  async getEvaluationsByPatient(patientId) {
    const query = `
      SELECT * FROM hedis_evaluations 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [patientId]);
    return result.rows;
  }
}

module.exports = new HEDISEvaluationService();
