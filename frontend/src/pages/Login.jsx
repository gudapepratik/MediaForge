import React, { useEffect } from "react";
import {useNavigate, useSearchParams } from "react-router";
import envConfig from '../../config';

function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const loginStatus = searchParams.get('login_status')
  const isNewUser = searchParams.get('is_new_user') === 'true'

  const handleLoginRedirect = () => {
    window.location.href = `${envConfig.BACKEND_ENDPOINT}/api/auth/google`;
  };

  useEffect(() => {
    console.log(loginStatus, isNewUser)
    if(loginStatus === 'true' && !isNewUser) {
      alert("Login Success!! redirecting to home....");
      setTimeout(() => {
        navigate("/"); // home page after 2 seconds
      }, 2000);
    } else if (loginStatus === 'true' && isNewUser) {
      alert("New User created and Logged in successfully!! redirecting to home....");
      setTimeout(() => {
        navigate("/"); // home page after 2 seconds
      }, 2000);
    } else if(loginStatus === 'false') {
      alert("login error, please try again..")
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <button onClick={handleLoginRedirect}>Login with google</button>
    </div>
  );
}

export default Login;
