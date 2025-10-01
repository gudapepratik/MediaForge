/* 
  read these
  - https://docs.bullmq.io/guide/workers/sandboxed-processors
*/

import {Worker} from 'bullmq'
import dotenv from 'dotenv'
import redis from './redis.js'
import path from 'path'
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_NAME = process.env.TRANSCODE_QUEUE;
const processorFile = path.join(__dirname, 'job-processor.js');

// create a bullmq worker
const worker = new Worker(QUEUE_NAME, processorFile, {
  connection: redis,
  concurrency: 1,
  lockDuration: 600000,
  removeOnComplete: {count: 100}, // keep 100 recently completed jobs in completed set
  removeOnFail: {count: 1000} // keep 1000 recently failed jobs in failed set
})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} is completed`)
})

worker.on('failed', (job) => {
  console.log(`Job ${job.id} is failed, will be retried later`)
})

worker.on('ioredis:close', () => {
  console.log(`Redis Connection Closed!!`)
})

worker.on('error', (err) => {
  console.error(`An Error occurred`, err)
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await worker.close();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await worker.close();
  redis.disconnect();
  process.exit(0);
});