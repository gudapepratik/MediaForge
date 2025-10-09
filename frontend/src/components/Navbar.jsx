import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

function Navbar() {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );
  const {theme, setTheme} = useTheme();

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

  if (isAuthenticated && isLoading) {
    <p>Logging out...</p>;
  }

  return (
    <>
      <div className="h-[80px] w-full flex p-4 items-center justify-between bg-zinc-900 text-white">
        <h1 className="font-semibold text-3xl pl-[5%]">MediaForge</h1>

        {isAuthenticated ? (
          <div className="flex gap-4 items-center">  
          <button onClick={handleLogout} className="px-4 py-3 rounded-md bg-red-700 text-white">
            Logout
          </button>

          <p>{user && user.name}</p>
          </div>
        ) : (
          <NavLink to={"/login"} className="px-4 py-3 rounded-md bg-red-700 text-white">
            Login
          </NavLink>
        )}

        <Button onClick={handleThemeToggle}>Theme mode</Button>
      </div>
    </>
  );
}

export default Navbar;
