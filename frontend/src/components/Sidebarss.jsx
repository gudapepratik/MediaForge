import React from 'react'
import { NavLink, useLocation } from 'react-router'

function Sidebarss() {
    const location = useLocation();
    const menus = [
        {
            label: "Home",
            to: '/'
        },
        {
            label: "Videos",
            to: '/videos'
        },
        {
            label: "Uploads",
            to: '/uploads'
        },
    ]

  return (
    <>
        <div className='w-1/5 h-screen bg-zinc-700 flex flex-col'>
            {menus.map((menu,k) => (
                <NavLink key={k} to={menu.to} className={`w-full ${location.pathname.startsWith(`/${menu.label.toLowerCase()}`) ? "bg-zinc-700": "bg-zinc-600"}  text-white py-4 hover:bg-zinc-800 text-center`}>
                    {menu.label}
                </NavLink>
            ))}
        </div>
    </>
  )
}

export default Sidebarss