// store/Reducers/Awareness/guideSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- THUNKS -------------------- //

// ---- Categories ---- //
export const addCategory = createAsyncThunk(
  'guide/category/add',
  async (name, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/category/add', { name }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to add category');
    }
  }
);

export const getCategories = createAsyncThunk(
  'guide/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/categories', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch categories');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'guide/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/category/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete category');
    }
  }
);

// ---- Guides ---- //
export const addGuide = createAsyncThunk(
  'guide/addGuide',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/guide/add', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true 
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to add guide');
    }
  }
);

export const getGuides = createAsyncThunk(
  'guide/getGuides',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/guides', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch guides');
    }
  }
);

export const updateGuide = createAsyncThunk(
  'guide/updateGuide',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/guide/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update guide');
    }
  }
);

export const deleteGuide = createAsyncThunk(
  'guide/deleteGuide',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/guide/delete/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete guide');
    }
  }
);

// Toggle Guide isActive
export const toggleGuideStatus = createAsyncThunk(
  'guide/toggleGuideStatus',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/awareness/guide/toggle-status/${id}`, {}, { withCredentials: true });
      return data; // returns updated guide
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// -------------------- SLICE -------------------- //
const guideSlice = createSlice({
  name: 'guide',
  initialState: {
    loader: false,
    success: '',
    error: '',
    categories: [],
    guides: [],
    currentGuide: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setCurrentGuide: (state, action) => {
      state.currentGuide = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(addCategory.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.category) state.categories.push(action.payload.category);
      })
      .addCase(addCategory.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(getCategories.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loader = false;
        state.categories = action.payload.categories || [];
      })
      .addCase(getCategories.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(deleteCategory.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.categories = state.categories.filter(c => c._id !== action.payload.deletedId);
      })
      .addCase(deleteCategory.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // Guides
    builder
      .addCase(addGuide.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(addGuide.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.guide) state.guides.push(action.payload.guide);
      })
      .addCase(addGuide.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(getGuides.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(getGuides.fulfilled, (state, action) => {
        state.loader = false;
        state.guides = action.payload.guides || [];
      })
      .addCase(getGuides.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(updateGuide.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(updateGuide.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.guide) {
          const index = state.guides.findIndex(g => g._id === action.payload.guide._id);
          if (index !== -1) state.guides[index] = action.payload.guide;
          if (state.currentGuide && state.currentGuide._id === action.payload.guide._id) {
            state.currentGuide = action.payload.guide;
          }
        }
      })
      .addCase(updateGuide.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(deleteGuide.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(deleteGuide.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.guides = state.guides.filter(g => g._id !== action.payload.deletedId);
        if (state.currentGuide && state.currentGuide._id === action.payload.deletedId) {
          state.currentGuide = null;
        }
      })
      .addCase(deleteGuide.rejected, (state, action) => { state.loader = false; state.error = action.payload; })

      .addCase(toggleGuideStatus.fulfilled, (state, { payload }) => {
        const index = state.guides.findIndex(g => g._id === payload.guide._id);
        if (index !== -1) state.guides[index] = payload.guide;
        state.success = payload.message;
      })
      .addCase(toggleGuideStatus.rejected, (state, { payload }) => {
        state.error = payload;
      });
  }
});

export const { clearMessages, setCurrentGuide } = guideSlice.actions;
export default guideSlice.reducer;
