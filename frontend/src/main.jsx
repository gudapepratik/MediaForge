import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store.js";
import { useEffect } from "react";
import { fetchUser } from "./store/authSlice.js";
import {createRoutesFromElements, Route, RouterProvider} from 'react-router'
import {createBrowserRouter} from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from "./pages/Home.jsx";
import Login from './pages/Login.jsx'
import Uploads from './pages/Uploads.jsx'
import Videos from './pages/MyVideos.jsx'
import {UploadProvider} from './contexts/UploadContext.jsx'
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import WatchVideo from "./pages/WatchVideo.jsx";
import Account from "./pages/Account";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout/>}>
      <Route index element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/watch" element={<WatchVideo/>}/>
      {/* <Route path="/login" element={<LoginForm/>}/> */}
      <Route path="/uploads" element={<Uploads/>}/>
      <Route path="/videos" element={<Videos/>}/>
      <Route path="/account" element={<Account/>}/>
    </Route>
  )
)

const CheckAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        dispatch(fetchUser());
      } catch (error) {
        console.log("User Not logged in");
      }
    };
    checkUserSession();
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <CheckAuth>
          <UploadProvider>
            <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
              <RouterProvider router={router}/>
            </ThemeProvider>
          </UploadProvider>
        </CheckAuth>
      </SocketProvider>
    </Provider>
  </StrictMode>
);
