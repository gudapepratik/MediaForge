import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { NavLink, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DummyMaleAvatarImage } from "../assets/images/imageAssets";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Item } from "./ui/item";
import { BellRing, Icon, LogIn, Menu, Upload } from "lucide-react";
import SearchBar from "./SearchBar";
import { SidebarTrigger } from "./ui/sidebar";

function Navbar() {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );
  const [notifications, setNotifications] = useState([]);
  const {theme, setTheme} = useTheme();
  const navigate = useNavigate();

  const handleThemeToggle = () => {
    if(theme === 'light')
      setTheme('dark')
    else
      setTheme('light')
  }

  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logoutUser());
    alert("User logged out successfully");
  };

  const handleVideoUpload = () => {
    console.log("yet to be implemented")
  }

  if (isAuthenticated && isLoading) {
    <p>Logging out...</p>;
  }

  return (
    <>
      <div className="h-[80px] w-full flex p-0 md:p-4 items-center justify-between font-satoshi bg-background text-foreground border-b border-border ">
        <Item className={'flex-row items-center'}>
          <SidebarTrigger className={'w-8 h-8'}/>
          <h1 className="font-extrabold text-base md:text-xl">MediaForge</h1>
        </Item>
        

        {/* Search Bar  */}
        <Item className={'w-3/6 hidden md:flex'}>
          <SearchBar/>
        </Item>

        {/* Right Section  */}
        <Item className={'items-center justify-center'}>
          {/* Upload button  */}
          {isAuthenticated ? (
            <Button onClick={handleVideoUpload} className={'bg-accent hidden md:flex text-accent hover:text-white dark:text-white dark:hover:text-accent'}>
              <Upload/> Upload Video
            </Button>
          ): (
            <Button onClick={() => navigate('/login')} className={'bg-red-600 hidden md:flex text-white hover:bg-red-700'}>
              <LogIn/> Login / Signup
            </Button>
          )}
          
          {/* Notifications Section */}
          <DropdownMenu>
            {/* Trigger */}
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-full hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring">
                <BellRing className="h-6 w-6" />
                {notifications?.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-600 ring-1 ring-background" />
                )}
              </button>
            </DropdownMenuTrigger>

            {/* Dropdown Content */}
            <DropdownMenuContent
              align="end"
              className="w-72 max-h-[60vh] overflow-y-auto"
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications?.length > 0 ? (
                notifications.map((notification, index) => (
                  <DropdownMenuItem key={index} className="break-words">
                    {notification.message}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-muted-foreground">
                  No notifications yet
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <Button onClick={handleThemeToggle}>Theme mode</Button> */}
          <DropdownMenu className="font-satoshi">
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border border-muted">
                <AvatarImage src={user?.avatar || DummyMaleAvatarImage} />
                <AvatarFallback>
                  {user?.name ? user.name[0].toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {/* Account Section */}
              <DropdownMenuItem>Account</DropdownMenuItem>

              {/* Appearance Section */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Appearance: <span className="ml-1 capitalize">{theme}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={theme === "light" ? "bg-accent text-accent-foreground" : ""}
                  >
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}
                  >
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={theme === "system" ? "bg-accent text-accent-foreground" : ""}
                  >
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Settings Section */}
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem disabled={!isAuthenticated} onClick={handleLogout} className={'bg-red-600 hover:!bg-red-700 text-white focus:!bg-red-700 focus:!text-white"'}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Item>
      </div>
    </>
  );
}

export default Navbar;
