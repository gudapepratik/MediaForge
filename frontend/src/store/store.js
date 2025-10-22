import { configureStore } from "@reduxjs/toolkit";
import authSlice from './authSlice'
import feedSlice from './feedSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        videoFeed: feedSlice
    }
})