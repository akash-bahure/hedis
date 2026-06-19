const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const pool = require('../config/db');
const { forwardChartToAiService } = require('../services/aiIntegration.service');

const worker = new Worker('chart-processing', async (job) => {
  const { patientId, chartId, filePath, schema } = job.data;
  console.log(`[WORKER] Job Started: ${job.id}`);
  console.log(`[WORKER] Chart ID: ${chartId}`);
  console.log(`[WORKER] File Path: ${filePath}`);

  try {
    // 1. Send PDF to ai-service-node
    console.log(`[WORKER] Calling AI Service...`);
    const aiResponse = await forwardChartToAiService(patientId, { path: filePath, originalname: job.data.originalname || 'document.pdf' });
    console.log(`[WORKER] AI Response Received`);
    console.log(`[WORKER] Events Count: ${aiResponse.events?.length || 0}`);

    // 2. Save timeline events
    if (aiResponse.events && aiResponse.events.length > 0) {
      console.log(`[WORKER] Saving Timeline Events...`);
      
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
        console.log(`[WORKER] Timeline Saved`);
        console.log(`[WORKER] Chart Marked Completed (With Events)`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      console.log(`[WORKER] No events returned from AI. Marking chart as completed anyway.`);
      const client = await pool.connect();
      try {
        await client.query(
          `
          UPDATE ${schema}.patient_charts
          SET status = 'COMPLETED', updated_at = NOW()
          WHERE id = $1
          `,
          [chartId]
        );
      } catch (err) {
        console.error(`[Worker] Failed to update chart status for empty events:`, err.message);
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error(`[WORKER] Job ${job.id} failed:`, error.message);
    
    // Mark chart as failed
    console.log(`[WORKER] Chart Marked Failed`);
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