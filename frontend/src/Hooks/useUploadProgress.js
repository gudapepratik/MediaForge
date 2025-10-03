import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import {io} from 'socket.io-client'
import envConfig from "../../config";

export function useUploadProgress({jobId}) {
  const [progress, setProgress] = useState(0);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateData, setUpdateData] = useState(null);
  const socketRef = useRef();
  
  useEffect(() => {
    if(!jobId) return;
    const socket = io(envConfig.SOCKETIO_ENDPOINT, {
      withCredentials: true,
      reconnectionAttempts: 4,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinTranscodeRoom', jobId, (res) => {
        if(res?.ok) {
          console.log(`Socketio client joined room ${jobId}`)
        } else{
          console.error("join failed", res);
        }
      })
    })

    socket.on('transcode-update', (data) => {
      if(!data) return;
      if(data.jobId !== jobId) return;

      setProgress(data.progress);
      setUpdateMessage(data.message);
      setUpdateData(data);

      if(data.stage === 'completed') {
        socket.emit('leaveJob', jobId);
      }
    })

    return () => {
      socket.emit('leaveJob', jobId);
      socket.close();
    }
  }, []);


  return {
    progress,
    updateData,
    updateMessage
  }
}