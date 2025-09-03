import React from 'react'
import {NavLink } from 'react-router'

function Home() {
  return (
    <div className='h-1'>
      <h1>Welcome to the homepage</h1>
      
      <NavLink to={"/login"} className='p-4 bg-red-700 text-white '>Login</NavLink>
    </div>
  )
}

export default Home