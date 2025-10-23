import type {
  TApiError,
  TApiResponse,
  THttpMethod,
  TRequestConfig,
  TUploadProgressCallback,
} from '../types/apiTypes'
import { EApiErrorCode } from '../types/apiTypes'

/**
 * API configuration constants
 */
const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  LOCALHOST_FALLBACK: 'http://localhost:5000/api',
} as const

/**
 * Get the appropriate base URL based on the environment
 */
const getBaseUrl = (): string => {
  // Get API base URL from environment variable
  const envBaseUrl = import.meta.env['VITE_API_BASE_URL']

  // If VITE_API_BASE_URL is set, use it directly
  if (envBaseUrl) {
    return envBaseUrl
  }

  // Fallback to localhost if no environment variable is configured
  return API_CONFIG.LOCALHOST_FALLBACK
}

/**
 * Enhanced API client class using native fetch API
 */
class ApiClient {
  private baseUrl: string
  private authTokenGetter: (() => Promise<string | null>) | null = null

  constructor() {
    this.baseUrl = getBaseUrl()
  }

  /**
   * Set the authentication token getter function
   * This will be called for each request that requires authentication
   */
  public setAuthTokenGetter(tokenGetter: () => Promise<string | null>): void {
    this.authTokenGetter = tokenGetter
  }

  /**
   * Create request headers with authentication and common headers
   */
  private async createHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Headers> {
    const headers = new Headers()

    // Set default headers
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')

    // Add authentication token if available
    if (this.authTokenGetter) {
      const token = await this.authTokenGetter()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    // Add request ID for tracing
    headers.set('X-Request-ID', this.generateRequestId())

    // Add custom headers
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }

    return headers
  }

