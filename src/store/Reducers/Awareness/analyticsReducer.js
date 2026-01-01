import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// 🟢 User Tracking
export const claimUser = createAsyncThunk(
  "analytics/claimUser",
  async (userData, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post("analytics/claim", userData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🟢 Get All Users
export const getAllUsers = createAsyncThunk(
  "analytics/getAllUsers",
  async (filters = {}, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("analytics", { 
        params: filters,
        withCredentials: true 
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🟢 Get User By ID
export const getUserById = createAsyncThunk(
  "analytics/getUserById",
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`analytics/users/${userId}`, { withCredentials: true });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🗑️ User Deletion Thunks
export const deleteUser = createAsyncThunk(
  "analytics/deleteUser",
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`analytics/users/${userId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMultipleUsers = createAsyncThunk(
  "analytics/deleteMultipleUsers",
  async (userIds, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/users/bulk/delete", {
        data: { userIds },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🗑️ Session Management Thunks
export const clearAllSessions = createAsyncThunk(
  "analytics/clearAllSessions",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/clear-all", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearInactiveSessions = createAsyncThunk(
  "analytics/clearInactiveSessions",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/clear-inactive", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearOldSessions = createAsyncThunk(
  "analytics/clearOldSessions",
  async (days = 7, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/clear-old", {
        data: { days },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearUserSessions = createAsyncThunk(
  "analytics/clearUserSessions",
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`analytics/sessions/user/${userId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 🗑️ Advanced Session Deletion Thunks
export const clearSessionsByIds = createAsyncThunk(
  "analytics/clearSessionsByIds",
  async (sessionIds, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/by-ids", {
        data: { sessionIds },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearSessionsByDateRange = createAsyncThunk(
  "analytics/clearSessionsByDateRange",
  async (dateRange, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/by-date", {
        data: dateRange,
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearSessionsByDevice = createAsyncThunk(
  "analytics/clearSessionsByDevice",
  async (deviceType, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/by-device", {
        data: { deviceType },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearSessionsByCountry = createAsyncThunk(
  "analytics/clearSessionsByCountry",
  async (country, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/by-country", {
        data: { country },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearShortSessions = createAsyncThunk(
  "analytics/clearShortSessions",
  async (maxDuration = 60, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/short", {
        data: { maxDuration },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearAbandonedSessions = createAsyncThunk(
  "analytics/clearAbandonedSessions",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/abandoned", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearDuplicateSessions = createAsyncThunk(
  "analytics/clearDuplicateSessions",
  async (timeThreshold = 300, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/duplicates", {
        data: { timeThreshold },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const bulkDeleteSessions = createAsyncThunk(
  "analytics/bulkDeleteSessions",
  async (filters, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/bulk/delete", {
        data: filters,
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 📊 Get Session Stats
export const getSessionStats = createAsyncThunk(
  "analytics/getSessionStats",
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get("analytics/sessions/stats", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ⚠️ Reset All Analytics
export const resetAllAnalytics = createAsyncThunk(
  "analytics/resetAllAnalytics",
  async (confirmation, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete("analytics/sessions/reset-all", {
        data: { confirmation },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    userList: [],
    userDetails: null,
    claimedUser: null,
    sessionStats: null,
    deleteResults: null,

    loading: {
      // User operations
      claimUser: false,
      userList: false,
      userDetails: false,
      deleteUser: false,
      deleteMultipleUsers: false,
      
      // Basic session operations
      clearAllSessions: false,
      clearInactiveSessions: false,
      clearOldSessions: false,
      clearUserSessions: false,
      
      // Advanced session operations
      clearSessionsByIds: false,
      clearSessionsByDateRange: false,
      clearSessionsByDevice: false,
      clearSessionsByCountry: false,
      clearShortSessions: false,
      clearAbandonedSessions: false,
      clearDuplicateSessions: false,
      bulkDeleteSessions: false,
      
      // Stats and reset
      getSessionStats: false,
      resetAllAnalytics: false,
    },
    error: {
      // User operations
      claimUser: null,
      userList: null,
      userDetails: null,
      deleteUser: null,
      deleteMultipleUsers: null,
      
      // Basic session operations
      clearAllSessions: null,
      clearInactiveSessions: null,
      clearOldSessions: null,
      clearUserSessions: null,
      
      // Advanced session operations
      clearSessionsByIds: null,
      clearSessionsByDateRange: null,
      clearSessionsByDevice: null,
      clearSessionsByCountry: null,
      clearShortSessions: null,
      clearAbandonedSessions: null,
      clearDuplicateSessions: null,
      bulkDeleteSessions: null,
      
      // Stats and reset
      getSessionStats: null,
      resetAllAnalytics: null,
    },
  },

  reducers: {
    clearUserError: (state, action) => {
      const type = action.payload;
      if (type && state.error[type]) state.error[type] = null;
      else Object.keys(state.error).forEach((key) => (state.error[key] = null));
    },
    resetUserData: (state) => {
      state.userList = [];
      state.userDetails = null;
      state.claimedUser = null;
      state.sessionStats = null;
      state.deleteResults = null;
    },
    clearDeleteResults: (state) => {
      state.deleteResults = null;
    },
    updateUserListAfterDelete: (state, action) => {
      const { userId } = action.payload;
      if (userId) {
        state.userList = state.userList.map(user => 
          user.user_id === userId 
            ? { ...user, is_online: false, total_sessions: 0 }
            : user
        );
      } else {
        state.userList = state.userList.map(user => ({
          ...user,
          is_online: false
        }));
      }
    },
  },

  extraReducers: (builder) => {
    
    builder
      // Claim User
      .addCase(claimUser.pending, (state) => {
        state.loading.claimUser = true;
        state.error.claimUser = null;
      })
      .addCase(claimUser.fulfilled, (state, action) => {
        state.loading.claimUser = false;
        state.claimedUser = action.payload.data;
      })
      .addCase(claimUser.rejected, (state, action) => {
        state.loading.claimUser = false;
        state.error.claimUser = action.payload;
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading.userList = true;
        state.error.userList = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading.userList = false;
        state.userList = action.payload.data;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading.userList = false;
        state.error.userList = action.payload;
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.loading.userDetails = true;
        state.error.userDetails = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading.userDetails = false;
        state.userDetails = action.payload.data;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading.userDetails = false;
        state.error.userDetails = action.payload;
      })

      // 🗑️ Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading.deleteUser = true;
        state.error.deleteUser = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading.deleteUser = false;
        state.deleteResults = action.payload;
        // Remove user from list
        state.userList = state.userList.filter(user => user.user_id !== action.meta.arg);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading.deleteUser = false;
        state.error.deleteUser = action.payload;
      })

      // 🗑️ Delete Multiple Users
      .addCase(deleteMultipleUsers.pending, (state) => {
        state.loading.deleteMultipleUsers = true;
        state.error.deleteMultipleUsers = null;
      })
      .addCase(deleteMultipleUsers.fulfilled, (state, action) => {
        state.loading.deleteMultipleUsers = false;
        state.deleteResults = action.payload;
        // Remove multiple users from list
        const deletedUserIds = action.meta.arg;
        state.userList = state.userList.filter(user => !deletedUserIds.includes(user.user_id));
      })
      .addCase(deleteMultipleUsers.rejected, (state, action) => {
        state.loading.deleteMultipleUsers = false;
        state.error.deleteMultipleUsers = action.payload;
      })

      // 🗑️ Clear All Sessions
      .addCase(clearAllSessions.pending, (state) => {
        state.loading.clearAllSessions = true;
        state.error.clearAllSessions = null;
      })
      .addCase(clearAllSessions.fulfilled, (state, action) => {
        state.loading.clearAllSessions = false;
        state.deleteResults = action.payload;
        // Update user list to reflect changes
        state.userList = state.userList.map(user => ({
          ...user,
          is_online: false,
          total_sessions: 0
        }));
      })
      .addCase(clearAllSessions.rejected, (state, action) => {
        state.loading.clearAllSessions = false;
        state.error.clearAllSessions = action.payload;
      })

      // 🗑️ Clear Inactive Sessions
      .addCase(clearInactiveSessions.pending, (state) => {
        state.loading.clearInactiveSessions = true;
        state.error.clearInactiveSessions = null;
      })
      .addCase(clearInactiveSessions.fulfilled, (state, action) => {
        state.loading.clearInactiveSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearInactiveSessions.rejected, (state, action) => {
        state.loading.clearInactiveSessions = false;
        state.error.clearInactiveSessions = action.payload;
      })

      // 🗑️ Clear Old Sessions
      .addCase(clearOldSessions.pending, (state) => {
        state.loading.clearOldSessions = true;
        state.error.clearOldSessions = null;
      })
      .addCase(clearOldSessions.fulfilled, (state, action) => {
        state.loading.clearOldSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearOldSessions.rejected, (state, action) => {
        state.loading.clearOldSessions = false;
        state.error.clearOldSessions = action.payload;
      })

      // 🗑️ Clear User Sessions
      .addCase(clearUserSessions.pending, (state) => {
        state.loading.clearUserSessions = true;
        state.error.clearUserSessions = null;
      })
      .addCase(clearUserSessions.fulfilled, (state, action) => {
        state.loading.clearUserSessions = false;
        state.deleteResults = action.payload;
        // Update specific user in the list
        const userId = action.meta.arg;
        state.userList = state.userList.map(user => 
          user.user_id === userId 
            ? { ...user, is_online: false, total_sessions: 0 }
            : user
        );
        // Also update user details if currently viewing that user
        if (state.userDetails && state.userDetails.user_id === userId) {
          state.userDetails = {
            ...state.userDetails,
            is_online: false,
            engagement: {
              ...state.userDetails.engagement,
              total_sessions: 0
            }
          };
        }
      })
      .addCase(clearUserSessions.rejected, (state, action) => {
        state.loading.clearUserSessions = false;
        state.error.clearUserSessions = action.payload;
      })

      // 🗑️ Clear Sessions By IDs
      .addCase(clearSessionsByIds.pending, (state) => {
        state.loading.clearSessionsByIds = true;
        state.error.clearSessionsByIds = null;
      })
      .addCase(clearSessionsByIds.fulfilled, (state, action) => {
        state.loading.clearSessionsByIds = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearSessionsByIds.rejected, (state, action) => {
        state.loading.clearSessionsByIds = false;
        state.error.clearSessionsByIds = action.payload;
      })

      // 🗑️ Clear Sessions By Date Range
      .addCase(clearSessionsByDateRange.pending, (state) => {
        state.loading.clearSessionsByDateRange = true;
        state.error.clearSessionsByDateRange = null;
      })
      .addCase(clearSessionsByDateRange.fulfilled, (state, action) => {
        state.loading.clearSessionsByDateRange = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearSessionsByDateRange.rejected, (state, action) => {
        state.loading.clearSessionsByDateRange = false;
        state.error.clearSessionsByDateRange = action.payload;
      })

      // 🗑️ Clear Sessions By Device
      .addCase(clearSessionsByDevice.pending, (state) => {
        state.loading.clearSessionsByDevice = true;
        state.error.clearSessionsByDevice = null;
      })
      .addCase(clearSessionsByDevice.fulfilled, (state, action) => {
        state.loading.clearSessionsByDevice = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearSessionsByDevice.rejected, (state, action) => {
        state.loading.clearSessionsByDevice = false;
        state.error.clearSessionsByDevice = action.payload;
      })

      // 🗑️ Clear Sessions By Country
      .addCase(clearSessionsByCountry.pending, (state) => {
        state.loading.clearSessionsByCountry = true;
        state.error.clearSessionsByCountry = null;
      })
      .addCase(clearSessionsByCountry.fulfilled, (state, action) => {
        state.loading.clearSessionsByCountry = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearSessionsByCountry.rejected, (state, action) => {
        state.loading.clearSessionsByCountry = false;
        state.error.clearSessionsByCountry = action.payload;
      })

      // 🗑️ Clear Short Sessions
      .addCase(clearShortSessions.pending, (state) => {
        state.loading.clearShortSessions = true;
        state.error.clearShortSessions = null;
      })
      .addCase(clearShortSessions.fulfilled, (state, action) => {
        state.loading.clearShortSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearShortSessions.rejected, (state, action) => {
        state.loading.clearShortSessions = false;
        state.error.clearShortSessions = action.payload;
      })

      // 🗑️ Clear Abandoned Sessions
      .addCase(clearAbandonedSessions.pending, (state) => {
        state.loading.clearAbandonedSessions = true;
        state.error.clearAbandonedSessions = null;
      })
      .addCase(clearAbandonedSessions.fulfilled, (state, action) => {
        state.loading.clearAbandonedSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearAbandonedSessions.rejected, (state, action) => {
        state.loading.clearAbandonedSessions = false;
        state.error.clearAbandonedSessions = action.payload;
      })

      // 🗑️ Clear Duplicate Sessions
      .addCase(clearDuplicateSessions.pending, (state) => {
        state.loading.clearDuplicateSessions = true;
        state.error.clearDuplicateSessions = null;
      })
      .addCase(clearDuplicateSessions.fulfilled, (state, action) => {
        state.loading.clearDuplicateSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(clearDuplicateSessions.rejected, (state, action) => {
        state.loading.clearDuplicateSessions = false;
        state.error.clearDuplicateSessions = action.payload;
      })

      // 🗑️ Bulk Delete Sessions
      .addCase(bulkDeleteSessions.pending, (state) => {
        state.loading.bulkDeleteSessions = true;
        state.error.bulkDeleteSessions = null;
      })
      .addCase(bulkDeleteSessions.fulfilled, (state, action) => {
        state.loading.bulkDeleteSessions = false;
        state.deleteResults = action.payload;
      })
      .addCase(bulkDeleteSessions.rejected, (state, action) => {
        state.loading.bulkDeleteSessions = false;
        state.error.bulkDeleteSessions = action.payload;
      })

      // 📊 Get Session Stats
      .addCase(getSessionStats.pending, (state) => {
        state.loading.getSessionStats = true;
        state.error.getSessionStats = null;
      })
      .addCase(getSessionStats.fulfilled, (state, action) => {
        state.loading.getSessionStats = false;
        state.sessionStats = action.payload.data;
      })
      .addCase(getSessionStats.rejected, (state, action) => {
        state.loading.getSessionStats = false;
        state.error.getSessionStats = action.payload;
      })

      // ⚠️ Reset All Analytics
      .addCase(resetAllAnalytics.pending, (state) => {
        state.loading.resetAllAnalytics = true;
        state.error.resetAllAnalytics = null;
      })
      .addCase(resetAllAnalytics.fulfilled, (state, action) => {
        state.loading.resetAllAnalytics = false;
        state.deleteResults = action.payload;
        // Clear all data from state
        state.userList = [];
        state.userDetails = null;
        state.claimedUser = null;
        state.sessionStats = null;
      })
      .addCase(resetAllAnalytics.rejected, (state, action) => {
        state.loading.resetAllAnalytics = false;
        state.error.resetAllAnalytics = action.payload;
      });
  },
});

export const { 
  clearUserError, 
  resetUserData, 
  clearDeleteResults, 
  updateUserListAfterDelete 
} = analyticsSlice.actions;

export default analyticsSlice.reducer;