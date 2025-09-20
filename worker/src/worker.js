import {Worker, QueueEvents} from 'bullmq'
import IORedis from 'ioredis'
import { transcodeVideo } from './transcoder.js'

// redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || '6379',
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
})

export function createWorker() {
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

  const shutdown = async () => {
    logger.info('Graceful shutdown worker');
    await worker.close();
    await queueEvents.close();
    await connection.quit();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return {worker, queueEvents};
}

