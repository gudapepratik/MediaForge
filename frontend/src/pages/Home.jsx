import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {NavLink } from 'react-router'
import HomeVideoSkeleton from '../components/skeletons/HomeVideoSkeleton'
import HomeVideoCard from '../components/HomeVideoCard'

function Home() {
  const {isAuthenticated, isLoading, user} = useSelector(state => state.auth)

  return (
    <div className='h-screen p-4 md:p-6 bg-background text-white'>
      {/* <h1>Welcome to the homepage</h1> */}
      {user && 
        <div>
          <p>Name: {user.name}</p>
          <p>email: {user.email}</p>
        </div>
      }
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center  p-2 md:p-4">
        {/* <HomeVideoSkeleton /> */}
        <HomeVideoCard/>
        <HomeVideoSkeleton />
        <HomeVideoSkeleton />
        <HomeVideoSkeleton />
        <HomeVideoSkeleton />
        <HomeVideoSkeleton />
      </div>

      {/* <VideoUpload/> */}
    </div>
  )
}

export default Home