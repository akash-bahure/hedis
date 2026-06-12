const pool = require("../config/db");
const axios = require("axios");

class HEDISService {
  /**
   * Orchestrate HEDIS evaluation by calling AI service and persisting results.
   */
  async evaluatePatientChart(patientId, file, tenantSubdomain, db) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const url = `${aiServiceUrl}/api/hedis/analyze`;

    console.log(`Forwarding chart for patient ${patientId} to AI Service: ${url}`);

    const FormData = require("form-data");
    const fs = require("fs");
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("patient_id", patientId);
    formData.append("tenant_subdomain", tenantSubdomain);

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    const { evaluations } = response.data;
    const savedEvaluations = [];

    // Save each evaluation to the tenant-specific schema
    for (const evalResult of evaluations) {
      const saved = await this.saveEvaluation(db, patientId, evalResult);
      savedEvaluations.push(saved);
    }

    return savedEvaluations;
  }

  /**
   * Save evaluation record to DB.
   */
  async saveEvaluation(db, patientId, evalResult) {
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
      JSON.stringify(evalResult.detailed_response || evalResult),
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get all evaluations for a patient.
   */
  async getEvaluations(db, patientId) {
    const query = `
      SELECT * FROM hedis_evaluations 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [patientId]);
    return result.rows;
  }
}

module.exports = new HEDISService();
