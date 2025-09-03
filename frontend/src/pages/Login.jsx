import React from 'react'

function Login() {

  const handleLoginRedirect = () => {
    window.location.href = "http://localhost:3000/auth/google";
  }

  return (
    <div>
      <button onClick={handleLoginRedirect}>Login with google</button>
    </div>
  )
}

export default Login