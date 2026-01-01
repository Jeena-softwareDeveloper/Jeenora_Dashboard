// successStorySlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- THUNKS -------------------- //

// Add Success Story
export const addStory = createAsyncThunk(
  'successStory/add',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/successstory-add', formData, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to add story');
    }
  }
);

export const toggleStoryStatus = createAsyncThunk(
  'successStory/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/awareness/successstory-toggle-status/${id}`, null, {
        withCredentials: true,
      });
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to toggle status');
    }
  }
);

// Get all Success Stories
export const getStories = createAsyncThunk(
  'successStory/get',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/successstorys', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch stories');
    }
  }
);

// Get single story
export const getStory = createAsyncThunk(
  'successStory/getSingle',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/successstorys/${id}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch story');
    }
  }
);

// Update story
export const updateStory = createAsyncThunk(
  'successStory/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/successstory-update/${id}`, formData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update story');
    }
  }
);

// Delete story
export const deleteStory = createAsyncThunk(
  'successStory/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/successstory/${id}`, { withCredentials: true });
      // return deletedId to update state
      return { deletedId: id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete story');
    }
  }
);

// -------------------- SLICE -------------------- //
const successStorySlice = createSlice({
  name: 'successStory',
  initialState: {
    loader: false,
    success: '',
    error: '',
    stories: [],
    story: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setStory: (state, action) => {
      state.story = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add
    builder
      .addCase(addStory.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(addStory.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.story) {
          state.stories.unshift(action.payload.story);
          state.story = action.payload.story;
        }
      })
      .addCase(addStory.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Get all
      .addCase(getStories.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(getStories.fulfilled, (state, action) => {
        state.loader = false;
        state.stories = action.payload.stories || [];
      })
      .addCase(getStories.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Get single
      .addCase(getStory.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(getStory.fulfilled, (state, action) => {
        state.loader = false;
        state.story = action.payload.story;
      })
      .addCase(getStory.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateStory.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(updateStory.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.story) {
          const index = state.stories.findIndex(s => s._id === action.payload.story._id);
          if (index !== -1) state.stories[index] = action.payload.story;
          if (state.story && state.story._id === action.payload.story._id) state.story = action.payload.story;
        }
      })
      .addCase(updateStory.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStory.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.stories = state.stories.filter(s => s._id !== action.payload.deletedId);
        if (state.story && state.story._id === action.payload.deletedId) state.story = null;
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      .addCase(toggleStoryStatus.pending, (state) => {
        state.loader = true;
        state.error = '';
      })
      .addCase(toggleStoryStatus.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        const index = state.stories.findIndex(s => s._id === action.payload.id);
        if (index !== -1) {
          state.stories[index].isActive = !state.stories[index].isActive;
        }
      })
      .addCase(toggleStoryStatus.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages, setStory } = successStorySlice.actions;
export default successStorySlice.reducer;
