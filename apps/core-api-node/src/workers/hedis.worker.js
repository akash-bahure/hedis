const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const pool = require("../config/db");
const hedisService = require("../services/hedis.service");

console.log("[HEDIS WORKER] Initializing worker process...");

const worker = new Worker(
  "hedis-analysis",
  async (job) => {
    const { patientId, pdfPath, tenantSubdomain } = job.data;
    console.log(`[HEDIS WORKER] Job started: ${job.id} for Patient ID: ${patientId}`);
    
    if (!patientId || !pdfPath || !tenantSubdomain) {
      throw new Error(`Invalid job data. Required: patientId, pdfPath, tenantSubdomain. Got: ${JSON.stringify(job.data)}`);
    }

    const client = await pool.connect();
    try {
      // 1. Fetch tenant schema name to set search_path
      console.log(`[HEDIS WORKER] Fetching tenant info for subdomain: ${tenantSubdomain}`);
      const tenantResult = await client.query(
        "SELECT schema_name FROM public.tenants WHERE subdomain = $1",
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        throw new Error(`Tenant not found for subdomain: ${tenantSubdomain}`);
      }

      const schema = tenantResult.rows[0].schema_name;
      console.log(`[HEDIS WORKER] Configuring search path to: ${schema}, public`);
      await client.query(`SET search_path TO ${schema}, public`);

      // 2. Perform HEDIS evaluation
      console.log(`[HEDIS WORKER] Calling evaluatePatientChartByPath for patient ${patientId}`);
      
      // Ensure we pass the client with set search_path to evaluatePatientChartByPath
      const savedEvaluations = await hedisService.evaluatePatientChartByPath(
        patientId,
        pdfPath,
        tenantSubdomain,
        client
      );

      console.log(`[HEDIS WORKER] Job completed successfully: ${job.id}. Saved ${savedEvaluations.length} evaluations.`);
      return { savedCount: savedEvaluations.length };
    } catch (err) {
      console.error(`[HEDIS WORKER] Job ${job.id} failed logic:`, err);
      throw err;
    } finally {
      client.release();
      console.log(`[HEDIS WORKER] DB client released for job: ${job.id}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Concurrency set to 2 jobs max as requested
  }
);

worker.on("failed", (job, err) => {
  console.error(`[HEDIS WORKER] Job ${job.id || "unknown"} failed permanently:`, err.message);
});

worker.on("error", (err) => {
  console.error("[HEDIS WORKER] Global worker error event:", err);
});

module.exports = worker;
