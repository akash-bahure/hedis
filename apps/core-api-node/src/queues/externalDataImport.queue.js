const { Queue } = require("bullmq");

const redisConnection = require("../config/redis");

const externalDataImportQueue = new Queue("external-data-import", {
  connection: redisConnection,
});

module.exports = externalDataImportQueue;
