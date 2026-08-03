const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const ollama = require("../config/ollama");

const OLLAMA_QUEUE_NAME = "ollama-requests";
const concurrency = parseInt(process.env.OLLAMA_CONCURRENCY || "1");

console.log(`[OLLAMA WORKER] Initializing worker with concurrency ${concurrency}...`);

const ollamaWorker = new Worker(
  OLLAMA_QUEUE_NAME,
  async (job) => {
    console.log(`[OLLAMA WORKER] Processing job ${job.id} (${job.name})...`);
    try {
      const response = await ollama.chat(job.data);
      console.log(`[OLLAMA WORKER] Job ${job.id} completed successfully.`);
      return response;
    } catch (error) {
      console.error(`[OLLAMA WORKER] Job ${job.id} failed with error:`, error.message);
      // Re-throw so BullMQ triggers automatic retries (with exponential backoff)
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency,
  }
);

ollamaWorker.on("failed", (job, err) => {
  console.error(`[OLLAMA WORKER] Job ${job?.id} permanently failed after max retries:`, err.message);
});

ollamaWorker.on("error", (err) => {
  console.error("[OLLAMA WORKER] Global worker error event:", err.message);
});

module.exports = ollamaWorker;
