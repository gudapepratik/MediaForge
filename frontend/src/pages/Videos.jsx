import React, { useState } from 'react'
import VideoUpload from '../components/VideoUpload'
import VideoCard from '../components/VideoCard';

function Videos() {
  const [videos, setVideos] = useState([]);

  return (
    <>
      <div className='w-[calc(80%)] bg-zinc-500'>
        {/* TOP SECTION*/}
        <VideoUpload/>

        {/* VIDEOS SECTION */}
        <div className='w-full grid grid-cols-3 p-4 gap-4 h-screen '>
          {/* {videos.length > 0 && (
            videos.map((video, key) => (
              // <VideoCard video={video}/>
              <VideoCard/>
            ))
          )} */}
          <VideoCard/>
          <VideoCard/>
          <VideoCard/>
          <VideoCard/>
        </div>
      </div>
    </>
  )
}

export default Videos