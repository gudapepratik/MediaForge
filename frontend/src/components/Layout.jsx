import React from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const location = useLocation();
  return (
    <>
      <div className="bg-zinc-800">
        {location.pathname !== "/login" && <Navbar />}
        <div className="flex">
          {location.pathname !== '/login' && <Sidebar/>}
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
