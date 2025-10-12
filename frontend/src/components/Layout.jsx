import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen bg-background text-foreground">
        {!isLoginPage && <AppSidebar />}

        <div className="flex-1 flex flex-col">
          {/* Navbar (with SidebarTrigger inside it) */}
          {!isLoginPage && (
            <header className="w-full sticky top-0 z-50">
              <Navbar />
            </header>
          )}

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;


{/* <div className="bg-zinc-800">
  {location.pathname !== "/login" && <Navbar />}
  <div className="flex">
    {location.pathname !== '/login' && <Sidebar/>}
    <Outlet />
  </div>
</div> */}