import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- THUNKS -------------------- //

// Add Image
export const addImage = createAsyncThunk(
  'image/add',
  async (info, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!info.heading?.trim() || !info.description?.trim() || !info.miniDescription?.trim()) {
        return rejectWithValue('Heading, description, and mini description are required');
      }
      if (!info.image) {
        return rejectWithValue('Image file is required');
      }

      const formData = new FormData();
      formData.append('heading', info.heading);
      formData.append('description', info.description);
      formData.append('miniDescription', info.miniDescription);
      formData.append('image', info.image);
      // Convert boolean to string for backend
      if (info.isActive !== undefined) formData.append('isActive', String(info.isActive));

      const res = await api.post('/awareness/image-add', formData, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || 'Failed to add image'
      );
    }
  }
);


// Get Images
export const getImages = createAsyncThunk(
  'image/get',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/images', { withCredentials: true });
      return res.data.images;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch images');
    }
  }
);

// Update Image
export const updateImage = createAsyncThunk(
  'image/update',
  async ({ id, info }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (info.heading) formData.append('heading', info.heading);
      if (info.description) formData.append('description', info.description);
      if (info.miniDescription) formData.append('miniDescription', info.miniDescription);
      if (info.image) formData.append('image', info.image);
      if (info.isActive !== undefined) formData.append('isActive', info.isActive);

      const res = await api.put(`/awareness/image-update/${id}`, formData, { withCredentials: true });
      return res.data.image;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update image');
    }
  }
);

// Delete Image
export const deleteImage = createAsyncThunk(
  'image/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/image/${id}`, { withCredentials: true });
      return id; // return deleted ID
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete image');
    }
  }
);

// Toggle Image Status
export const toggleImageStatus = createAsyncThunk(
  'image/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/awareness/images/toggle-status/${id}`, {}, { withCredentials: true });
      return res.data.image;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to toggle status');
    }
  }
);

// -------------------- SLICE -------------------- //
const awarenessImageSlice = createSlice({
  name: 'awarenessImage',
  initialState: {
    loader: false,
    success: '',
    error: '',
    images: [],
    image: null
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
  },
  extraReducers: (builder) => {
    const updateImageInState = (images, updatedImage) => {
      const index = images.findIndex(img => img._id === updatedImage._id);
      if (index !== -1) images[index] = updatedImage;
    };

    // ADD
    builder
      .addCase(addImage.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(addImage.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.image) state.images.push(action.payload.image);
      })
      .addCase(addImage.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // GET
    builder
      .addCase(getImages.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(getImages.fulfilled, (state, action) => { state.loader = false; state.images = action.payload; })
      .addCase(getImages.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // UPDATE
    builder
      .addCase(updateImage.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(updateImage.fulfilled, (state, action) => {
        state.loader = false;
        state.success = 'Image updated successfully';
        updateImageInState(state.images, action.payload);
        if (state.image && state.image._id === action.payload._id) state.image = action.payload;
      })
      .addCase(updateImage.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // DELETE
    builder
      .addCase(deleteImage.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loader = false;
        state.success = 'Image deleted successfully';
        state.images = state.images.filter(img => img._id !== action.payload);
        if (state.image && state.image._id === action.payload) state.image = null;
      })
      .addCase(deleteImage.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // TOGGLE STATUS
    builder
      .addCase(toggleImageStatus.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(toggleImageStatus.fulfilled, (state, action) => {
        state.loader = false;
        state.success = 'Image status updated';
        updateImageInState(state.images, action.payload);
        if (state.image && state.image._id === action.payload._id) state.image = action.payload;
      })
      .addCase(toggleImageStatus.rejected, (state, action) => { state.loader = false; state.error = action.payload; });
  }
});

export const { clearMessages, setImage } = awarenessImageSlice.actions;
export default awarenessImageSlice.reducer;
