import Redis from "ioredis";

// const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
// const REDIS_HOST = process.env.REDIS_HOST;
// const REDIS_PORT = process.env.REDIS_PORT;

// const redis = new Redis({
//   host: REDIS_HOST,
//   port: REDIS_PORT,
//   password: REDIS_PASSWORD,
  
//   maxRetriesPerRequest: null, // required for bullmq
//   enableReadyCheck: false
// })

const REDIS_URL = process.env.REDIS_URL;

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // required for bullmq
  enableReadyCheck: false
})

redis.on('connect', () => console.log("REDIS CONNECTED"))
redis.on('error', (err) => console.error("REDIS CONNECTION ERROR", err))
redis.on('close', () => console.log('REDIS CONNECTION CLOSED'))

export default redis;