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
    },
    {
        condition: (_, { getState }) => {
            const { adminSettings } = getState();
            // Perform check: if already loaded or currently loading, cancel the request
            if (adminSettings.loading || adminSettings.isLoaded) {
                return false;
            }
        }
    }
);

export const updateMenuDisplaySettings = createAsyncThunk(
    'adminSettings/updateMenuDisplaySettings',
    async (payload, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/admin/settings/menu-display-mode', payload, { withCredentials: true });
            return fulfillWithValue(data); // data likely contains the updated setting
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const adminSettingsReducer = createSlice({
    name: 'adminSettings',
    initialState: {
        menuDisplaySettings: localStorage.getItem('menuDisplaySettings') ? JSON.parse(localStorage.getItem('menuDisplaySettings')) : {},
        loading: false,
        isLoaded: false,
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
                state.isLoaded = true;
                const settings = payload.setting?.settingValue || {};
                state.menuDisplaySettings = settings;
                localStorage.setItem('menuDisplaySettings', JSON.stringify(settings));
            })
            .addCase(getMenuDisplaySettings.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to fetch settings';
            })
            .addCase(updateMenuDisplaySettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateMenuDisplaySettings.fulfilled, (state, { payload }) => {
                state.loading = false;
                // Assuming payload.setting.settingValue contains the new full object, or we merge it.
                // Based on Sellers.jsx: const response = await api.post...
                // response.data likely has success message and maybe the data.
                // Ideally backend returns the updated setting object.
                // If it returns { message: '...', setting: { settingValue: {...} } }
                if (payload.setting?.settingValue) {
                    state.menuDisplaySettings = payload.setting.settingValue;
                    localStorage.setItem('menuDisplaySettings', JSON.stringify(payload.setting.settingValue));
                }
            })
            .addCase(updateMenuDisplaySettings.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload?.error || 'Failed to update settings';
            });
    }
});

export const { messageClear } = adminSettingsReducer.actions;
export default adminSettingsReducer.reducer;
