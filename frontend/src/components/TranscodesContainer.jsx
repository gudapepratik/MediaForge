import axios from 'axios';
import React, { useEffect, useState } from 'react'
import config from '../../config';
import { io } from 'socket.io-client';

function TranscodesContainer() {
  const [videos, setVideos] = useState([]);

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

    // socketio client
    const socket = io(config.BACKEND_ENDPOINT, {
      withCredentials: true,
      reconnectionAttempts: 3
    })
    console.log(socket);

    socket.emit('registerUser', (res) => {
      if(res?.ok) console.log("Client joined user room");
      console.log(res);
    })

    socket.on('transcode-started', (videoId, jobId) => {
      if(!videoId || !jobId) return;


    })

    return () => {
      socket.emit('leaveUserRoom');
      socket.close();
    }
  }, [])
  
  return (
    <>
      <div className='w-full bg-red-100'>
        Transcoding section
      </div>
    </>
  )
}

export default TranscodesContainer