  /**
   * Create fetch request with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = API_CONFIG.TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError(
          EApiErrorCode.TIMEOUT_ERROR,
          `Request timeout after ${timeout}ms`,
          408
        )
      }

      throw error
    }
  }

  /**
   * Make HTTP request with error handling and logging
   */
  private async request<T = any>(
    method: THttpMethod,
    endpoint: string,
    data?: any,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      // Create headers
      const headers = await this.createHeaders(config?.headers)

      // Prepare request body
      let body: string | FormData | undefined
      if (data) {
        if (data instanceof FormData) {
          body = data
          // Remove Content-Type header for FormData (browser will set it with boundary)
          headers.delete('Content-Type')
        } else {
          body = JSON.stringify(data)
        }
      }

      // Log request in development
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request [${method}]:`, {
          url,
          data,
          headers: Object.fromEntries(headers.entries()),
        })
      }

      // Make request
      const requestOptions: RequestInit = {
        method,
        headers,
        signal: config?.signal || null,
      }

      // Only add body if it's not undefined
      if (body !== undefined) {
        requestOptions.body = body
      }

      const response = await this.fetchWithTimeout(
        url,
        requestOptions,
        config?.timeout
      )

      // Handle response
      const responseData = await this.handleResponse<T>(response)

      // Log response in development
      if (import.meta.env.DEV) {
        console.log(`✅ API Response [${response.status}]:`, {
          url,
          data: responseData,
        })
      }

      return responseData
    } catch (error) {
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error:`, {
          url,
          method,
          error,
        })
      }

      // Re-throw if already a TApiError
      if (this.isApiError(error)) {
        throw error
      }

      // Transform other errors
      throw this.transformError(error)
    }
  }

  /**
   * Handle fetch response and parse JSON
   */
  private async handleResponse<T>(
    response: Response
  ): Promise<TApiResponse<T>> {
    let data: any

    try {
      // Check if response has content
      const contentType = response.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
    } catch (error) {
      console.error('Failed to parse response:', error)
      throw this.createError(
        EApiErrorCode.PARSE_ERROR,
        'Failed to parse response data',
        response.status
      )
    }

    // Handle HTTP error status codes
    if (!response.ok) {
      const errorMessage =
        data?.message || `HTTP ${response.status}: ${response.statusText}`
      const errorCode = this.getErrorCodeByStatus(response.status)

      throw this.createError(errorCode, errorMessage, response.status, data)
    }

    // Return standardized response
    return {
      data,
      message: data?.message,
      success: true,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Transform various error types into TApiError
   */
  private transformError(error: any): TApiError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        EApiErrorCode.NETWORK_ERROR,
        'Network error - please check your connection',
        0
      )
    }

    return this.createError(
      EApiErrorCode.UNKNOWN_ERROR,
      error.message || 'An unexpected error occurred',
      500
    )
  }

  /**
   * Create standardized API error
   */
  private createError(
    code: string,
    message: string,
    status: number,
    details?: any
  ): TApiError {
    const error = new Error(message) as TApiError
    error.code = code
    error.status = status
    error.timestamp = new Date().toISOString()
    error.details = details
    return error
  }

  /**
   * Check if error is already a TApiError
   */
  private isApiError(error: any): error is TApiError {
    return (
      error &&
      typeof error.code === 'string' &&
      typeof error.status === 'number'
    )
  }

  /**
   * Get error code based on HTTP status
   */
  private getErrorCodeByStatus(status: number): string {
    switch (status) {
      case 400:
        return EApiErrorCode.VALIDATION_ERROR
      case 401:
        return EApiErrorCode.AUTHENTICATION_ERROR
      case 403:
        return EApiErrorCode.AUTHORIZATION_ERROR
      case 404:
        return EApiErrorCode.NOT_FOUND_ERROR
      case 408:
        return EApiErrorCode.TIMEOUT_ERROR
      case 500:
      case 502:
      case 503:
      case 504:
        return EApiErrorCode.SERVER_ERROR
      default:
        return EApiErrorCode.UNKNOWN_ERROR
    }
  }

  /**
   * Generate a unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Generic GET request
   */
  public async get<T = any>(
    endpoint: string,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config)
  }

  /**
   * Generic POST request
   */
  public async post<T = any, D = any>(
    endpoint: string,
    data?: D,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config)
  }

  /**
   * Generic PUT request
   */
  public async put<T = any, D = any>(
    endpoint: string,
    data?: D,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config)
  }

  /**
   * Generic PATCH request
   */
  public async patch<T = any, D = any>(
    endpoint: string,
    data?: D,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config)
  }

  /**
   * Generic DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: TRequestConfig
  ): Promise<TApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config)
  }

  /**
   * Upload file with progress tracking (using XMLHttpRequest for progress)
   */
  public async uploadFile<T = any>(
    endpoint: string,
    file: File,
    onProgress?: TUploadProgressCallback
  ): Promise<TApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${endpoint}`
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append('file', file)

      // Setup progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100)
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            })
          }
        })
      }

      // Handle response
      xhr.addEventListener('load', () => {
        try {
          const response: TApiResponse<T> = JSON.parse(xhr.responseText)

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response)
          } else {
            const error = this.createError(
              this.getErrorCodeByStatus(xhr.status),
              response.message || `Upload failed with status ${xhr.status}`,
              xhr.status,
              response
            )
            reject(error)
          }
        } catch (parseError) {
          console.error('Failed to parse upload response:', parseError)
          const error = this.createError(
            EApiErrorCode.PARSE_ERROR,
            'Failed to parse upload response',
            xhr.status
          )
          reject(error)
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = this.createError(
          EApiErrorCode.NETWORK_ERROR,
          'File upload failed due to network error',
          0
        )
        reject(error)
      })

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        const error = this.createError(
          EApiErrorCode.TIMEOUT_ERROR,
          'File upload timed out',
          408
        )
        reject(error)
      })

      // Setup request
      xhr.timeout = API_CONFIG.TIMEOUT
      xhr.open('POST', url)

      // Add auth header if available
      this.authTokenGetter?.()
        .then(token => {
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          }

          // Add request ID
          xhr.setRequestHeader('X-Request-ID', this.generateRequestId())

          // Send request
          xhr.send(formData)
        })
        .catch(reject)
    })
  }

  /**
   * Get base URL for direct usage
   */
  public getBaseUrl(): string {
    return this.baseUrl
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient()

/**
 * Initialize API client with authentication token getter
 * This should be called during app initialization
 */
export const initializeApiClient = (
  tokenGetter: () => Promise<string | null>
): void => {
  apiClient.setAuthTokenGetter(tokenGetter)
}

export default apiClient
