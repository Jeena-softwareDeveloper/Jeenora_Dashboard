import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- THUNKS -------------------- //

// Add Video
export const addVideo = createAsyncThunk(
  'video/add',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/video-add', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to add video');
    }
  }
);

// Get all Videos
export const getVideos = createAsyncThunk(
  'video/get',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/videos', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch videos');
    }
  }
);

// Update Video
export const updateVideo = createAsyncThunk(
  'video/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/video/update/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update video');
    }
  }
);

// Delete Video
export const deleteVideo = createAsyncThunk(
  'video/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/video/delete/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete video');
    }
  }
);

// Toggle Video Status
export const toggleVideoStatus = createAsyncThunk(
  'video/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/awareness/video/toggle-status/${id}`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update status');
    }
  }
);

// -------------------- SLICE -------------------- //
const videoSlice = createSlice({
  name: 'video',
  initialState: {
    loader: false,
    success: '',
    error: '',
    videos: [],
    video: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setVideo: (state, action) => {
      state.video = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Video
      .addCase(addVideo.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(addVideo.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.organicVideo) state.videos.push(action.payload.organicVideo);
      })
      .addCase(addVideo.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Get Videos
      .addCase(getVideos.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(getVideos.fulfilled, (state, action) => {
        state.loader = false;
        state.videos = action.payload.videos || [];
      })
      .addCase(getVideos.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Update Video
      .addCase(updateVideo.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.organicVideo) {
          const index = state.videos.findIndex(v => v._id === action.payload.organicVideo._id);
          if (index !== -1) state.videos[index] = action.payload.organicVideo;
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Delete Video
      .addCase(deleteVideo.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.videos = state.videos.filter(v => v._id !== action.payload.deletedId);
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleVideoStatus.fulfilled, (state, action) => {
        const updatedVideo = action.payload?.video;
        if (updatedVideo) {
          const index = state.videos.findIndex(v => v._id === updatedVideo._id);
          if (index !== -1) state.videos[index] = updatedVideo;
          state.success = action.payload.message || 'Status updated';
        }
      })
      .addCase(toggleVideoStatus.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update status';
      });
  }
});

export const { clearMessages, setVideo } = videoSlice.actions;
export default videoSlice.reducer;
