import React, { useState } from 'react'
import UploadCard from '../components/UploadCard'
import UploadsContainer from '../components/UploadsContainer'
import TranscodesContainer from '../components/TranscodesContainer'
import { useUpload } from '../Hooks/useUpload';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import envConfig from '../../config';
// import { useUploadManager } from '../Hooks/useUploadManager';

function Uploads() {
  // const { uploads, setUploads } = useUpload();

  const [view, setView] = useState('uploads'); // uploads or transcodes
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const socket = io(envConfig.SOCKETIO_ENDPOINT, {
  //     reconnectionAttempts: 4,
  //     withCredentials: true,
  //   })

  //   socket.emit('registerUser', (res) => {
  //     if(res?.ok)
  //       console.log(`socketio Client joined user room`);
  //   })

  //   socket.on('transcode-started', (videoId, jobId) => {
  //     setUploads((uploads) =>
  //       uploads.map((u) =>
  //         u.videoId === videoId ? { ...u, status: 'transcoding', jobId } : u
  //       )
  //     );
  //   });

  //   return () => {
  //     socket.emit('leaveUserRoom');
  //     socket.close();
  //   }
  // }, []);

  return (
    <>
      <div className='w-[calc(75%)]'>
        <div className="w-full px-4 py-6 text-white">
          <div className="mb-4 flex items-center justify-between bg-zinc-700 p-4 rounded-md border-2 border-zinc-500">
            <h1 className="text-balance text-2xl font-semibold">Uploads</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="view-uploads"
                  checked={view === "uploads"}
                  onChange={(e) => setView(e.target.checked ? "uploads" : "transcodes")}
                  aria-label="Show pending uploads"
                  className="h-4 w-4 rounded accent-amber-600"
                />
                <label htmlFor="view-uploads" className="text-sm">Pending uploads</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="view-transcodes"
                  checked={view === "transcodes"}
                  onChange={(e) => setView(e.target.checked ? "transcodes" : "uploads")}
                  aria-label="Show pending transcodes"
                  className="h-4 w-4 rounded accent-amber-600"
                />
                <label htmlFor="view-transcodes" className="text-sm">Pending transcodes</label>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-md border p-8 text-center text-gray-500">
              Loading {view === "uploads" ? "pending uploads" : "pending transcodes"}…
            </div>
          ) : view === 'uploads' ? <UploadsContainer/> : <TranscodesContainer/>}
        </div>
      </div>
    </>
  )
}

export default Uploads