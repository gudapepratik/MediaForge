import React from "react";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router";

function Layout({ children }) {
  const location = useLocation();
  return (
    <>
      {location.pathname !== "/login" && <Navbar />}
      <Outlet />
    </>
  );
}

export default Layout;
