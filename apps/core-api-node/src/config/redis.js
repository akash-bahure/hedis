const IORedis = require("ioredis");

const redisConnection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("[REDIS] Connected");
});

redisConnection.on("error", (err) => {
  console.error("[REDIS] Connection Error:", err.message);
});

redisConnection.on("end", () => {
  console.log("[REDIS] Disconnected");
});

redisConnection.on("reconnecting", () => {
  console.log("[REDIS] Reconnecting");
});

module.exports = redisConnection;
