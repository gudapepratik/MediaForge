import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {NavLink } from 'react-router'
import HomeVideoSkeleton from '../components/skeletons/HomeVideoSkeleton'
import HomeVideoCard from '../components/HomeVideoCard'
import InfiniteScroll from 'react-infinite-scroll-component'
import axios from 'axios'
import config from '../../config'
import { fetchFeed } from '../store/feedSlice'

function Home() {
  const {loading, videos, idCursor} = useSelector(state => state.videoFeed)
  const dispatch = useDispatch();

  // Fetch first page on mount
  useEffect(() => {
    if (videos.length === 0) {
      dispatch(fetchFeed());
    }
  }, [dispatch]);

  // Load next page when user scrolls down
  const fetchMoreData = () => {
    if (!loading && idCursor) {
      dispatch(fetchFeed());
    }
  };

  // return (
  //   <div className='h-screen p-4 md:p-6 bg-background text-white'>
  //     <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center  p-2 md:p-4">
  //       {/* <HomeVideoSkeleton /> */}
  //       <HomeVideoCard/>
  //       <HomeVideoSkeleton />
  //       <HomeVideoSkeleton />
  //       <HomeVideoSkeleton />
  //       <HomeVideoSkeleton />
  //       <HomeVideoSkeleton />
  //     </div>

  //     {/* <VideoUpload/> */}
  //   </div>
  // )
  return (
    <div className="h-screen p-4 md:p-6 bg-background text-white">
      <InfiniteScroll
        dataLength={videos.length}
        next={fetchMoreData}
        hasMore={!!idCursor} 
        loader={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-2 md:p-4">
            {[...Array(3)].map((_, i) => (
              <HomeVideoSkeleton key={i} />
            ))}
          </div>
        }
        endMessage={
          <p className="text-center mt-4 text-gray-400">No more videos to load</p>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center p-2 md:p-4">
          {videos.map((v) => (
            <HomeVideoCard key={v.id} video={v} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default Home