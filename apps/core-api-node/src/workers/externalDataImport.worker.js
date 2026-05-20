const { Worker } = require("bullmq");

const pool = require("../config/db");

const redisConnection = require("../config/redis");

const {
  syncMedicalCodingData,
} = require("../services/externalDataImportSyncService");

const worker = new Worker(
  "external-data-import",

  async (job) => {
    const { tenantId } = job.data;

    console.log(`Starting sync for tenant ${tenantId}`);

    const tenantResult = await pool.query(
      `
          SELECT *
          FROM tenants
          WHERE id = $1
          `,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      throw new Error("Tenant not found");
    }

    const tenant = tenantResult.rows[0];

    await syncMedicalCodingData(tenant);

    console.log(`Sync completed for tenant ${tenant.name}`);
  },

  {
    connection: redisConnection,
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id}`, err.message);
});
