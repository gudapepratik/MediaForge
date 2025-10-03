import axios from 'axios';
import React, { useEffect, useState } from 'react'
import config from '../../config';
import { io } from 'socket.io-client';
import {useSocket} from '../Hooks/useSocket'

function TranscodesContainer() {
  const [videos, setVideos] = useState([]);
  const {socket, isConnected} = useSocket();

  const fetchPendingTranscodes = async () => {
    try {
      const {data} = await axios.get(`${config.BACKEND_ENDPOINT}/api/videos/pending-transcodes`, {
        withCredentials: true
      })

      console.log(data.data.videos);
      setVideos(data.data.videos);
    } catch (error) {
      console.log('Error fetching pending transcodes', error);
    }
  }

  useEffect(() => {
    fetchPendingTranscodes();

    if(!isConnected) return;

    socket.on('transcode-update', (data) => {
      // update the data
      const {videoId, stage, progress, message, metadata} = data;
      console.log(`new update on video ${videoId}`);

      if(!videoId) return;

      if(stage === 'started') {
        setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'PROCESSING',stage, progress, message} : v))
        return;
      }

      if(stage === 'failed') {
        setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'FAILED',stage, progress, message} : v))
        return;
      }

      if(stage === 'completed') {
        setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'READY', storageKey: metadata.key, stage, progress, message} : v))
        // move this video to /videos section i.e. remove from here after ~ 4 sec
        setTimeout(() => {
          setVideos(videos => videos.filter(v => v.id !== videoId));
        }, 4000);
        return;
      }

      setVideos(videos => videos.map(v => v.id === videoId ? {...v,stage, progress, message} : v))
    })
  }, [])

  const onCancel = (videoId) => {

  }
  
  return (
    <>
      <div className='w-full grid grid-cols-3 gap-3'>
        {videos.map((video, key) => (
          <div key={video.id} className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
            {/* Thumbnail */}
            <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
              {/* <Video className="w-12 h-12 text-gray-400" /> */}
              {video.progress !== undefined && video.progress < 100 && (
                <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-1">
                  <div
                    className="bg-blue-500 h-1 transition-all duration-300"
                    style={{ width: `${video.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-gray-800 truncate max-w-[70%]">
                  {video.fileName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {video.contentType.split("/")[1]}
                </span>
              </div>

              {/* Metadata */}
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Size:</span> {(video.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
                <p>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      video.status === "READY"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {video.status}
                  </span>
                </p>
                <p><span className="font-medium text-gray-700">Created:</span> {new Date(video.createdAt).toLocaleString()}</p>
              </div>

              {/* Realtime updates */}
              {video.stage && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Stage:</span> {video.stage}
                  </p>
                  {video.message && (
                    <p className="text-sm text-gray-500 italic">{video.message}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              {video.status !== "UPLOADED" && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => onCancel(video.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default TranscodesContainer