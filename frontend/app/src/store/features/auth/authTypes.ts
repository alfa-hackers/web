export interface User {
  id: string
  email?: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface RegisterCredentials {
  email?: string
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  message?: string
}
