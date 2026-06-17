const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

const chartQueue = new Queue('chart-processing', {
  connection: redisConnection
});

module.exports = chartQueue;
