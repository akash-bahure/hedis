const cron = require("node-cron");

const pool = require("../config/db");

const externalDataImportQueue = require("../queues/externalDataImport.queue");

// crno run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Running external data import cron...");

  try {
    const tenantResult = await pool.query(`
        SELECT *
        FROM tenants
        WHERE
          is_active = true
          AND is_archived = false
          AND api_key IS NOT NULL
          AND external_medical_coding_endpoint IS NOT NULL
      `);

    for (const tenant of tenantResult.rows) {
      console.log(`Queueing tenant sync: ${tenant.name}`);

      await externalDataImportQueue.add(
        "sync-tenant",
        {
          tenantId: tenant.id,
        },
        {
          jobId: `external-data-import-${tenant.id}`, // identifier to prevent duplicates
        },
        {
          attempts: 3,

          removeOnComplete: 20,

          removeOnFail: 50,

          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );
    }
  } catch (err) {
    console.error("Cron failed:", err.message);
  }
});
