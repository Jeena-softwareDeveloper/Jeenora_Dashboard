import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api'; // your axios instance

// -------------------- THUNKS -------------------- //

// Add Account
export const addAccount = createAsyncThunk(
  'accounts/add',
  async (info, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/accounts-add', info, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to add account');
    }
  }
);

// Get all accounts
export const getAccounts = createAsyncThunk(
  'accounts/get',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/accounts', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch accounts');
    }
  }
);

// Update Account
export const updateAccount = createAsyncThunk(
  'accounts/update',
  async ({ id, info }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/accounts-update/${id}`, info, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update account');
    }
  }
);

// Delete Account
export const deleteAccount = createAsyncThunk(
  'accounts/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/accounts-delete/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete account');
    }
  }
);

// Toggle Account Active/Inactive
export const toggleAccountStatus = createAsyncThunk(
  'accounts/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/awareness/accounts/toggle-status/${id}`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to toggle status');
    }
  }
);

// -------------------- SLICE -------------------- //
const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    loader: false,
    success: '',
    error: '',
    accounts: [],
    account: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    setAccount: (state, action) => {
      state.account = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Add Account
    builder
      .addCase(addAccount.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(addAccount.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.account) state.accounts.push(action.payload.account);
      })
      .addCase(addAccount.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // Get Accounts
    builder
      .addCase(getAccounts.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.loader = false;
        state.accounts = action.payload.accounts || [];
      })
      .addCase(getAccounts.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // Update Account
    builder
      .addCase(updateAccount.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        if (action.payload.account) {
          const index = state.accounts.findIndex(a => a._id === action.payload.account._id);
          if (index !== -1) state.accounts[index] = action.payload.account;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => { state.loader = true; state.error = ''; })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loader = false;
        state.success = action.payload.message;
        state.accounts = state.accounts.filter(a => a._id !== action.payload.deletedId);
      })
      .addCase(deleteAccount.rejected, (state, action) => { state.loader = false; state.error = action.payload; });

    // Toggle Account Active/Inactive
    builder
      .addCase(toggleAccountStatus.fulfilled, (state, action) => {
        const account = action.payload.account;
        if (!account?._id) return;
        const index = state.accounts.findIndex(a => a._id === account._id);
        if (index !== -1) state.accounts[index] = account;
        state.success = action.payload.message;
      })
      .addCase(toggleAccountStatus.rejected, (state, action) => { state.error = action.payload; });
  }
});

export const { clearMessages, setAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
