import IORedis from 'ioredis'

// DOC - https://redis.github.io/ioredis/

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || '6379',
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

connection.on('connect', () => console.log("REDIS CONNECTED"))
connection.on('error', (err) => console.error("REDIS CONNECTION ERROR", err))
connection.on('close', () => console.log('REDIS CONNECTION CLOSED'))

export default connection;

