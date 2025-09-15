import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UploadQueue from "../utils/UploadQueue";
import { uploadPartWorker } from "../utils/UploadPartWorker";
import { sliceForPart, CHUNK_SIZE, getFileHash } from "../utils/upload.utils";
import evnConfig from '../../config'

/*
  1. this is the implementation of an "upload manager" which manages all the upload queues.
  2. it handles fetching of pending uploads, implementing the upload queue, creating upload queues for upload
*/
export function useUploadManager() {
  const [uploads, setUploads] = useState([]); // array of metadata from backend
  const queuesRef = useRef(new Map()); // videoId -> UploadQueue
  const progressRef = useRef(new Map()); // videoId -> { uploadedBytes, totalBytes }
  const [isRecovering, setIsRecovering] = useState(false);

  // firstly, get all the pending uploads from backend
  useEffect(() => {
    (async () => {
      try {
        setIsRecovering(true)

        const { data: {data} } = await axios.get(`${evnConfig.BACKEND_ENDPOINT}/api/videos/pending-uploads`, { withCredentials: true });
        
        setUploads(data.uploads);
        console.log(data.uploads);

        // check for interrupted uploads and handle
        let interruptedUploads = await data.uploads.filter(u => u.status === "uploading" || u.status === "initiated")

        if(interruptedUploads?.length > 0) {
          console.log(`Found ${interruptedUploads.length} Interrupted uploads`)

          // update in backend
          await Promise.allSettled(
            interruptedUploads.map(u => updateUploadStatusServer(u.videoId, "paused"))
          );

          // upload in local state
          setUploads(prev => prev.map(u => 
            interruptedUploads.find(i => i.videoId === u.videoId) ? {...u, status: "paused"} : u
          ))
        }
      } catch (err) {
        console.error("Failed to fetch pending uploads", err);
      } finally {
        setIsRecovering(false)
      }
    })(); // IIFE

    // need to implement unmount state (like update the status for uploads to "paused")
    // i dont think we need it, cause the interrupted uploads are handled on mount
  }, []);

  // helper
  function updateUploadLocal(videoId, patch) {
    setUploads(prev => prev.map(u => u.videoId === videoId ? { ...u, ...patch } : u));
  }

  // helper
  async function updateUploadStatusServer(videoId, status) {
    try {
      await axios.patch(`${evnConfig.BACKEND_ENDPOINT}/api/videos/upload-status/${videoId}`,{status}, {withCredentials: true} );
    } catch (err) {console.log("Upload Status update Failed: Failed to update Server")}
  }

  async function initQueue(uploadMeta, file) {
    // create queue
    const q = new UploadQueue({ concurrency: 3 });

    // implement uploader
    q._uploader = async (item, signal) => {
      // on part progress update aggregate bytes to compute overall progress
      await uploadPartWorker(item, signal, {
        onPartProgress: (loaded) => {
          const key = uploadMeta.videoId;
          const p = progressRef.current.get(key) || { uploadedBytes: 0, totalBytes: file.size };
          const percentage  = Math.round(((p.uploadedBytes + Number(loaded))/p.totalBytes) * 100)
          console.log(`Uploading videoId ${item.videoId} for part ${item.partNo}: ${percentage}%`)
          // we only track per-part deltas in the worker via items, but for simplicity recalc below
        }
      });
    };

    q.onPartComplete = (item) => {
      // Update server state already done by worker; update local UI progress
      const key = uploadMeta.videoId;
      const cur = progressRef.current.get(key) || { uploadedBytes: 0, totalBytes: file.size };
      progressRef.current.set(key, { uploadedBytes: cur.uploadedBytes + item.size, totalBytes: cur.totalBytes });
      const percent = Math.round((progressRef.current.get(key).uploadedBytes / progressRef.current.get(key).totalBytes) * 100);
      updateUploadLocal(uploadMeta.videoId, { percentage: percent });
    };

    q.onPartFailed = (item, err) => {
      console.error(`FAILED: videoId ${item.videoId} for part ${item.partNo}`, item, err);
      // updateUploadLocal(uploadMeta.videoId, { status: "failed" });
      // updateUploadLocal(uploadMeta.videoId, { status: "failed" });
    };

    q.onIdle = async () => {
      // all parts attempted - call complete endpoint
      try {
        await axios.put(`${evnConfig.BACKEND_ENDPOINT}/api/videos/complete-multipart-upload/${uploadMeta.videoId}`,null, {withCredentials: true} );
        updateUploadLocal(uploadMeta.videoId, { status: "completed", percentage: 100 });
        queuesRef.current.delete(uploadMeta.videoId); // remove upload task from queue
      } catch (err) {
        console.error(`FAILED: Complete upload for videoId ${uploadMeta.videoId}`, err);
        updateUploadLocal(uploadMeta.videoId, { status: "failed" });
      }
    };

    queuesRef.current.set(uploadMeta.videoId, q);

    // request pending parts from server
    const {data: {data}} = await axios.get(`${evnConfig.BACKEND_ENDPOINT}/api/videos/pending-upload-parts/${uploadMeta.videoId}`, { withCredentials: true });
    const parts = data.parts || [];
    console.log(parts)

    // create pending items
    const items = parts.filter(p => p.status !== "COMPLETED").map(p => {
      const partSlice = sliceForPart(file, p.partNo);
      return {
        uploadId: uploadMeta.uploadId,
        partId: p.id,
        partNo: p.partNo,
        fileSlice: partSlice,
        size: partSlice.size,
        videoId: uploadMeta.videoId
      };
    });

    // initialize progress
    progressRef.current.set(uploadMeta.videoId, { uploadedBytes: parts.filter(p => p.status === "COMPLETED").reduce((s,p)=> s + Number(p.partSize), 0), totalBytes: file.size });

    q.enqueueMany(items);
    
    return q;
  }

  async function startUploadWithFile(videoId, file, newMeta = null) {
    // find upload meta
    const meta = newMeta || uploads.find(u => u.videoId === videoId);
    if (!meta) throw new Error("Upload metadata not found");

    // if queue is already present
    if (queuesRef.current.has(videoId)) {
      const q = queuesRef.current.get(videoId);
      q.resume();
    } else{
      //else create new queue and start
      await initQueue(meta, file);
    }

    // update server upload state
    await updateUploadStatusServer(videoId, "uploading");
    // update local
    updateUploadLocal(videoId, { status: "uploading" });
  }

  async function pauseUpload(videoId) {
    const q = queuesRef.current.get(videoId);
    if (q) q.pause(); // hard pause (abort in-flight)
    updateUploadLocal(videoId, { status: "paused" });

    // update server upload state
    await updateUploadStatusServer(videoId, "paused");
  }

  async function resumeUpload(videoId, file = null) {
    // check if queue is already present (in case page not refreshed)
    const q = queuesRef.current.get(videoId);
    if (q) {
      console.log("already queue is there")
      console.log("Queue items: ", q.queue.length)
      q.resume();
      updateUploadLocal(videoId, { status: "uploading" });
      // update server upload state
      await updateUploadStatusServer(videoId, "uploading");
      return;
    }

    if(!file)
      throw new Error("Please select the original file to resume upload")
    
    const upload = uploads.find(u => u.videoId === videoId);
    const checksum = await (async () => { try { return await getFileHash(file) } catch(e){ return null } })();
    if (upload && checksum !== upload.checkSum) {
      throw new Error("Selected file doesn't match original upload. Please select the correct file.");
    }
    console.log("started..")
    startUploadWithFile(videoId, file);
  }

  async function cancelUpload(videoId) {
    const q = queuesRef.current.get(videoId);
    if (q) q.cancelAll();
    try {
      await axios.delete(`${evnConfig.BACKEND_ENDPOINT}/api/videos/cancel-multipart-upload/${videoId}`, { withCredentials: true });
    } catch (err) { console.warn("Cancel API failed", err); }
    updateUploadLocal(videoId, { status: "aborted" });
  }

  // starting upload from a new file selection: create upload first
  async function createAndStartUpload(file) {
    const checksum = await (async () => { try { return await getFileHash(file) } catch(e){ return null } })();
    const { data } = await axios.post(`${evnConfig.BACKEND_ENDPOINT}/api/videos/create-multipart-upload-request`, { fileName: file.name, fileSize: file.size, contentType: file.type, checksum }, { withCredentials: true });
    const payload = data.data;

    let newMeta;
    if(payload.isExist) {
      await startUploadWithFile(payload.videoId, file);
      return;
    } else{
      newMeta = {
        videoId: payload.videoId,
        uploadId: payload.uploadId,
        checkSum: checksum,
        fileName: file.name,
        chunkSize: payload.chunkSize,
        totalParts: payload.totalParts,
        percentage: 0,
        status: "uploading"
      };
    }

    // refresh pending uploads
    setUploads(prev => [newMeta, ...prev]);

    // navigate to uploads page or let UI handle it
    await startUploadWithFile(payload.videoId, file, newMeta);
  }

  return {
    uploads,
    createAndStartUpload,
    startUploadWithFile, // resume with file
    pauseUpload,
    resumeUpload,
    cancelUpload
  };
}


