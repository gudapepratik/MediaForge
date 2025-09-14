/*
  1. This is a simple queue implementation to manage all the parts of a video upload.
  2. each pending upload will have its own queue of parts (incomplete).
  3. when upload is resumed, each part is taken out of the queue and send to r2 via a Direct-To-S3 process.
  --> Direct-To-S3 = requestMultipartUpload -> break file in parts (chunks) -> for each part -> get presigned url -> upload to storage directly (via PUT xhr request) -> when done update the metadata stored in app database -> when all parts done -> completeMultipartUpload -> DONE
  4. uploads can be resumed, paused, cancelled(aborted by user), failed (network errors)
  5. parallel(concurrent) upload for parts is implemented here means, max 3 parts will be uploaded at same time, as soon as one part is completed, another one is uploaded, and so on..
*/
export default class UploadQueue {
  constructor({ concurrency = 3 } = {}) {
    this.concurrency = concurrency;
    this.queue = []; // [{ part, uploadId, videoId, partId, partNo, size }]
    this.running = 0;
    this.stopped = false; // flag to pause/resume
    this.controllers = new Map(); // partId -> AbortController
    this.onProgress = null; // callback(totalUploadedBytes, totalBytes)
    this.onPartComplete = null; // callback(part)
    this.onPartFailed = null; // callback(part)
    this.onIdle = null; // when queue drained, here we will complete the final upload of video
  }

  enqueueMany(parts) {
    this.queue.push(...parts);
    this._kick();
  }

  enqueue(part) {
    this.queue.push(part);
    this._kick();
  }

  pause() {
    this.stopped = true;
    // abort in-flight if you want hard pause:
    for (const ctrl of this.controllers.values()) 
      ctrl.abort();
    this.controllers.clear();
  }

  resume() {
    this.stopped = false;
    this._kick();
  }

  cancelAll() {
    this.pause();
    this.queue = [];
  }

  // run/upload the parts from queue
  _kick() {
    if (this.stopped) return;

    while (this.running < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift(); // remove part from queue
      this.running++;
      this._runItem(item).finally(() => {
        this.running--;
        if (this.queue.length === 0 && this.running === 0 && this.onIdle) this.onIdle();
        this._kick(); // run again for other parts
      });
    }
  }

  async _runItem(item) {
    const controller = new AbortController();
    this.controllers.set(item.partId, controller);
    try {
      if (!this._uploader) throw new Error("No uploader provided");
      await this._uploader(item, controller.signal);
      this.controllers.delete(item.partId);
      if (this.onPartComplete) this.onPartComplete(item);
    } catch (err) {
      this.controllers.delete(item.partId);
      if (err.name === "AbortError") return;
      if (this.onPartFailed) this.onPartFailed(item, err);
    }
  }

  async _uploader(item, signal) {
    // will be implemented in queue manager
    throw new Error("_uploader not implemented");
  }
}
