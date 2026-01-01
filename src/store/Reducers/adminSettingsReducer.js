import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const getMenuDisplaySettings = createAsyncThunk(
    'adminSettings/getMenuDisplaySettings',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/admin/settings/menuDisplayMode', { withCredentials: true });
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const adminSettingsReducer = createSlice({
    name: 'adminSettings',
    initialState: {
        menuDisplaySettings: {},
        loading: false,
        error: ''
    },
    reducers: {
        messageClear: (state) => {
            state.error = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMenuDisplaySettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMenuDisplaySettings.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.menuDisplaySettings = payload.setting?.settingValue || {};
            })
            .addCase(getMenuDisplaySettings.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch settings';
            });
    }
});

export const { messageClear } = adminSettingsReducer.actions;
export default adminSettingsReducer.reducer;
