const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const chartQueue = require('../queue/chart.queue');
const pool = require('../config/db');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('[Cron] Checking for new charts to ingest...');
  const mockDir = path.join(__dirname, '../../../mock-charts');

  try {
    if (!fs.existsSync(mockDir)) {
      return;
    }

    const files = fs.readdirSync(mockDir).filter(file => file.endsWith('.pdf'));

    for (const file of files) {
      const filePath = path.join(mockDir, file);
      // Determine patientId from filename or default
      const patientId = "00000000-0000-0000-0000-000000000000"; // Mock UUID
      const schema = "tenant_test123_schema"; // Default schema for dev

      console.log(`[Cron] Found new chart: ${file}. Adding to queue...`);

      // Mock chart record insertion for cron
      const client = await pool.connect();
      try {
        const result = await client.query(
          `
          INSERT INTO ${schema}.patient_charts (
            patient_id, status, chart_document
          )
          VALUES ($1, $2, $3)
          RETURNING id
          `,
          [patientId, 'QUEUED', JSON.stringify({ filename: file, path: filePath })]
        );

        const chartId = result.rows[0].id;

        await chartQueue.add('process-chart', {
          patientId,
          chartId,
          filePath,
          schema,
          uploadedBy: null,
          uploadedAt: new Date().toISOString()
        });

        // Move to processed folder to prevent re-processing
        const processedDir = path.join(mockDir, 'processed');
        if (!fs.existsSync(processedDir)) {
          fs.mkdirSync(processedDir);
        }
        fs.renameSync(filePath, path.join(processedDir, file));

      } catch (err) {
        console.error(`[Cron] Failed to ingest ${file}:`, err.message);
      } finally {
        client.release();
      }
    }
  } catch (err) {
    console.error('[Cron] Error running ingestion:', err);
  }
});
