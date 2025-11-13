import axios from 'axios'
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from './authTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/register', credentials)
    return response.data
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/login', credentials)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout')
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/me')
    return response.data
  },
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login')
      ) {
        console.log('Auth error, redirecting to login')
      }
    }
    return Promise.reject(error)
  }
)
