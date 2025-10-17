import React, { useState } from 'react'
import VideoUpload from '../components/VideoUpload'
import VideoCard from '../components/VideoCard';
import { useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import VideoPlayer from '../components/VideoPlayer';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const hlsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    preload: "auto",
  };

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const {data} = await axios.get(`${config.BACKEND_ENDPOINT}/api/videos/get-ready-videos`, {
        withCredentials: true
      })
      console.log(data.data.videos);
      const videosData = data.data.videos?.map((video) => ({...video, hlsOptions: {...hlsOptions, sources: [{src: `https://pub-b462f8f0e6784b8fbdbfca6e0cd1d5cb.r2.dev/${video.storageKey}`, type: 'application/x-mpegURL'}]}}))
      console.log(videosData);
      setVideos(videosData);

    } catch (error) {
      console.log('Error fetching videos', error);
    } finally{
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <>
      <div className='w-full h-screen p-4 md:p-6 bg-background text-white'>
        {/* TOP SECTION*/}
        {/* <VideoUpload/> */}

        {isLoading ? (
          <Badge>
            <Spinner/> Loading
          </Badge>
        ): (
          <div className='w-full grid grid-cols-3 p-4 gap-4 '>
            {videos && (
              videos.map((video, key) => (
                <VideoPlayer variant='compact' key={key} videoUrl={video.hlsOptions.sources[0].src} title={video.fileName} />
              ))
            )}
          </div>
        )}

        {/* <VideoCard key={key} video={video} options={video.hlsOptions}/> */}
      </div>
    </>
  )
}

export default Videos