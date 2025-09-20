import dotenv from 'dotenv'
dotenv.config();

import { createWorker } from './src/worker.js';

(async () => {
  try {
    console.log("Starting worker...");
    createWorker();
    console.log("Worker running,.. waiting for jobs...")
  } catch (error) {
    console.error("Failed to start worker.", error)
    process.exit(1);
  }
})();   