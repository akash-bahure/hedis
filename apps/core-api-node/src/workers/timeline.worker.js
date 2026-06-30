const { Worker } = require("bullmq");
const axios = require("axios");
const redisConnection = require("../config/redis");
const pool = require("../config/db");
const hedisService = require("../services/hedis.service");

console.log("[TIMELINE WORKER] Initializing worker process...");

const worker = new Worker(
  "clinical-timeline",
  async (job) => {
    const { patientId, pdfPath, tenantSubdomain } = job.data;
    console.log(`[TIMELINE WORKER] Job started: ${job.id} for Patient ID: ${patientId}`);

    if (!patientId || !pdfPath || !tenantSubdomain) {
      throw new Error(`Invalid job data. Required: patientId, pdfPath, tenantSubdomain. Got: ${JSON.stringify(job.data)}`);
    }

    const client = await pool.connect();
    try {
      // 1. Fetch tenant schema name to set search_path
      console.log(`[TIMELINE WORKER] Fetching tenant info for subdomain: ${tenantSubdomain}`);
      const tenantResult = await client.query(
        "SELECT schema_name FROM public.tenants WHERE subdomain = $1",
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        throw new Error(`Tenant not found for subdomain: ${tenantSubdomain}`);
      }

      const schema = tenantResult.rows[0].schema_name;
      console.log(`[TIMELINE WORKER] Configuring search path to: ${schema}, public`);
      await client.query(`SET search_path TO ${schema}, public`);

      // 2. Check if timeline events already exist (prevent duplicate extraction on retry)
      const checkResult = await client.query(
        "SELECT COUNT(*) AS total FROM clinical_timeline_events WHERE patient_id = $1",
        [patientId]
      );
      if (Number(checkResult.rows[0].total) > 0) {
        console.log(`[TIMELINE WORKER] Timeline events already exist for patient ${patientId}. Skipping extraction.`);
        return { skipped: true, reason: "Already exists" };
      }

      // 3. Call extractClinicalTimeline (calls AI service and saves to DB)
      console.log(`[TIMELINE WORKER] Calling extractClinicalTimeline for patient ${patientId}`);
      const savedEvents = await hedisService.extractClinicalTimeline(
        patientId,
        pdfPath,
        tenantSubdomain,
        client
      );

      console.log(`[TIMELINE WORKER] Job completed successfully: ${job.id}. Saved ${savedEvents.length} timeline events.`);
      return { savedCount: savedEvents.length };
    } catch (err) {
      console.error(`[TIMELINE WORKER] Job ${job.id} failed logic:`, err);
      throw err;
    } finally {
      client.release();
      console.log(`[TIMELINE WORKER] DB client released for job: ${job.id}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  }
);

worker.on("failed", (job, err) => {
  console.error(`[TIMELINE WORKER] Job ${job.id || "unknown"} failed permanently:`, err.message);
});

worker.on("error", (err) => {
  console.error("[TIMELINE WORKER] Global worker error event:", err);
});

module.exports = worker;
