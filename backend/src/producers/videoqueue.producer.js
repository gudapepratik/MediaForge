import { videoQueue } from "../queues/video.queue";

// method to add a new job when video upload is complete
export const enqueue = async (videoId, videoUrl) => {
  const job = await videoQueue.add('transcode', {
    videoId,
    videoUrl
  })

  console.log(`NEW JOB ADDED: ${job.id}`)
  return job.id;
}

