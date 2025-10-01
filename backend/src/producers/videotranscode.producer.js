import { transcodingQueue } from "../queues/transcoding-queue.js";

// method to add a new job when video upload is complete
export const addToTranscodingQueue = async (metadata) => {
  const job = await transcodingQueue.add('transcode-video', metadata)

  console.log(`New job added to transcoding queue: ${job.id}`)
  return job.id;   
}

