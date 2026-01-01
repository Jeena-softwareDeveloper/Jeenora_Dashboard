import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/api";

export const get_resumes = createAsyncThunk(
    'adminResume/get_resumes',
    async (payload, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { page, limit, search } = payload;
            const { data } = await api.get(`/admin/resumes?page=${page}&limit=${limit}&search=${search}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const delete_resume = createAsyncThunk(
    'adminResume/delete_resume',
    async (id, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.delete(`/admin/resumes/${id}`, { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const adminResumeReducer = createSlice({
    name: 'adminResume',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        resumes: [],
        totalResumes: 0
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_resumes.pending, (state) => {
                state.loader = true;
            })
            .addCase(get_resumes.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.resumes = payload.resumes;
                state.totalResumes = payload.total;
            })
            .addCase(get_resumes.rejected, (state, { payload }) => {
                state.loader = false;
                // state.errorMessage = payload.error;
            })
            .addCase(delete_resume.fulfilled, (state, { payload }) => {
                state.successMessage = payload.message;
                state.resumes = state.resumes.filter(r => r._id !== payload.id);
            })
    }
});

export const { messageClear } = adminResumeReducer.actions;
export default adminResumeReducer.reducer;
