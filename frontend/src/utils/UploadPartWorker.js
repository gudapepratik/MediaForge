import axios from "axios";
import evnConfig from '../../config'

/*
  1. Upload part worker recieves a part to be uploaded.
  2. for each part it can perform at most 3 retries if any unexpected failure occurs.
  3. in each attempt, it
    • requests a presigned url from backend (s3 client) for that part.
    • uploads the file part (slice) using PUT xhr request and updates the progress.
    • if failure occurs, re-attempts again. after 3 failures marks the part as failed in backend
    • on upload complete, ETag is recieved and marks upload complete in backend for that part
    • done
  4. An exponential backoff is there between each tries to ensure that there is some cooloff time between previous and new request to reduce chances of errors again.
  5. done
*/

export async function uploadPartWorker(item, signal, { onPartProgress  }) {
  // expected item: { uploadId, partId, partNo, fileSlice (Blob), size, videoId }
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      // request a presigned url for this part
      const { data: { data } } = await axios.post(
        `${evnConfig.BACKEND_ENDPOINT}/api/videos/upload-part-request/${item.uploadId}/${item.partId}`,
        null,
        { withCredentials: true }
      );
      const url = data.url;

      // upload using fetch 
      const eTag = await putWithXHR(url, item.fileSlice, onPartProgress, signal);

      // update backend complete part
      await axios.put(`${evnConfig.BACKEND_ENDPOINT}/api/videos/mark-upload-part-completed/${item.partId}`, { eTag }, { withCredentials: true });

      return eTag;
    } catch (err) {
      if (err.name === "AbortError") throw err; // no retries once aborted
      if (attempt >= maxRetries) {
        try {
          await axios.put(`${evnConfig.BACKEND_ENDPOINT}/api/videos/mark-upload-part-failed/${item.partId}`, null, { withCredentials: true });
        } catch (err) {}
        throw err;
      }
      // exponential backoff
      const backoff = Math.pow(2, attempt) * 200 + Math.random() * 200;
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

// this is a helper function to perform upload using PUT xhr
function putWithXHR(url, blob, onProgress, signal) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        return resolve(etag?.replace(/"/g, "") ?? null); // resole with Etag when done uploading
      }
      reject(new Error("Upload failed with status " + xhr.status)); // reject with error
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.onabort = () => {
      const err = new Error("Upload aborted");
      err.name = "AbortError";
      reject(err);
    };

    if (signal) {
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.send(blob);
  });
}
