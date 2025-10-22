import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from 'axios'
import config from '../../config'

const initialState = {
  take: 2,
  idCursor: null,
  searchParam: null,
  loading: false,
  videos: []
}

export const fetchFeed = createAsyncThunk('feed/fetch', async (_, {getState}) => {
  try {
    const state = getState().videoFeed;
    const {take, idCursor, searchParam} = state;
    const url = `${config.BACKEND_ENDPOINT}/api/videos/get-public-videos/?take=${take}${idCursor ? `&idCursor=${idCursor}`: ""}${searchParam ? `&searchParam=${searchParam}`: ""}`;
    const {data} = await axios.get(url);

    return data.data;
  } catch (error) {
    console.log("Error fetching video feed")
    throw error
  }
})

const feedSlice = createSlice({
  name: 'videoFeed',
  initialState,
  reducers: {
    setSearchParam: (state, action) => {
      state.searchParam = action.payload
      state.videos = []
      state.idCursor = null
    },
    appendVideos: (state, action) => {
      state.videos.push(...action.payload.videos)
      state.idCursor = action.payload.idCursor
    }
  },
  extraReducers: (builder) => 
    builder
            .addCase(fetchFeed.pending, (state, action) => {
              state.loading = true
            })
            .addCase(fetchFeed.fulfilled, (state ,action) => {
              state.loading = false
              if(!state.idCursor) {
                // first load
                state.videos = action.payload.videos
              } else{
                // append on further loads
                state.videos.push(...action.payload.videos)
              }
              state.idCursor = action.payload.idCursor
            })
            .addCase(fetchFeed.rejected, (state, action) => {
              state.loading = false
            })
})

export const { setSearchParam, appendVideos } = feedSlice.actions;
export default feedSlice.reducer
