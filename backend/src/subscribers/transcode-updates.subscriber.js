import Redis from "ioredis";
import { io } from '../index.js'
import { prisma } from "../config/db.js";

const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

const channel = "video:updates:*";

await subscriber.psubscribe(channel, (err) => {
  if(err) {
    console.log(`Failed to subscribe to channel ${channel}`, err);
  }
  console.log(`Subscribed to channel ${channel}, listening to updates...`)
})

/*
  message structure :
  {
    jobId,
    userId,
    videoId,
    stage, // downloading, transcoding, uploading HLS, finalizing, completed, failed
    progress, // 0 - 100
    message, // string message
    timeStamp,
    metadata: {}
  }
*/

subscriber.on('pmessage', async (p, ch, msg) => {

  // 1. parse the message to json
  const data = JSON.parse(msg);

  // 2. send critical updates to database (completed, failed)
  if(data.stage === 'completed' || data.stage === 'failed') {
    const newStatus = data.stage === 'completed' ? "READY" : "FAILED";
    await prisma.video.update({
      where: {id: data.videoId},
      data: {
        status: newStatus,
        storageKey: data.metadata.key // new public key
      }
    })

    // remove upload and upload parts data from db
    if(newStatus === "READY") {
      await prisma.upload.delete({
        where: {videoId: data.videoId}
      })
    }
  }

  // 3. send update to socketio clients in room$jobId
  io.to(data.jobId).emit('transcode-update', data);
  
  console.log(`message recieved from channel ${ch}`);
})

subscriber.on('error', (err) => {
  console.error('Redis subscriber error:', err);
});

subscriber.on('end', () => {
  console.log('Redis subscriber disconnected.');
});


