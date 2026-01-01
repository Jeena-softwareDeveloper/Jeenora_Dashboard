import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../api/api';

// -------------------- CAMPAIGN THUNKS -------------------- //
export const createCampaign = createAsyncThunk(
  'campaign/createCampaign',
  async (campaignData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/campaigns', campaignData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCampaigns = createAsyncThunk(
  'campaign/getCampaigns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { status, mode, scheduleType, isActive, page, limit } = params;
      const queryParams = new URLSearchParams();
      
      if (status) queryParams.append('status', status);
      if (mode) queryParams.append('mode', mode);
      if (scheduleType) queryParams.append('scheduleType', scheduleType);
      if (isActive !== undefined) queryParams.append('isActive', isActive);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const url = `/awareness/campaigns${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      console.log("campaigns data", res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCampaignById = createAsyncThunk(
  'campaign/getCampaignById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/campaigns/${id}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaign/updateCampaign',
  async ({ id, campaignData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/awareness/campaigns/${id}`, campaignData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaign/deleteCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/awareness/campaigns/${id}`, { withCredentials: true });
      return { ...res.data, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- CAMPAIGN ACTIONS THUNKS -------------------- //
export const startCampaign = createAsyncThunk(
  'campaign/startCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/awareness/campaigns/${id}/start`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const stopCampaign = createAsyncThunk(
  'campaign/stopCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/awareness/campaigns/${id}/stop`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const pauseCampaign = createAsyncThunk(
  'campaign/pauseCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/awareness/campaigns/${id}/pause`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const resumeCampaign = createAsyncThunk(
  'campaign/resumeCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/awareness/campaigns/${id}/resume`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const resendCampaign = createAsyncThunk(
  'campaign/resendCampaign',
  async ({ id, resetAnalytics = true }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/awareness/campaigns/${id}/resend`,  // ✅ ID goes in the URL
        { resetAnalytics },                   // ✅ Body data
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);


export const duplicateCampaign = createAsyncThunk(
  'campaign/duplicateCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/awareness/campaigns/${id}/duplicate`, {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCampaignStatus = createAsyncThunk(
  'campaign/getCampaignStatus',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/campaigns/${id}/status`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getCampaignStats = createAsyncThunk(
  'campaign/getCampaignStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/campaigns-stats', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- WHATSAPP THUNKS -------------------- //
export const getWhatsAppQR = createAsyncThunk(
  'campaign/getWhatsAppQR',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/whatsapp/qr', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getWhatsAppStatus = createAsyncThunk(
  'campaign/getWhatsAppStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/whatsapp/status', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const resetWhatsApp = createAsyncThunk(
  'campaign/resetWhatsApp',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/reset', {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const forceReconnectWhatsApp = createAsyncThunk(
  'campaign/forceReconnectWhatsApp',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/reconnect', {}, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const refreshQRCode = createAsyncThunk(
  'campaign/refreshQRCode',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/refresh-qr', {}, { 
        withCredentials: true,
        timeout: 30000 // Add timeout
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Refresh failed. Please wait and try again.');
    }
  }
);

export const sendSingleWhatsApp = createAsyncThunk(
  'campaign/sendSingleWhatsApp',
  async (messageData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/send-single', messageData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const sendBulkWhatsApp = createAsyncThunk(
  'campaign/sendBulkWhatsApp',
  async (bulkData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/send-bulk', bulkData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const sendMediaWhatsApp = createAsyncThunk(
  'campaign/sendMediaWhatsApp',
  async (mediaData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/whatsapp/send-media', mediaData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getWhatsAppContacts = createAsyncThunk(
  'campaign/getWhatsAppContacts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/whatsapp/contacts', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getWhatsAppGroups = createAsyncThunk(
  'campaign/getWhatsAppGroups',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/whatsapp/groups', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- GMAIL THUNKS -------------------- //
export const gmailAuth = createAsyncThunk(
  'campaign/gmailAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/gmail/auth', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const gmailCallback = createAsyncThunk(
  'campaign/gmailCallback',
  async (code, { rejectWithValue }) => {
    try {
      const res = await api.get(`/awareness/gmail/callback?code=${code}`, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const sendSingleEmail = createAsyncThunk(
  'campaign/sendSingleEmail',
  async (emailData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/gmail/send-single', emailData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const sendBulkEmail = createAsyncThunk(
  'campaign/sendBulkEmail',
  async (bulkData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/gmail/send-bulk', bulkData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getEmailTemplates = createAsyncThunk(
  'campaign/getEmailTemplates',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { category, page, limit } = params;
      const queryParams = new URLSearchParams();
      
      if (category) queryParams.append('category', category);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const url = `/awareness/gmail/templates${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const createEmailTemplate = createAsyncThunk(
  'campaign/createEmailTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/gmail/templates', templateData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- ANALYTICS THUNKS -------------------- //
export const getCampaignAnalytics = createAsyncThunk(
  'campaign/getCampaignAnalytics',
  async ({ id, ...params }, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const queryString = queryParams.toString();
      const url = `/awareness/analytics/campaigns/${id}${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getComprehensiveAnalytics = createAsyncThunk(
  'campaign/getComprehensiveAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { period, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (period) queryParams.append('period', period);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const queryString = queryParams.toString();
      const url = `/awareness/analytics/comprehensive${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getWhatsAppStats = createAsyncThunk(
  'campaign/getWhatsAppStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const queryString = queryParams.toString();
      const url = `/awareness/analytics/whatsapp/stats${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const getGmailStats = createAsyncThunk(
  'campaign/getGmailStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const queryString = queryParams.toString();
      const url = `/awareness/analytics/gmail/stats${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const generateReports = createAsyncThunk(
  'campaign/generateReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { reportType, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (reportType) queryParams.append('reportType', reportType);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const queryString = queryParams.toString();
      const url = `/awareness/analytics/reports${queryString ? `?${queryString}` : ''}`;
      
      const res = await api.get(url, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- HEALTH & UTILITY THUNKS -------------------- //
export const healthCheck = createAsyncThunk(
  'campaign/healthCheck',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/awareness/health', { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const validatePhoneNumber = createAsyncThunk(
  'campaign/validatePhoneNumber',
  async (phone, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/validate/phone', { phone }, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const validateCampaignData = createAsyncThunk(
  'campaign/validateCampaignData',
  async (campaignData, { rejectWithValue }) => {
    try {
      const res = await api.post('/awareness/validate/campaign-data', campaignData, { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// -------------------- CAMPAIGN SLICE -------------------- //
const campaignSlice = createSlice({
  name: 'campaign',
  initialState: {
    // Loaders
    loading: false,
    campaignsLoading: false,
    startingCampaign: false,
    stoppingCampaign: false,
    pausingCampaign: false,
    resumingCampaign: false,
    duplicatingCampaign: false,
    resendingCampaign: false,
    
    // Messages
    success: '',
    error: '',
    
    // Data
    campaigns: [],
    currentCampaign: null,
    campaignStats: null,
    campaignAnalytics: null,
    comprehensiveAnalytics: null,
    
    // WhatsApp
    whatsappQR: null,
    whatsappStatus: {
      connected: false,
      state: 'UNKNOWN',
      qrNeeded: false,
      hasQR: false,
      initializing: false,
      sessionRestored: false,
      detailedInfo: {}
    },
    whatsappLoading: false,
    whatsappContacts: [],
    whatsappGroups: [],
    
    // Gmail
    emailTemplates: [],
    emailTemplatesLoading: false,
    
    // Analytics
    whatsappStats: null,
    gmailStats: null,
    reports: null,
    analyticsLoading: false,
    
    // Health
    systemHealth: null,
    healthLoading: false,
    
    // Validation
    phoneValidation: null,
    campaignValidation: null,
    
    // Pagination
    campaignsPagination: {
      page: 1,
      pages: 1,
      total: 0,
      limit: 10
    },
    
    // Filters
    filters: {
      status: '',
      mode: '',
      scheduleType: '',
      isActive: ''
    }
  },
  reducers: {
    clearMessages: (state) => {
      state.success = '';
      state.error = '';
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    clearCampaignAnalytics: (state) => {
      state.campaignAnalytics = null;
    },
    clearComprehensiveAnalytics: (state) => {
      state.comprehensiveAnalytics = null;
    },
    clearWhatsAppQR: (state) => {
      state.whatsappQR = null;
    },
    clearWhatsAppData: (state) => {
      state.whatsappContacts = [];
      state.whatsappGroups = [];
    },
    clearAnalytics: (state) => {
      state.whatsappStats = null;
      state.gmailStats = null;
      state.reports = null;
    },
    clearHealth: (state) => {
      state.systemHealth = null;
    },
    clearValidation: (state) => {
      state.phoneValidation = null;
      state.campaignValidation = null;
    },
    setCampaignsPage: (state, action) => {
      state.campaignsPagination.page = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        mode: '',
        scheduleType: '',
        isActive: ''
      };
    },
    resetCampaignState: (state) => {
      state.loading = false;
      state.campaignsLoading = false;
      state.startingCampaign = false;
      state.stoppingCampaign = false;
      state.pausingCampaign = false;
      state.resumingCampaign = false;
      state.duplicatingCampaign = false;
      state.resendingCampaign = false;
      state.success = '';
      state.error = '';
      state.currentCampaign = null;
      state.campaignAnalytics = null;
      state.comprehensiveAnalytics = null;
    },
    // Socket.IO WhatsApp status updates
    updateWhatsAppStatus: (state, action) => {
      state.whatsappStatus = {
        ...state.whatsappStatus,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // -------------------- CAMPAIGN CRUD CASES -------------------- //
    
    // Create Campaign
    builder
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          state.campaigns.unshift(action.payload.campaign);
        }
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Campaigns
    builder
      .addCase(getCampaigns.pending, (state) => {
        state.campaignsLoading = true;
      })
      .addCase(getCampaigns.fulfilled, (state, action) => {
        state.campaignsLoading = false;
        if (action.payload.success) {
          state.campaigns = action.payload.campaigns || [];
          state.campaignsPagination = {
            page: action.payload.page || 1,
            pages: action.payload.pages || 1,
            total: action.payload.total || 0,
            limit: action.payload.limit || 10
          };
        }
      })
      .addCase(getCampaigns.rejected, (state, action) => {
        state.campaignsLoading = false;
        state.error = action.payload;
      });

    // Get Campaign By ID
    builder
      .addCase(getCampaignById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.currentCampaign = action.payload.campaign;
        }
      })
      .addCase(getCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Campaign
    builder
      .addCase(updateCampaign.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Campaign
    builder
      .addCase(deleteCampaign.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        state.campaigns = state.campaigns.filter(c => c._id !== action.payload.deletedId);
        if (state.currentCampaign && state.currentCampaign._id === action.payload.deletedId) {
          state.currentCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // -------------------- CAMPAIGN ACTIONS CASES -------------------- //
    
    // Start Campaign
    builder
      .addCase(startCampaign.pending, (state) => {
        state.startingCampaign = true;
        state.error = '';
      })
      .addCase(startCampaign.fulfilled, (state, action) => {
        state.startingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(startCampaign.rejected, (state, action) => {
        state.startingCampaign = false;
        state.error = action.payload;
      });

    // Stop Campaign
    builder
      .addCase(stopCampaign.pending, (state) => {
        state.stoppingCampaign = true;
        state.error = '';
      })
      .addCase(stopCampaign.fulfilled, (state, action) => {
        state.stoppingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(stopCampaign.rejected, (state, action) => {
        state.stoppingCampaign = false;
        state.error = action.payload;
      });

    // Pause Campaign
    builder
      .addCase(pauseCampaign.pending, (state) => {
        state.pausingCampaign = true;
        state.error = '';
      })
      .addCase(pauseCampaign.fulfilled, (state, action) => {
        state.pausingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(pauseCampaign.rejected, (state, action) => {
        state.pausingCampaign = false;
        state.error = action.payload;
      });

    // Resume Campaign
    builder
      .addCase(resumeCampaign.pending, (state) => {
        state.resumingCampaign = true;
        state.error = '';
      })
      .addCase(resumeCampaign.fulfilled, (state, action) => {
        state.resumingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(resumeCampaign.rejected, (state, action) => {
        state.resumingCampaign = false;
        state.error = action.payload;
      });

    // Resend Campaign
    builder
      .addCase(resendCampaign.pending, (state) => {
        state.resendingCampaign = true;
        state.error = '';
      })
      .addCase(resendCampaign.fulfilled, (state, action) => {
        state.resendingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign._id);
          if (index !== -1) {
            state.campaigns[index] = action.payload.campaign;
          }
          if (state.currentCampaign && state.currentCampaign._id === action.payload.campaign._id) {
            state.currentCampaign = action.payload.campaign;
          }
        }
      })
      .addCase(resendCampaign.rejected, (state, action) => {
        state.resendingCampaign = false;
        state.error = action.payload;
      });

    // Duplicate Campaign
    builder
      .addCase(duplicateCampaign.pending, (state) => {
        state.duplicatingCampaign = true;
        state.error = '';
      })
      .addCase(duplicateCampaign.fulfilled, (state, action) => {
        state.duplicatingCampaign = false;
        state.success = action.payload.message;
        if (action.payload.campaign) {
          state.campaigns.unshift(action.payload.campaign);
        }
      })
      .addCase(duplicateCampaign.rejected, (state, action) => {
        state.duplicatingCampaign = false;
        state.error = action.payload;
      });

    // Get Campaign Status
    builder
      .addCase(getCampaignStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCampaignStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.campaign) {
          const index = state.campaigns.findIndex(c => c._id === action.payload.campaign.id);
          if (index !== -1) {
            state.campaigns[index].status = action.payload.campaign.status;
            state.campaigns[index].progress = action.payload.campaign.progress;
          }
        }
      })
      .addCase(getCampaignStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Campaign Stats
    builder
      .addCase(getCampaignStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCampaignStats.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.campaignStats = action.payload;
        }
      })
      .addCase(getCampaignStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // -------------------- WHATSAPP CASES -------------------- //
    
    // Get WhatsApp QR
    builder
      .addCase(getWhatsAppQR.pending, (state) => {
        state.whatsappLoading = true;
      })
      .addCase(getWhatsAppQR.fulfilled, (state, action) => {
        state.whatsappLoading = false;
        if (action.payload.success) {
          state.whatsappQR = action.payload.qr;
          state.whatsappStatus.qrNeeded = !!action.payload.qr;
          state.whatsappStatus.hasQR = !!action.payload.qr;
        }
      })
      .addCase(getWhatsAppQR.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

       // Refresh QR Code - ADD THIS NEW CASE
    builder
      .addCase(refreshQRCode.pending, (state) => {
        state.whatsappLoading = true;
        state.error = '';
      })
      .addCase(refreshQRCode.fulfilled, (state, action) => {
        state.whatsappLoading = false;
        if (action.payload.success) {
          state.whatsappQR = action.payload.qr || state.whatsappQR; // Only update if new QR provided
          state.success = action.payload.message || 'QR code refreshed successfully';
          if (action.payload.qr) {
            state.whatsappStatus.hasQR = true;
            state.whatsappStatus.qrNeeded = true;
          }
        }
      })
      .addCase(refreshQRCode.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

    // Get WhatsApp Status
    builder
      .addCase(getWhatsAppStatus.pending, (state) => {
        state.whatsappLoading = true;
      })
      .addCase(getWhatsAppStatus.fulfilled, (state, action) => {
        state.whatsappLoading = false;
        if (action.payload.success) {
          state.whatsappStatus = {
            connected: action.payload.connected || false,
            state: action.payload.state || 'UNKNOWN',
            qrNeeded: action.payload.qrNeeded || false,
            hasQR: action.payload.hasQR || false,
            initializing: action.payload.initializing || false,
            sessionRestored: action.payload.sessionRestored || false,
            detailedInfo: action.payload.detailedInfo || {}
          };
          
          if (action.payload.connected) {
            state.success = '✅ WhatsApp successfully connected!';
          }
        }
      })
      .addCase(getWhatsAppStatus.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.whatsappStatus.connected = false;
        state.whatsappStatus.state = 'ERROR';
        state.error = action.payload;
      });

    // Reset WhatsApp
    builder
      .addCase(resetWhatsApp.pending, (state) => {
        state.whatsappLoading = true;
        state.error = '';
      })
      .addCase(resetWhatsApp.fulfilled, (state) => {
        state.whatsappLoading = false;
        state.success = 'WhatsApp client reset successfully';
        state.whatsappQR = null;
        state.whatsappStatus = {
          connected: false,
          state: 'RESETTING',
          qrNeeded: true,
          hasQR: false,
          initializing: false,
          sessionRestored: false,
          detailedInfo: {}
        };
      })
      .addCase(resetWhatsApp.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

    // Force Reconnect WhatsApp
    builder
      .addCase(forceReconnectWhatsApp.pending, (state) => {
        state.whatsappLoading = true;
        state.error = '';
      })
      .addCase(forceReconnectWhatsApp.fulfilled, (state) => {
        state.whatsappLoading = false;
        state.success = 'WhatsApp reconnection initiated';
        state.whatsappStatus.initializing = true;
      })
      .addCase(forceReconnectWhatsApp.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

    // Get WhatsApp Contacts
    builder
      .addCase(getWhatsAppContacts.pending, (state) => {
        state.whatsappLoading = true;
      })
      .addCase(getWhatsAppContacts.fulfilled, (state, action) => {
        state.whatsappLoading = false;
        if (action.payload.success) {
          state.whatsappContacts = action.payload.contacts || [];
        }
      })
      .addCase(getWhatsAppContacts.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

    // Get WhatsApp Groups
    builder
      .addCase(getWhatsAppGroups.pending, (state) => {
        state.whatsappLoading = true;
      })
      .addCase(getWhatsAppGroups.fulfilled, (state, action) => {
        state.whatsappLoading = false;
        if (action.payload.success) {
          state.whatsappGroups = action.payload.groups || [];
        }
      })
      .addCase(getWhatsAppGroups.rejected, (state, action) => {
        state.whatsappLoading = false;
        state.error = action.payload;
      });

    // -------------------- GMAIL CASES -------------------- //
    
    // Get Email Templates
    builder
      .addCase(getEmailTemplates.pending, (state) => {
        state.emailTemplatesLoading = true;
      })
      .addCase(getEmailTemplates.fulfilled, (state, action) => {
        state.emailTemplatesLoading = false;
        if (action.payload.success) {
          state.emailTemplates = action.payload.templates || [];
        }
      })
      .addCase(getEmailTemplates.rejected, (state, action) => {
        state.emailTemplatesLoading = false;
        state.error = action.payload;
      });

    // Create Email Template
    builder
      .addCase(createEmailTemplate.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(createEmailTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        if (action.payload.template) {
          state.emailTemplates.unshift(action.payload.template);
        }
      })
      .addCase(createEmailTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // -------------------- ANALYTICS CASES -------------------- //
    
    // Get Campaign Analytics
    builder
      .addCase(getCampaignAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getCampaignAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload.success) {
          state.campaignAnalytics = action.payload;
        }
      })
      .addCase(getCampaignAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // Get Comprehensive Analytics
    builder
      .addCase(getComprehensiveAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getComprehensiveAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload.success) {
          state.comprehensiveAnalytics = action.payload;
        }
      })
      .addCase(getComprehensiveAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // Get WhatsApp Stats
    builder
      .addCase(getWhatsAppStats.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getWhatsAppStats.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload.success) {
          state.whatsappStats = action.payload;
        }
      })
      .addCase(getWhatsAppStats.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // Get Gmail Stats
    builder
      .addCase(getGmailStats.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(getGmailStats.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload.success) {
          state.gmailStats = action.payload;
        }
      })
      .addCase(getGmailStats.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // Generate Reports
    builder
      .addCase(generateReports.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(generateReports.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload.success) {
          state.reports = action.payload;
        }
      })
      .addCase(generateReports.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });

    // -------------------- HEALTH & UTILITY CASES -------------------- //
    
    // Health Check
    builder
      .addCase(healthCheck.pending, (state) => {
        state.healthLoading = true;
      })
      .addCase(healthCheck.fulfilled, (state, action) => {
        state.healthLoading = false;
        if (action.payload.success) {
          state.systemHealth = action.payload;
        }
      })
      .addCase(healthCheck.rejected, (state, action) => {
        state.healthLoading = false;
        state.error = action.payload;
      });

    // Validate Phone Number
    builder
      .addCase(validatePhoneNumber.pending, (state) => {
        state.loading = true;
      })
      .addCase(validatePhoneNumber.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.phoneValidation = action.payload;
        }
      })
      .addCase(validatePhoneNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Validate Campaign Data
    builder
      .addCase(validateCampaignData.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateCampaignData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.campaignValidation = action.payload;
        }
      })
      .addCase(validateCampaignData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearMessages, 
  clearCurrentCampaign, 
  clearCampaignAnalytics,
  clearComprehensiveAnalytics,
  clearWhatsAppQR,
  clearWhatsAppData,
  clearAnalytics,
  clearHealth,
  clearValidation,
  setCampaignsPage,
  setFilters,
  clearFilters,
  resetCampaignState,
  updateWhatsAppStatus
} = campaignSlice.actions;

export default campaignSlice.reducer;