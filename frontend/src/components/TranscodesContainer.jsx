// import axios from 'axios';
// import React, { useEffect, useState } from 'react'
// import config from '../../config';
// import { io } from 'socket.io-client';
// import {useSocket} from '../Hooks/useSocket'

// function TranscodesContainer() {
//   const [videos, setVideos] = useState([]);
//   const {socket, isConnected} = useSocket();

//   const fetchPendingTranscodes = async () => {
//     try {
//       const {data} = await axios.get(`${config.BACKEND_ENDPOINT}/api/videos/pending-transcodes`, {
//         withCredentials: true
//       })

//       console.log(data.data.videos);
//       setVideos(data.data.videos);
//     } catch (error) {
//       console.log('Error fetching pending transcodes', error);
//     }
//   }

//   useEffect(() => {
//     fetchPendingTranscodes();

//     if(!isConnected) return;

//     socket.on('transcode-update', (data) => {
//       // update the data
//       const {videoId, stage, progress, message, metadata} = data;
//       console.log(`new update on video ${videoId}`);

//       if(!videoId) return;

//       if(stage === 'started') {
//         setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'PROCESSING',stage, progress, message} : v))
//         return;
//       }

//       if(stage === 'failed') {
//         setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'FAILED',stage, progress, message} : v))
//         return;
//       }

//       if(stage === 'completed') {
//         setVideos(videos => videos.map(v => v.id === videoId ? {...v, status: 'READY', storageKey: metadata.key, stage, progress, message} : v))
//         // move this video to /videos section i.e. remove from here after ~ 4 sec
//         setTimeout(() => {
//           setVideos(videos => videos.filter(v => v.id !== videoId));
//         }, 4000);
        
//         // now user can go to /videos section
//         return;
//       }

//       setVideos(videos => videos.map(v => v.id === videoId ? {...v,stage, progress, message} : v))
//     })
//   }, [])

//   const onCancel = (videoId) => {
//     console.log('Yet to be implemented!')
//   }
  
//   return (
//     <>
//       <div className='w-full grid grid-cols-3 gap-3'>
//         {videos.map((video) => (
//           <div key={video.id} className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
//             {/* Thumbnail */}
//             <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
//               {/* <Video className="w-12 h-12 text-gray-400" /> */}
//               {video.progress !== undefined && video.progress < 100 && (
//                 <div className="absolute bottom-0 left-0 w-full bg-gray-200 h-1">
//                   <div
//                     className="bg-blue-500 h-1 transition-all duration-300"
//                     style={{ width: `${video.progress}%` }}
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Content */}
//             <div className="p-4">
//               <div className="flex items-start justify-between">
//                 <h2 className="text-base font-semibold text-gray-800 truncate max-w-[70%]">
//                   {video.fileName}
//                 </h2>
//                 <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
//                   {video.contentType.split("/")[1]}
//                 </span>
//               </div>

//               {/* Metadata */}
//               <div className="mt-2 space-y-1 text-sm text-gray-600">
//                 <p><span className="font-medium text-gray-700">Size:</span> {(video.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
//                 <p>
//                   <span className="font-medium text-gray-700">Status:</span>
//                   <span
//                     className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
//                       video.status === "READY"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {video.status}
//                   </span>
//                 </p>
//                 <p><span className="font-medium text-gray-700">Created:</span> {new Date(video.createdAt).toLocaleString()}</p>
//               </div>

//               {/* Realtime updates */}
//               {video.stage && (
//                 <div className="mt-3 space-y-1">
//                   <p className="text-sm text-gray-700">
//                     <span className="font-medium">Stage:</span> {video.stage}
//                   </p>
//                   {video.message && (
//                     <p className="text-sm text-gray-500 italic">{video.message}</p>
//                   )}
//                 </div>
//               )}

//               {/* Actions */}
//               {video.status !== "UPLOADED" && (
//                 <div className="mt-4 flex justify-end">
//                   <button
//                     onClick={() => onCancel(video.id)}
//                     className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </>
//   )
// }

// export default TranscodesContainer

import React, { useEffect, useState } from "react"
import axios from "axios"
import config from "../../config"
import { useSocket } from "../Hooks/useSocket"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

export default function TranscodesContainer() {
  const [videos, setVideos] = useState([])
  const { socket, isConnected } = useSocket()

  const fetchPendingTranscodes = async () => {
    try {
      const { data } = await axios.get(
        `${config.BACKEND_ENDPOINT}/api/videos/pending-transcodes`,
        { withCredentials: true }
      )
      setVideos(data.data.videos)
    } catch (error) {
      console.error("Error fetching pending transcodes", error)
    }
  }

  useEffect(() => {
    fetchPendingTranscodes()
    if (!isConnected) return

    socket.on("transcode-update", (data) => {
      const { videoId, stage, progress, message, metadata } = data
      if (!videoId) return

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? {
                ...v,
                stage,
                progress,
                message,
                status:
                  stage === "failed"
                    ? "FAILED"
                    : stage === "completed"
                    ? "READY"
                    : "PROCESSING",
                storageKey:
                  stage === "completed" ? metadata?.key : v.storageKey,
              }
            : v
        )
      )

      if (stage === "completed") {
        setTimeout(() => {
          setVideos((v) => v.filter((vid) => vid.id !== videoId))
        }, 4000)
      }
    })

    return () => socket.off("transcode-update")
  }, [isConnected])

  const getStatusBadge = (status) => {
    switch (status) {
      case "READY":
        return (
          <Badge variant="outline" className="border-green-400 text-green-400">
            Ready
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="outline" className="border-red-400 text-red-400">
            Failed
          </Badge>
        )
      case "PROCESSING":
        return (
          <Badge
            variant="outline"
            className="border-blue-400 text-blue-400"
          >
            Processing
          </Badge>
        )
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const onCancel = (videoId) => {
    console.log("Cancel yet to be implemented:", videoId)
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="bg-card text-card-foreground border border-border rounded-xl hover:shadow-md transition"
        >
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="w-28 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  No Thumbnail
                </span>
              )}
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              <CardTitle className="text-base truncate">
                {video.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            {getStatusBadge(video.status)}
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Progress Bar */}
            {video.status !== "READY" && video.progress !== undefined && (
              <div className="space-y-1">
                <Progress value={video.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{video.message}</span>
                  <span>{video.progress.toFixed(0)}%</span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Type:</span>{" "}
                {video.contentType.split("/")[1]}
              </p>
              <p>
                <span className="font-medium text-foreground">Created:</span>{" "}
                {new Date(video.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Realtime Info */}
            {video.stage && (
              <div className="text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Stage:</span>{" "}
                  {video.stage}
                </p>
                {!video.message && (
                  <p className="italic text-blue-600">{video.message}</p>
                )}
              </div>
            )}

            {/* Actions */}
            {video.status !== "READY" && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => onCancel(video.id)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
