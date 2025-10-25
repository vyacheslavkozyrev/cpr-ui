/**
 * Standard API response wrapper
 * All API endpoints should return data in this format
 */
export interface TApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

/**
 * Standard API error structure
 * Used for consistent error handling across the application
 */
export interface TApiError extends Error {
  message: string
  code: string
  status: number
  timestamp: string
  details?: any
}

/**
 * HTTP request configuration options
 */
export interface TRequestConfig {
  headers?: Record<string, string>
  signal?: AbortSignal
  timeout?: number
}

/**
 * File upload progress callback
 */
export type TUploadProgressCallback = (progress: {
  loaded: number
  total: number
  percentage: number
}) => void

/**
 * API client error types
 */
export const EApiErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type TApiErrorCode = (typeof EApiErrorCode)[keyof typeof EApiErrorCode]

/**
 * HTTP methods supported by the API client
 */
export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Request init options extending the standard fetch RequestInit
 */
export interface TApiRequestInit extends Omit<RequestInit, 'body' | 'method'> {
  timeout?: number
  data?: any
}

/**
 * User position information from /me API
 */
export interface TUserPosition {
  id: string
  title: string
}

/**
 * Current user information from /me API response
 */
export interface TCurrentUser {
  user_id: string
  employee_id: string
  user_name: string
  display_name: string
  email: string | null
  position: TUserPosition
}

/**
 * /me API response structure
 */
export type TMeApiResponse = TCurrentUser
