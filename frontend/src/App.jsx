import axios from "axios"

function App() {

  const handleLogin = async () => {
    //redirect user
    window.location.href = "http://localhost:3000/auth/google"
  }

  return (
    <>
      <button onClick={handleLogin}>Login with google</button>
    </>
  )
}

export default App
