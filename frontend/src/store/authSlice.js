import { createSlice } from "@reduxjs/toolkit";

const initialUser = {
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: null,
    error: null
}

const authSlice = createSlice({
    initialState: initialUser,
    name: "auth",
    reducers: {
        authStart: (state, action) => {
            state.isLoading = true,
            state.error = null
        },
        login: (state, action) => {
            state.isAuthenticated = true,
            state.user = action.payload,
            state.isLoading = false,
            state.error = false
        },
        logout: (state, action) => {
            state.isAuthenticated = false,
            state.user = null,
            state.isLoading = false,
            state.error = false
        },
        authFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
            state.error = action.payload;
        },
    }
})

export const {login, logout, authFailure, authStart} = authSlice.actions
export default authSlice.reducer