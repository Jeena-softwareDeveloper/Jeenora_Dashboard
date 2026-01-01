// awarenessBannerSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- THUNKS -------------------- //

// Add Banner
export const addBanner = createAsyncThunk(
  'banner/add',
  async (info, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/banner-add', info, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.message ||
        'Failed to add banner'
      );
    }
  }
);

// Toggle banner status
export const toggleBannerStatus = createAsyncThunk(
  'awarenessBanner/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/awareness/banners/toggle-status/${id}`,
        {},
        { withCredentials: true }
      );
      return res.data.banner; // backend returns { banner, message }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.message ||
        'Failed to toggle status'
      );
    }
  }
);

// Get all banners
export const getBanners = createAsyncThunk(
  'banner/get',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/banners', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch banners'
      );
    }
  }
);

// Update banner
export const updateBanner = createAsyncThunk(
  'banner/update',
  async ({ id, info }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/banner-update/${id}`, info, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.message ||
        'Failed to update banner'
      );
    }
  }
);

// Delete banner
export const deleteBanner = createAsyncThunk(
  'banner/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/banner/${id}`, { withCredentials: true });
      return { deletedId: id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.message ||
        'Failed to delete banner'
      );
    }
  }
);

// -------------------- SLICE -------------------- //
const awarenessBannerSlice = createSlice({
  name: 'awarenessBanner',
  initialState: {
    loader: false,
    success: '',
    error: '',
    banners: [],
    banner: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setBanner: (state, action) => {
      state.banner = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add
    builder
      .addCase(addBanner.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(addBanner.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.banner = action.payload.banner;
        if (action.payload.banner) state.banners.push(action.payload.banner);
      })
      .addCase(addBanner.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      // Get
      .addCase(getBanners.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(getBanners.fulfilled, (state, action) => { state.loader = false; state.banners = action.payload.banners || []; })
      .addCase(getBanners.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      // Update
      .addCase(updateBanner.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.banner) {
          const index = state.banners.findIndex(b => b._id === action.payload.banner._id);
          if (index !== -1) state.banners[index] = action.payload.banner;
          if (state.banner && state.banner._id === action.payload.banner._id) state.banner = action.payload.banner;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      // Delete
      .addCase(deleteBanner.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.banners = state.banners.filter(b => b._id !== action.payload.deletedId);
        if (state.banner && state.banner._id === action.payload.deletedId) state.banner = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      // Toggle status
      .addCase(toggleBannerStatus.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.loader = false;
        state.success = 'Banner status updated';
        const index = state.banners.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.banners[index] = action.payload;
        if (state.banner && state.banner._id === action.payload._id) state.banner = action.payload;
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => { state.loader = false; state.error = action.payload; });
  }
});

export const { clearMessages, setBanner } = awarenessBannerSlice.actions;
export default awarenessBannerSlice.reducer;
