import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '@/api/axios'
import { setToken, clearToken } from '@/utils/cookies'
import appConfig from '@/configs/app.config'

interface ErrorResponse {
    message?: string
    [key: string]: any
}

interface OtpResponse {
    otpSentTo?: string
    message?: string
    user?: User
    token?: string
}

export type SignUpPayload = {
    name: string
    email: string
    phone: string
    provider: string
    providerUserId: string
    password: string
    profilePicture: string
    referralCode?: string
}

type User = { _id: string; email: string; role: string; [k: string]: unknown }

type AuthState = {
    user: User | null
    status: 'idle' | 'loading' | 'error'
    error: string | null
    otpStep: { pending: boolean; identifier?: string; signupData?: SignUpPayload } | null
}

const initialState: AuthState = {
    user: null,
    status: 'idle',
    error: null,
    otpStep: null,
}

// Async Thunks
export const signup = createAsyncThunk<OtpResponse, SignUpPayload, { rejectValue: ErrorResponse }>(
    'authV2/signup',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup', payload)
            return response.data
        } catch (error: any) {
            return rejectWithValue({ message: error.response?.data?.message || error.message })
        }
    }
)

export const verifyOtp = createAsyncThunk<OtpResponse, { identifier: string; code: string; signupData: SignUpPayload }, { rejectValue: ErrorResponse }>(
    'authV2/verifyOtp',
    async ({ identifier, code, signupData }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-otp', {
                identifier,
                code,
                signupData
            })
            
            if (response.data?.token) {
                setToken(response.data.token)
                return response.data
            }

            const loginResponse = await api.post('/auth/login', {
                email: signupData.email,
                password: signupData.password
            })

            if (loginResponse.data?.token) {
                setToken(loginResponse.data.token)
                return loginResponse.data
            }

            return rejectWithValue({ message: 'Failed to authenticate after OTP verification' })
        } catch (error: any) {
            return rejectWithValue({ message: error.response?.data?.message || error.message })
        }
    }
)

export const login = createAsyncThunk<OtpResponse, { email: string; password: string }, { rejectValue: ErrorResponse }>(
    'authV2/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            if (response.data?.token) {
                setToken(response.data.token)
                return response.data
            }
            return rejectWithValue({ message: 'No token received from server' })
        } catch (error: any) {
            return rejectWithValue({ message: error.response?.data?.message || error.message })
        }
    }
)

export const logout = createAsyncThunk<boolean, void, { rejectValue: ErrorResponse }>(
    'authV2/logout',
    async (_, { rejectWithValue }) => {
        try {
            clearToken()
            window.location.replace(appConfig.unAuthenticatedEntryPath)
            return true
        } catch (error: any) {
            return rejectWithValue({ message: error.message })
        }
    }
)

const authV2Slice = createSlice({
    name: 'authV2',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearOtpStep: (state) => {
            state.otpStep = null
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Signup
            .addCase(signup.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.status = 'idle'
                if (action.payload?.message?.includes('OTP sent')) {
                    state.otpStep = {
                        pending: true,
                        identifier: action.payload.otpSentTo,
                        signupData: action.meta.arg
                    }
                }
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = 'error'
                state.error = action.payload?.message || 'Signup failed'
            })

            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.status = 'idle'
                if (action.payload?.user) {
                    state.user = action.payload.user
                }
                state.otpStep = null
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.status = 'error'
                state.error = action.payload?.message || 'OTP verification failed'
            })

            // Login
            .addCase(login.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'idle'
                if (action.payload?.user) {
                    state.user = action.payload.user
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'error'
                state.error = action.payload?.message || 'Login failed'
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = 'idle'
                state.user = null
                state.otpStep = null
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = 'error'
                state.error = action.payload?.message || 'Logout failed'
            })
    }
})

export const { clearError, clearOtpStep, setUser } = authV2Slice.actions
export default authV2Slice.reducer
