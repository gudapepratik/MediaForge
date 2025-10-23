import React, { useState } from 'react'
import VideoUpload from '../components/VideoUpload'
import VideoCard from '../components/VideoCard';
import { useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import VideoPlayer from '../components/VideoPlayer';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import HomeVideoCard from '../components/HomeVideoCard';

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 2;

  const hlsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    preload: "auto",
  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const fetchVideos = async (page) => {
    try {
      setIsLoading(true);
      const url = `${config.BACKEND_ENDPOINT}/api/videos/get-ready-videos?take=${limit}&page=${page}`
      const {data} = await axios.get(url, {
        withCredentials: true
      })
      console.log(data.data.videos);
      // const videosData = data.data.videos?.map((video) => ({...video, hlsOptions: {...hlsOptions, sources: [{src: `https://pub-b462f8f0e6784b8fbdbfca6e0cd1d5cb.r2.dev/${video.storageKey}`, type: 'application/x-mpegURL'}]}}))
      // console.log(videosData);
      setVideos(data.data.videos);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.log('Error fetching videos', error);
    } finally{
      setIsLoading(false);
    }
  }


  return (
    <>
      <div className='w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] max-h-screen flex flex-col justify-between p-4 md:p-6 bg-background text-white'>
      
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center p-2 md:p-4'>
          {videos.map((video, key) => (
            <HomeVideoCard video={video} key={video?.id}/>
          ))}
        </div>

        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick = {() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className={`cursor-pointer`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick = {() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  )
}

export default Videos