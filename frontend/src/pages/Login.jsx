import React, { useEffect } from "react";
import {useNavigate, useSearchParams } from "react-router";
import envConfig from '../../config';
import { LoginForm } from "../components/login-form";

function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const loginStatus = searchParams.get('login_status')
  const isNewUser = searchParams.get('is_new_user') === 'true'

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

  const googleAuthSubmit = () => {
    window.location.href = `${envConfig.BACKEND_ENDPOINT}/api/auth/google`;
  }

  const emailAuthSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    const email = e.target[0].value;
    const password = e.target[1].value;
    console.log(email, password);
    alert('Yet to be implemented');
  }

  // <div>
  //   <button onClick={handleLoginRedirect}>Login with google</button>
  // </div>
  return (
    <>
      <div className="w-full h-screen bg-zinc-950 flex items-center justify-center">
        <LoginForm emailAuthSubmitHandler={emailAuthSubmit} googleAuthSubmitHandler={googleAuthSubmit}/>
      </div>
    </>
  );
}

export default Login;
