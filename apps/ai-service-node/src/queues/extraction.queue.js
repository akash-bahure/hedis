const { Queue } = require("bullmq");

const connection = {
  host: "redis",
  port: 6379,
};

const extractionQueue = new Queue("timeline-extraction", { connection });

module.exports = extractionQueue;
