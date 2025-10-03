import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";
import config from "../../config";
import { useSelector } from "react-redux";

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