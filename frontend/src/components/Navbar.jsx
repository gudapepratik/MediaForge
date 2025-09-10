import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";
import { NavLink } from "react-router";

function Navbar() {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );

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
      <div className="h-[80px] w-full flex p-4 items-center justify-between bg-red-200">
        <h1>MediaForge</h1>

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
      </div>
    </>
  );
}

export default Navbar;
