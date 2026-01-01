import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

// Create Editor
export const createEditor = createAsyncThunk(
  'editors/create',
  async (editorData, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/hire/editors', editorData, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error creating editor');
    }
  }
);

// Get All Editors
export const getAllEditors = createAsyncThunk(
  'editors/getAll',
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get('/hire/editors', { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error fetching editors');
    }
  }
);

// Get Editor By ID
export const getEditorById = createAsyncThunk(
  'editors/getById',
  async (id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/hire/editors/${id}`, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error fetching editor details');
    }
  }
);

// Update Editor
export const updateEditor = createAsyncThunk(
  'editors/update',
  async ({ id, editorData }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.put(`/hire/editors/${id}`, editorData, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error updating editor');
    }
  }
);

// Delete Editor
export const deleteEditor = createAsyncThunk(
  'editors/delete',
  async (id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`/hire/editors/${id}`, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error deleting editor');
    }
  }
);

const editorSlice = createSlice({
  name: 'editors',
  initialState: {
    editorsList: [],
    editorData: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearEditorData: (state) => {
      state.editorData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getAllEditors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllEditors.fulfilled, (state, action) => {
        state.loading = false;
        state.editorsList = action.payload;
      })
      .addCase(getAllEditors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createEditor.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEditor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.editorsList.push(action.payload);
      })
      .addCase(createEditor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateEditor.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEditor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.editorsList.findIndex(e => e._id === action.payload._id);
        if (index !== -1) state.editorsList[index] = action.payload;
        state.editorData = action.payload;
      })
      .addCase(updateEditor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteEditor.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEditor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.editorsList = state.editorsList.filter(e => e._id !== action.meta.arg);
      })
      .addCase(deleteEditor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By ID
      .addCase(getEditorById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEditorById.fulfilled, (state, action) => {
        state.loading = false;
        state.editorData = action.payload;
      })
      .addCase(getEditorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearError, clearSuccess, clearEditorData } = editorSlice.actions;
export default editorSlice.reducer;
