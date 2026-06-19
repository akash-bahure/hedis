const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

const chartQueue = new Queue('chart-processing', {
  connection: redisConnection
});

const originalAdd = chartQueue.add.bind(chartQueue);
chartQueue.add = async function(name, data, opts) {
  console.log(`[QUEUE] Adding Job: ${name}`);
  try {
    const job = await originalAdd(name, data, opts);
    console.log(`[QUEUE] Job Added Successfully: ${job.id}`);
    return job;
  } catch (err) {
    console.error(`[QUEUE] Job Failed to Add: ${err.message}`);
    throw err;
  }
};

module.exports = chartQueue;
