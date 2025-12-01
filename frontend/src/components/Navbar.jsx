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
import UploadVideoDialog from "./UploadVideoDialog";

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
      <nav className="w-full fixed top-0 left-0 z-50 bg-background text-foreground border-b border-border">
        <div className="flex items-center justify-between px-3 md:pr-6 h-16 md:h-20 font-satoshi">
          {/* Left Section */}
          <Item className="flex-row items-center gap-3">
            <SidebarTrigger className="w-8 h-8" />
            <NavLink to={'/'} className={'font-extrabold text-lg md:text-2xl'}>MediaForge</NavLink>
          </Item>

          {/* Search Bar */}
          <Item className="hidden md:flex w-1/3">
            <SearchBar />
          </Item>

          {/* Right Section */}
          <Item className="items-center justify-end gap-3">
            {isAuthenticated ? (
              <UploadVideoDialog/>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="hidden md:flex bg-red-600 text-white hover:bg-red-700"
              >
                <LogIn /> Login / Signup
              </Button>
            )}

            {/* Notifications */}
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring">
                  <BellRing className="h-6 w-6" />
                  {notifications?.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-600 ring-1 ring-background" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-[60vh] overflow-y-auto">
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
            </DropdownMenu> */}

            {/* Avatar */}
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
                <DropdownMenuItem onClick={() => navigate('/account')}>Account</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Appearance: <span className="ml-1 capitalize">{theme}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {["light", "dark", "system"].map((mode) => (
                      <DropdownMenuItem
                        key={mode}
                        onClick={() => setTheme(mode)}
                        className={theme === mode ? "bg-accent text-accent-foreground" : ""}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {!isAuthenticated ? (
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="md:hidden bg-red-600 hover:!bg-red-700 text-white focus:!bg-red-700"
                  >
                    Sign in
                  </DropdownMenuItem>
                ): (
                  <DropdownMenuItem
                    disabled={!isAuthenticated}
                    onClick={handleLogout}
                    className="bg-red-600 hover:!bg-red-700 text-white focus:!bg-red-700"
                  >
                    Sign out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </Item>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
