import { QueueEventsProducer } from "bullmq";
import redis from "./redis.js";

const queueEventProducer = new QueueEventsProducer('transcode-events-queue', {
  connection: redis,
})

export default queueEventProducer;