const { Worker } = require("bullmq");
const axios = require("axios");
const redisConnection = require("../config/redis");
const pool = require("../config/db");

console.log("[HEDIS QA WORKER] Initializing worker process...");

const worker = new Worker(
  "hedis-qa-review",
  async (job) => {
    const { evaluationId, patientId, measureCode, pdfPath, tenantSubdomain } = job.data;
    console.log(`[HEDIS QA WORKER] Job started: ${job.id} for Evaluation ID: ${evaluationId}, Patient ID: ${patientId}, Measure: ${measureCode}`);

    if (!evaluationId || !patientId || !measureCode || !pdfPath || !tenantSubdomain) {
      throw new Error(`Invalid job data. Required details: evaluationId, patientId, measureCode, pdfPath, tenantSubdomain. Got: ${JSON.stringify(job.data)}`);
    }

    const client = await pool.connect();
    try {
      // 1. Fetch tenant schema name to set search_path
      console.log(`[HEDIS QA WORKER] Fetching tenant info for subdomain: ${tenantSubdomain}`);
      const tenantResult = await client.query(
        "SELECT schema_name FROM public.tenants WHERE subdomain = $1",
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        throw new Error(`Tenant not found for subdomain: ${tenantSubdomain}`);
      }

      const schema = tenantResult.rows[0].schema_name;
      console.log(`[HEDIS QA WORKER] Configuring search path to: ${schema}, public`);
      await client.query(`SET search_path TO ${schema}, public`);

      // 2. Check if cached analysis already exists (prevent duplicate insertion)
      const checkResult = await client.query(
        "SELECT id FROM hedis_qa_review_analyses WHERE evaluation_id = $1 LIMIT 1",
        [evaluationId]
      );
      if (checkResult.rows.length > 0) {
        console.log(`[HEDIS QA WORKER] Cached analysis already exists for evaluation ${evaluationId}. Skipping processing.`);
        return { skipped: true, reason: "Already exists" };
      }

      // 3. Fetch measure rules from Measure Library
      console.log(`[HEDIS QA WORKER] Fetching measure rules for code: ${measureCode}`);
      const measureResult = await client.query(
        "SELECT * FROM measures WHERE measure_code = $1",
        [measureCode]
      );
      const measureRules = measureResult.rows[0] || {};
      const measureName = measureRules.measure_name || measureCode;

      // 4. Call AI Service
      const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8001";
      console.log(`[HEDIS QA WORKER] Calling AI Service at ${aiServiceUrl}/api/hedis/qa-review-analysis`);

      const aiResponse = await axios.post(
        `${aiServiceUrl}/api/hedis/qa-review-analysis`,
        {
          patientId,
          measureCode,
          pdfPath,
          measureRules,
        },
        {
          timeout: 300000, // 5 minutes
        }
      );

      const analysisData = aiResponse.data;

      // 5. Persist result to DB
      console.log(`[HEDIS QA WORKER] Saving QA Review Analysis to DB for evaluation: ${evaluationId}`);
      await client.query(
        `INSERT INTO hedis_qa_review_analyses
          (
            evaluation_id,
            patient_id,
            measure_code,
            measure_name,
            pdf_path,
            extracted_evidence,
            validation_checklist,
            summary,
            abstractor_evidence,
            measure_rules,
            all_evidences
          )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10)`,
        [
          evaluationId,
          patientId,
          measureCode,
          measureName,
          pdfPath,
          JSON.stringify(analysisData.extractedEvidence || []),
          JSON.stringify(analysisData.validationChecklist || {}),
          JSON.stringify(analysisData.summary || {}),
          JSON.stringify(measureRules),
          JSON.stringify(analysisData.allEvidence || []),
        ]
      );

      console.log(`[HEDIS QA WORKER] Job completed successfully: ${job.id}`);
      return { success: true };
    } catch (err) {
      console.error(`[HEDIS QA WORKER] Job ${job.id} failed logic:`, err);
      throw err;
    } finally {
      client.release();
      console.log(`[HEDIS QA WORKER] DB client released for job: ${job.id}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Concurrency limit: 2 maximum
  }
);

worker.on("failed", (job, err) => {
  console.error(`[HEDIS QA WORKER] Job ${job.id || "unknown"} failed permanently:`, err.message);
});

worker.on("error", (err) => {
  console.error("[HEDIS QA WORKER] Global worker error event:", err);
});

module.exports = worker;
