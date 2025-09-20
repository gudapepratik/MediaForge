import {Worker, QueueEvents} from 'bullmq'
import IORedis from 'ioredis'
import { transcodeVideo } from './transcoder.js'
import 'dotenv'

// redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || '6379',
  password: process.env.REDIS_PASSWORD,
})

const worker = new Worker('transcode-queue', async (job) => {
  // handle the worker job
  console.log(`Processing Job ${job.id}`, job.data);

  await transcodeVideo(...job.data);

  console.log(`JOB DONE ${job.id}`)

  return {status: 'done', videoPath: 'something here'}
}, {connection, lockDuration: 30 * 60 * 1000, concurrency: 2})

const queueEvents = new QueueEvents('transcode-queue', {connection});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log('Job completed event');
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log('Job failed event');
});

queueEvents.on('progress', ({ jobId, data }) => {
  console.log('Job progress event');
});

worker.on('error', (err) => {
  console.error('Worker error');
});

export default worker

