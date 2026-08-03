const { Queue, QueueEvents } = require("bullmq");
const redisConnection = require("../config/redis");

const OLLAMA_QUEUE_NAME = "ollama-requests";

const ollamaQueue = new Queue(OLLAMA_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

const queueEvents = new QueueEvents(OLLAMA_QUEUE_NAME, {
  connection: redisConnection,
});

/**
 * Executes an Ollama request safely through the BullMQ queue.
 * Ensures strict concurrency limits, retries on 429, and job status tracking.
 *
 * @param {string} name Descriptive job name (e.g., 'ocr', 'chat', 'text2sql')
 * @param {object} payload Parameters passed directly to ollama.chat()
 * @returns {Promise<any>} Resolves with the ollama.chat() response object
 */
async function executeOllamaJob(name, payload) {
  const job = await ollamaQueue.add(name, payload);
  console.log(`[OLLAMA QUEUE] Job enqueued: ${job.id} (${name})`);

  try {
    const result = await job.waitUntilFinished(queueEvents);
    return result;
  } catch (err) {
    console.error(`[OLLAMA QUEUE] Job ${job.id} (${name}) failed:`, err.message);
    throw err;
  }
}

module.exports = {
  ollamaQueue,
  queueEvents,
  executeOllamaJob,
};
