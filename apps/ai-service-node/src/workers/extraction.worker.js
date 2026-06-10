const { Worker } = require("bullmq");

const connection = {
  host: "redis",
  port: 6379,
};

new Worker(
  "timeline-extraction",
  async (job) => {
    console.log("Processing chart:", job.data);

    // extraction logic
  },
  { connection }
);
