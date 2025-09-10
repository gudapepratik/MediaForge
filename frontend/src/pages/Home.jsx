import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {NavLink } from 'react-router'

function Home() {
  const {isAuthenticated, isLoading, user} = useSelector(state => state.auth)

  return (
    <div className='w-[calc(100%-25%)] h-screen bg-zinc-500 text-white'>
      <h1>Welcome to the homepage</h1>
      {user && 
        <div>
          <p>Name: {user.name}</p>
          <p>email: {user.email}</p>
        </div>
      }

      {/* <VideoUpload/> */}
    </div>
  )
}

export default Home