const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const pool = require('../config/db');
const { forwardChartToAiService } = require('../services/aiIntegration.service');

const worker = new Worker('chart-processing', async (job) => {
  const { patientId, chartId, filePath, schema } = job.data;
  console.log(`[Worker] Picked up job ${job.id} for patient ${patientId}`);

  try {
    // 1. Send PDF to ai-service-node
    console.log(`[Worker] Sending PDF to AI service...`);
    const aiResponse = await forwardChartToAiService(patientId, { path: filePath, originalname: job.data.originalname || 'document.pdf' });

    // 2. Save timeline events
    if (aiResponse.events && aiResponse.events.length > 0) {
      console.log(`[Worker] Received ${aiResponse.events.length} events. Saving to clinical_timeline_events...`);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (const event of aiResponse.events) {
          await client.query(
            `
            INSERT INTO ${schema}.clinical_timeline_events (
              patient_id, chart_id, event_date, event_type, measure,
              provider, evidence, source_type, review_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [
              patientId,
              chartId,
              event.event_date || null,
              event.event_type || null,
              event.measure || null,
              event.provider || null,
              event.evidence || null,
              'AI',
              'PENDING'
            ]
          );
        }
        
        // 3. Update chart status
        await client.query(
          `
          UPDATE ${schema}.patient_charts
          SET status = 'COMPLETED', updated_at = NOW()
          WHERE id = $1
          `,
          [chartId]
        );
        
        await client.query('COMMIT');
        console.log(`[Worker] Successfully completed job ${job.id}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    
    // Mark chart as failed
    const client = await pool.connect();
    try {
      await client.query(
        `
        UPDATE ${schema}.patient_charts
        SET status = 'FAILED', updated_at = NOW()
        WHERE id = $1
        `,
        [chartId]
      );
    } catch (err) {
      console.error(`[Worker] Failed to update chart status:`, err.message);
    } finally {
      client.release();
    }
    
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 1
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with error:`, err);
});

module.exports = worker;
