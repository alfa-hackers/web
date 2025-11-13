// store/features/auth/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from './authTypes'
import { authApi } from './authApi'

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
}

export const register = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.register(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk<User, void>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser()
      return response.user
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      )
    }
  }
)

export const initializeAuth = createAsyncThunk<User | null, void>(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser()
      return response.user
    } catch (error: any) {
      return null
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
        state.isInitialized = false
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
        state.user = action.payload
        state.isAuthenticated = !!action.payload
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
        state.isInitialized = true
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
