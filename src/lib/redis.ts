import Redis from "ioredis";

// Create a new Redis instance
const redis = new Redis(process.env.REDIS_URL as string);

// Export the Redis client for reuse
export default redis;
