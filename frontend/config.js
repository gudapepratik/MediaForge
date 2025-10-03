const config =  {
    BACKEND_ENDPOINT: String(import.meta.env.VITE_APP_BACKEND_ENDPOINT),
    SOCKETIO_ENDPOINT: String(import.meta.env.VITE_APP_SOCKETIO_ENDPOINT)
}

export default config