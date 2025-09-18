import {Queue} from 'bullmq'
import connection from '../config/redis'

// BULL DOCS - https://api.docs.bullmq.io/classes/v5.QueueEvents.html

export const videoQueue = new Queue('video-transcode', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100, // keep last 100 completed jobs
    removeOnFail: 1000, // keep them for debugging
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5 sec
    } 
  }
});

