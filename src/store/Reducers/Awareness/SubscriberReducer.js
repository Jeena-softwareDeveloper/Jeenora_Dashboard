import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- CATEGORY THUNKS -------------------- //
export const addCategory = createAsyncThunk(
  'subscriber/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/subscriber/category', categoryData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCategories = createAsyncThunk(
  'subscriber/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/subscriber/category', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCategoryById = createAsyncThunk(
  'subscriber/getCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/subscriber/category/${id}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'subscriber/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/subscriber/category/${id}`, categoryData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'subscriber/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/subscriber/category/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- SUBSCRIBER THUNKS -------------------- //
export const addSubscriber = createAsyncThunk(
  'subscriber/addSubscriber',
  async (subscriberData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/subscriber', subscriberData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getSubscribers = createAsyncThunk(
  'subscriber/getSubscribers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { category, search, page, limit } = params;
      const queryParams = new URLSearchParams();
      
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const url = `/awareness/subscribers${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getSubscriberById = createAsyncThunk(
  'subscriber/getSubscriberById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/subscriber/${id}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateSubscriber = createAsyncThunk(
  'subscriber/updateSubscriber',
  async ({ id, subscriberData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/subscriber/${id}`, subscriberData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteSubscriber = createAsyncThunk(
  'subscriber/deleteSubscriber',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/subscriber/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getSubscribersByCategory = createAsyncThunk(
  'subscriber/getSubscribersByCategory',
  async ({ categoryId, params = {} }, { rejectWithValue }) => {
    try {
      const { page, limit } = params;
      const queryParams = new URLSearchParams();
      
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const url = `/awareness/category/${categoryId}/subscribers${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- SUBSCRIBER SLICE -------------------- //
const subscriberSlice = createSlice({
  name: 'subscriber',
  initialState: {
    // Loaders
    loading: false,
    categoriesLoading: false,
    subscribersLoading: false,
    
    // Messages
    success: '',
    error: '',
    
    // Data
    categories: [],
    subscribers: [],
    currentSubscriber: null,
    currentCategory: null,
    
    // Pagination
    subscribersPagination: {
      page: 1,
      pages: 1,
      total: 0,
      limit: 10
    }
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    clearCurrentSubscriber: (state) => {
      state.currentSubscriber = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    setSubscribersPage: (state, action) => {
      state.subscribersPagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // -------------------- CATEGORY CASES -------------------- //
    
    // Add Category
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.category) {
          state.categories.push(action.payload.category);
        }
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Categories
    builder
      .addCase(getCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload.categories || action.payload || [];
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      });

    // Get Category By ID
    builder
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload.category;
      });

    // Update Category
    builder
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.success = action.payload.message;
        if (action.payload.category) {
          const index = state.categories.findIndex(c => c._id === action.payload.category._id);
          if (index !== -1) {
            state.categories[index] = action.payload.category;
          }
        }
      });

    // Delete Category
    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.success = action.payload.message;
        state.categories = state.categories.filter(c => c._id !== action.payload.deletedId);
      });

    // -------------------- SUBSCRIBER CASES -------------------- //
    
    // Add Subscriber
    builder
      .addCase(addSubscriber.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(addSubscriber.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.subscriber) {
          state.subscribers.push(action.payload.subscriber);
        }
      })
      .addCase(addSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Subscribers
    builder
      .addCase(getSubscribers.pending, (state) => {
        state.subscribersLoading = true;
      })
      .addCase(getSubscribers.fulfilled, (state, action) => {
        state.subscribersLoading = false;
        if (action.payload.subscribers) {
          state.subscribers = action.payload.subscribers;
          state.subscribersPagination = {
            page: action.payload.page || 1,
            pages: action.payload.pages || 1,
            total: action.payload.total || action.payload.subscribers.length,
            limit: action.payload.limit || 10
          };
        } else {
          state.subscribers = action.payload || [];
        }
      })
      .addCase(getSubscribers.rejected, (state, action) => {
        state.subscribersLoading = false;
        state.error = action.payload;
      });

    // Get Subscriber By ID
    builder
      .addCase(getSubscriberById.fulfilled, (state, action) => {
        state.currentSubscriber = action.payload.subscriber;
      });

    // Update Subscriber
    builder
      .addCase(updateSubscriber.fulfilled, (state, action) => {
        state.success = action.payload.message;
        if (action.payload.subscriber) {
          const index = state.subscribers.findIndex(s => s._id === action.payload.subscriber._id);
          if (index !== -1) {
            state.subscribers[index] = action.payload.subscriber;
          }
          if (state.currentSubscriber && state.currentSubscriber._id === action.payload.subscriber._id) {
            state.currentSubscriber = action.payload.subscriber;
          }
        }
      });

    // Delete Subscriber
    builder
      .addCase(deleteSubscriber.fulfilled, (state, action) => {
        state.success = action.payload.message;
        state.subscribers = state.subscribers.filter(s => s._id !== action.payload.deletedId);
        if (state.currentSubscriber && state.currentSubscriber._id === action.payload.deletedId) {
          state.currentSubscriber = null;
        }
      });

    // Get Subscribers By Category
    builder
      .addCase(getSubscribersByCategory.fulfilled, (state, action) => {
        if (action.payload.subscribers) {
          state.subscribers = action.payload.subscribers;
          state.subscribersPagination = {
            page: action.payload.page || 1,
            pages: action.payload.pages || 1,
            total: action.payload.total || action.payload.subscribers.length,
            limit: action.payload.limit || 10
          };
        }
      });
  },
});

export const { 
  clearMessages, 
  clearCurrentSubscriber, 
  clearCurrentCategory,
  setSubscribersPage 
} = subscriberSlice.actions;

export default subscriberSlice.reducer;