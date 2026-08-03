const IORedis = require("ioredis");

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("[REDIS] Connected");
});

redisConnection.on("error", (err) => {
  console.error("[REDIS] Error:", err.message);
});

module.exports = redisConnection;
