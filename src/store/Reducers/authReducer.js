import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";

// Login Actions
export const admin_login = createAsyncThunk(
    'auth/admin_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/admin-login', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Login failed' })
        }
    }
)

export const seller_login = createAsyncThunk(
    'auth/seller_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/seller-login', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Login failed' })
        }
    }
)

export const hire_login = createAsyncThunk(
    'auth/hire_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/hire-login', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Login failed' })
        }
    }
)

// ✅ CORRECTED: Registration Actions - Fixed naming
export const hire_register = createAsyncThunk(
    'auth/hire_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/hire-register', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Registration failed' })
        }
    }
)

export const seller_register = createAsyncThunk(
    'auth/seller_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/seller-register', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Registration failed' })
        }
    }
)

// User Profile Actions
export const get_user_info = createAsyncThunk(
    'auth/get_user_info',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/get-user', { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to get user info' })
        }
    }
)

export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async (image, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-image-upload', image, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Image upload failed' })
        }
    }
)

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-info-add', info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Profile update failed' })
        }
    }
)

// Logout Action
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/logout', { withCredentials: true });
            localStorage.removeItem('accessToken');
            return data;
        } catch (error) {
            localStorage.removeItem('accessToken');
            return rejectWithValue(error.response?.data || { error: 'Logout failed' });
        }
    }
);

// Helper function to get role from token
const returnRole = (token) => {
    if (token) {
        try {
            const decodeToken = jwtDecode(token);
            const expireTime = new Date(decodeToken.exp * 1000);

            if (new Date() > expireTime) {
                localStorage.removeItem('accessToken');
                return '';
            } else {
                return decodeToken.role;
            }
        } catch (error) {
            localStorage.removeItem('accessToken');
            return '';
        }
    } else {
        return '';
    }
}

// Auth Slice
export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : '',
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        },
        clearAuth: (state) => {
            state.successMessage = '';
            state.errorMessage = '';
            state.userInfo = '';
            state.role = '';
            state.token = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
        }
    },
    extraReducers: (builder) => {
        builder
            // Login Cases
            .addCase(admin_login.pending, (state) => {
                state.loader = true;
                state.errorMessage = '';
            })
            .addCase(admin_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Login failed';
            })
            .addCase(admin_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
            })

            .addCase(seller_login.pending, (state) => {
                state.loader = true;
                state.errorMessage = '';
            })
            .addCase(seller_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Login failed';
            })
            .addCase(seller_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
            })

            .addCase(hire_login.pending, (state) => {
                state.loader = true;
                state.errorMessage = '';
            })
            .addCase(hire_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Login failed';
            })
            .addCase(hire_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
            })

            // ✅ CORRECTED: Registration Cases - Fixed naming
            .addCase(hire_register.pending, (state) => {
                state.loader = true;
                state.errorMessage = '';
            })
            .addCase(hire_register.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Registration failed';
            })
            .addCase(hire_register.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
            })

            .addCase(seller_register.pending, (state) => {
                state.loader = true;
                state.errorMessage = '';
            })
            .addCase(seller_register.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Registration failed';
            })
            .addCase(seller_register.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = payload.token;
                state.role = returnRole(payload.token);
            })

            // Profile Cases
            .addCase(get_user_info.fulfilled, (state, { payload }) => {
                state.userInfo = payload.userInfo;
                localStorage.setItem('userInfo', JSON.stringify(payload.userInfo));
            })

            .addCase(profile_image_upload.pending, (state) => {
                state.loader = true;
            })
            .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo;
                localStorage.setItem('userInfo', JSON.stringify(payload.userInfo));
                state.successMessage = payload.message;
            })
            .addCase(profile_image_upload.rejected, (state) => {
                state.loader = false;
            })

            .addCase(profile_info_add.pending, (state) => {
                state.loader = true;
            })
            .addCase(profile_info_add.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.userInfo = payload.userInfo;
                localStorage.setItem('userInfo', JSON.stringify(payload.userInfo));
            })
            .addCase(profile_info_add.rejected, (state) => {
                state.loader = false;
            })

            // Logout Case
            .addCase(logout.pending, (state) => {
                state.loader = true;
            })
            .addCase(logout.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.error || 'Logout failed';
                // Clear state even if API call fails
                state.token = null;
                state.role = '';
                state.userInfo = '';
                localStorage.removeItem('userInfo');
            })
            .addCase(logout.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
                state.token = null;
                state.role = '';
                state.userInfo = '';
                localStorage.removeItem('userInfo');
            });
    }
})

export const { messageClear, clearAuth } = authReducer.actions;
export default authReducer.reducer;