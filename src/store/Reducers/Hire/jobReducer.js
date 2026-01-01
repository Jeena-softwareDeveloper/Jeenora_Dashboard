import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/api"; // Assuming standard api instance location

// Create Job
export const create_job = createAsyncThunk(
    'job/create_job',
    async (jobData, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/admin/jobs', jobData, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get All Jobs (with filters)
export const get_admin_jobs = createAsyncThunk(
    'job/get_admin_jobs',
    async (payload, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { page, limit, search, status, credits, applications } = payload;
            const { data } = await api.get(`/admin/jobs?page=${page}&limit=${limit}&search=${search}&status=${status}&credits=${credits}&applications=${applications}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get Single Job
export const get_job = createAsyncThunk(
    'job/get_job',
    async (id, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/admin/jobs/${id}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update Job
export const update_job = createAsyncThunk(
    'job/update_job',
    async ({ id, jobData }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/admin/jobs/${id}`, jobData, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Delete Job
export const delete_job = createAsyncThunk(
    'job/delete_job',
    async (id, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.delete(`/admin/jobs/${id}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Toggle Job Status
export const toggle_job_active_status = createAsyncThunk(
    'job/toggle_job_active_status',
    async (id, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/admin/jobs/${id}/pause`, {}, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Get Job Applications
export const get_job_applications = createAsyncThunk(
    'job/get_job_applications',
    async (id, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/admin/jobs/${id}/applications`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Update Application Status
// Update Application Status
export const update_application_status = createAsyncThunk(
    'job/update_application_status',
    async ({ id, status, note, triggeredBy, communicationMode, sendEmail, sendWhatsapp }, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.put(`/admin/applications/${id}/status`, { status, note, triggeredBy, communicationMode, sendEmail, sendWhatsapp }, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const get_job_messages = createAsyncThunk(
    'job/get_job_messages',
    async (applicationId, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get(`/hire/applications/message/${applicationId}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Network Error' });
        }
    }
);

export const send_job_message = createAsyncThunk(
    'job/send_job_message',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post(`/hire/applications/message`, info, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Network Error' });
        }
    }
);

// Get All Applied Jobs (for "Hire > Applied Jobs" view)
export const get_applied_jobs = createAsyncThunk(
    'job/get_applied_jobs',
    async (payload, { rejectWithValue, fulfillWithValue }) => {
        try {
            const page = payload?.page || 1;
            const limit = payload?.limit || 10;
            const status = payload?.status || 'all';

            // API ENDPOINT UPDATED - Corrected mount point to singular 'job'
            const { data } = await api.get(`/hire/job/application/list?page=${page}&parPage=${limit}&status=${status}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Network Error' });
        }
    }
);

export const jobReducer = createSlice({
    name: 'job',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        jobs: [],
        totalJobs: 0,
        job: null,
        applications: [], // List of applications for a specific job
        jobStats: null // Analytics data
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        add_message: (state, { payload }) => {
            state.messages = [...state.messages, payload];
        },
        update_message_read: (state) => {
            state.messages = state.messages.map(m => ({ ...m, isRead: true }));
        }
    },
    extraReducers: (builder) => {
        builder
            // Create
            .addCase(create_job.pending, (state) => {
                state.loader = true;
            })
            .addCase(create_job.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            })
            .addCase(create_job.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })

            // Get All
            .addCase(get_admin_jobs.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_admin_jobs.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.jobs = payload.jobs;
                state.totalJobs = payload.total;
            })
            .addCase(get_admin_jobs.rejected, (state, { payload }) => {
                state.loader = false;
                // state.errorMessage = payload.error; 
            })

            // Get Single
            .addCase(get_job.fulfilled, (state, { payload }) => {
                state.job = payload.job;
            })

            // Update
            .addCase(update_job.pending, (state) => {
                state.loader = true;
            })
            .addCase(update_job.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.job = payload.job;
            })
            .addCase(update_job.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error;
            })

            // Delete
            .addCase(delete_job.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.jobs = state.jobs.filter(j => j._id !== payload.id);
            })

            // Toggle
            .addCase(toggle_job_active_status.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                const index = state.jobs.findIndex(j => j._id === payload.job._id);
                if (index !== -1) {
                    state.jobs[index] = payload.job;
                }
            })

            // Get Applications
            .addCase(get_job_applications.fulfilled, (state, { payload }) => {
                state.applications = payload.applications;
                if (payload.job) state.job = payload.job;
                if (payload.stats) state.jobStats = payload.stats;
            })

            // Update Application Status
            .addCase(update_application_status.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                const index = state.applications.findIndex(app => app._id === payload.application._id);
                if (index !== -1) {
                    state.applications[index] = payload.application;
                }
            })
            .addCase(update_application_status.rejected, (state, { payload }) => {
                state.errorMessage = payload?.error || 'Update failed';
            })

            // Get Applied Jobs List
            .addCase(get_applied_jobs.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_applied_jobs.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.applications = payload.applications;
                // state.totalApplications = payload.total; // If we add this to state
            })
            .addCase(get_applied_jobs.rejected, (state, { payload }) => {
                state.loader = false;
                // state.errorMessage = payload.error;
            })

            // Get Job Messages
            .addCase(get_job_messages.fulfilled, (state, { payload }) => {
                state.messages = payload.messages;
            })

            // Send Job Message
            .addCase(send_job_message.fulfilled, (state, { payload }) => {
                state.messages = [...state.messages, payload.data];
                state.successMessage = "Message Sent";
            })
            .addCase(send_job_message.rejected, (state, { payload }) => {
                state.errorMessage = payload.error;
            });
    }
});

export const { messageClear, clearMessages, add_message, update_message_read } = jobReducer.actions;
export default jobReducer.reducer;
