// store/features/auth/authSelectors.ts

import { RootState } from '../../store'

export const selectAuth = (state: RootState) => state.auth

export const selectUser = (state: RootState) => state.auth.user

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated

export const selectAuthLoading = (state: RootState) => state.auth.isLoading

export const selectAuthError = (state: RootState) => state.auth.error

export const selectIsInitialized = (state: RootState) =>
  state.auth.isInitialized

export const selectUserEmail = (state: RootState) => state.auth.user?.email

export const selectUsername = (state: RootState) => state.auth.user?.username
