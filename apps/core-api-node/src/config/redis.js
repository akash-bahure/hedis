const IORedis = require("ioredis");

const redisConnection = new IORedis({
  host: "redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

module.exports = redisConnection;
