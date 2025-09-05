import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios'
import envConfig from '../../config'

// for email password login path
export const loginUser = createAsyncThunk('auth/loginUser', async (userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${envConfig.BACKEND_ENDPOINT}/api/auth/login`, userData);
        return response.data
    } catch (error) {
        return rejectWithValue.rejectWithValue(error.response.data);
    }
})

export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${envConfig.BACKEND_ENDPOINT}/api/auth/current`,{
            withCredentials: true
        })

        console.log("LOGIN STATUS: ", response)

        return response.data
    } catch (error) {
        return rejectWithValue(error.response.data)
    }
})

export const logoutUser =  createAsyncThunk('/auth/logout', async (_, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${envConfig.BACKEND_ENDPOINT}/api/auth/logout`,_,{
            withCredentials: true
        })

        return response.data
    } catch (error) {
        console.log(error)
        return rejectWithValue(error.response.data)
    }
})

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
        // logout: (state, action) => {
        //     state.isAuthenticated = false,
        //     state.user = null,
        //     state.isLoading = false,
        //     state.error = false
        // },
        authFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
            state.error = action.payload;
        },
    },
    extraReducers: (builder) =>
        builder
                .addCase(fetchUser.pending, (state) => {
                    state.isLoading = true;
                })
                .addCase(fetchUser.fulfilled, (state, action) => {
                    state.isAuthenticated = true
                    state.user = action.payload.data.user
                    state.isLoading = false
                    state.error = null
                })
                .addCase(fetchUser.rejected, (state, action) =>{
                    state.error = action.payload;
                    state.isAuthenticated = false
                    state.user = null
                    state.isLoading  = false
                })
                .addCase(logoutUser.pending, (state) => {
                    state.isLoading = true
                })
                .addCase(logoutUser.fulfilled, (state) => {
                    state.isAuthenticated = false,
                    state.isLoading = false,
                    state.role = null,
                    state.user = null
                })
                .addCase(logoutUser.rejected, (state, action) => {
                    state.isLoading = false,
                    state.error = action.payload?.data
                })
                .addCase(loginUser.pending, (state) => {
                    state.isLoading = true;
                })
                .addCase(loginUser.fulfilled, (state, action) => {
                    state.isAuthenticated = true
                    state.user = action.payload
                    state.isLoading = false
                    state.error = null
                })
                .addCase(loginUser.rejected, (state, action) =>{
                    state.error = action.payload;
                    state.isAuthenticated = false
                    state.user = null
                    state.isLoading  = false
                })
})


export const {login, authFailure, authStart} = authSlice.actions
export default authSlice.reducer