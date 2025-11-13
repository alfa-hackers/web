import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks'
import {
  login,
  register,
  logout,
  getCurrentUser,
  initializeAuth,
  clearError,
} from './authSlice'
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsInitialized,
} from './authSelectors'
import { LoginCredentials, RegisterCredentials } from './authTypes'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuth)
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const isInitialized = useAppSelector(selectIsInitialized)

  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth())
    }
  }, [dispatch, isInitialized])

  const handleRegister = async (credentials: RegisterCredentials) => {
    const result = await dispatch(register(credentials))
    return result.meta.requestStatus === 'fulfilled'
  }

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await dispatch(login(credentials))
    return result.meta.requestStatus === 'fulfilled'
  }

  const handleLogout = async () => {
    const result = await dispatch(logout())
    return result.meta.requestStatus === 'fulfilled'
  }

  const refreshUser = async () => {
    const result = await dispatch(getCurrentUser())
    return result.meta.requestStatus === 'fulfilled'
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    auth,

    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
    clearError: clearAuthError,
  }
}
