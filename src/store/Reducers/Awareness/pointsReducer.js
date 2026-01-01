// awarenessPointsSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../../api/api'

// -------------------- THUNKS -------------------- //

// Fetch points
export const getPoints = createAsyncThunk(
  'points/getPoints',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('awareness/point-list', { withCredentials: true })
      return res.data.points
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || 'Failed to fetch Points'
      )
    }
  }
)

// Update points
export const updatePoints = createAsyncThunk(
  'points/updatePoints',
  async (pointsData, { rejectWithValue }) => {
    try {
      const res = await api.post('awareness/set-points', pointsData, { withCredentials: true })
      return res.data.points
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

// -------------------- SLICE -------------------- //
const awarenessPointsSlice = createSlice({
  name: 'awarenessPoints',
  initialState: {
    loader: false,
    success: '',
    error: '',
    points: {
      members: 0,
      guides: 0,
      farmersHelped: 0,
      expertAdvisors: 0,
      success: 0,
      localFarmersSupport: 0,
      localCommunity: 0,
      localSources: 0,
    },
  },
  reducers: {
    clearMessages: (state) => {
      state.success = ''
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    // GET Points
    builder
      .addCase(getPoints.pending, (state) => {
        state.loader = true
        state.error = ''
      })
      .addCase(getPoints.fulfilled, (state, action) => {
        state.loader = false
        state.points = { ...state.points, ...action.payload }
      })
      .addCase(getPoints.rejected, (state, action) => {
        state.loader = false
        state.error = action.payload
      })

    // UPDATE Points
      .addCase(updatePoints.pending, (state) => {
        state.loader = true
        state.error = ''
      })
      .addCase(updatePoints.fulfilled, (state, action) => {
        state.loader = false
        state.success = 'Points updated successfully'
        state.points = { ...state.points, ...action.payload }
      })
      .addCase(updatePoints.rejected, (state, action) => {
        state.loader = false
        state.error = action.payload
      })
  },
})

export const { clearMessages } = awarenessPointsSlice.actions
export default awarenessPointsSlice.reducer
