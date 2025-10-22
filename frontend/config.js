const config =  {
    BACKEND_ENDPOINT: String(import.meta.env.VITE_APP_BACKEND_ENDPOINT),
    R2_PUBLIC_URL: String(import.meta.env.VITE_APP_R2_PUBLIC_URL),
    SOCKETIO_ENDPOINT: String(import.meta.env.VITE_APP_SOCKETIO_ENDPOINT)
}

export default config