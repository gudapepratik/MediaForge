/*
  Stages => starting, transcoding, uploadingHLS, finalizing
  progress => 0 - 100 %
  message => "downloading video..", "6 of 10 segments", "uploading 6 of 10 files", ... 
  metadata => {
    additional data
    }
*/
        
export class ProgressUpdate {
  constructor(redisClient, eventProducer, jobId, videoId, userId, job) {
    this.redis = redisClient
    this.jobId = jobId
    this.job = job
    this.videoId = videoId
    this.userId = userId
    this.queueEventProducer = eventProducer
  }

  async sendPubSubUpdate(stage, progress,message,  metadata = {}) {
    const updateData = {
      jobId: this.jobId,
      userId: this.userId,
      videoId: this.videoId,
      stage,
      progress,
      message,
      timeStamp: new Date().toISOString(),
      metadata
    }

    try {
      await this.redis.publish(`video:updates:${this.userId}`, JSON.stringify(updateData));
      console.log(`Real-time update sent: ${stage} - ${progress}%`);
    } catch (error) {
      console.error('Redis pub/sub failed (non-critical):', error);
    }
  }

  async publishQueueEvent(stage, progress,message,  metadata = {}) {
    const updateData = {
      jobId: this.jobId,
      userId: this.userId,
      videoId: this.videoId,
      stage,
      progress,
      message,
      timeStamp: new Date().toISOString(),
      metadata
    }

    try {
      await this.queueEventProducer.publishEvent({eventName: `video-transcode-update`, data: JSON.stringify(updateData)});
      console.log(`Queue Event update published: ${stage} - ${progress}%`);
    } catch (error) {
      console.error('Queue event failed:', error);
    }
  }

  async sendBullmqUpdate(stage, progress,message, details = {}) {
    try { 
      await this.job.updateProgress(Number(progress));
      // save structured log entry
      await this.job.log(JSON.stringify({ stage, message, details, timeStamp: new Date().toISOString() }));
      console.log(`Job update sent: ${stage} - ${progress}%`);
    } catch (error) {
      console.error('Job update failed (critical):', error);
    }
  }
};