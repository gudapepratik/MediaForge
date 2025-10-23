import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
import config from "../../config";
import {toast} from 'sonner'

export const SocketContext = createContext(null);

export const SocketProvider = ({children}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(config.BACKEND_ENDPOINT, {
      withCredentials: true,
      reconnectionAttempts: 3
    })

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket client connected');
    })

    socket.on('disconnect', () => {
      console.log('Socket client disconnected');
    })
    
    socket.emit('joinUserRoom', (res) => {
      if(res?.ok) {
        console.log("Socket client joined User Room");
        setIsConnected(true);
      } else console.log('Error occurred while joining user Room');
    })

    socket.on('transcode-update', (data) => {
      const { videoId, stage, progress} = data
      if(!videoId) return;

      if(stage === "downloading" && progress === 5) {
        toast.info('Transcoding Started', {
          message: `Transcoding for ${videoId} has begun.`
        })  
        return;
      } 

      if(stage === "completed") {
        toast.success('Transcoding Complete', {
          message: `Video ${videoId} is ready to stream!`
        })  
        return;
      }

      if(stage === "failed") {
        toast.error('Transcoding Failed', {
          message: `Video ${videoId} encountered an error.`
        })  
        return;
      }
    })
    
    return () => {
      socket.emit('leaveUserRoom');
      socket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={{socket: socketRef.current, isConnected}}>
      {children}
    </SocketContext.Provider>
  )
}