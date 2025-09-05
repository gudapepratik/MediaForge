import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {NavLink } from 'react-router'
import { logoutUser } from '../store/authSlice';
import VideoUpload from '../components/VideoUpload';

function Home() {
  const {isAuthenticated, isLoading, user} = useSelector(state => state.auth)
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logoutUser())
    alert('User logged out successfully')
  }

  if(isAuthenticated && isLoading) {
    <p>Logging out...</p>
  }

  return (
    <div className='h-1'>
      <h1>Welcome to the homepage</h1>
      {user && 
        <div>
          <p>Name: {user.name}</p>
          <p>email: {user.email}</p>
        </div>
      }

      {isAuthenticated ? 
        <button onClick={handleLogout}  className='p-4 bg-red-700 text-white '>Logout</button>
        : 
        <NavLink to={"/login"} className='p-4 bg-red-700 text-white '>Login</NavLink>
      }

      <VideoUpload/>
    </div>
  )
}

export default Home