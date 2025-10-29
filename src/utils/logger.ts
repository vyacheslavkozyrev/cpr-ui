/**
 * Application logger utility
 * Provides structured logging with different levels and environment-aware output
 */

export const ELogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const

export type TLogLevel = (typeof ELogLevel)[keyof typeof ELogLevel]

interface ILogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment: boolean
  private isTest: boolean

  constructor() {
    this.isDevelopment =
      import.meta.env.DEV || import.meta.env['MODE'] === 'development'
    this.isTest =
      import.meta.env['VITEST'] || import.meta.env['NODE_ENV'] === 'test'
  }

  /**
   * Log error messages - always shown
   */
  public error(message: string, context?: ILogContext): void {
    this.log(ELogLevel.ERROR, message, context)
  }

  /**
   * Log warning messages - shown in development
   */
  public warn(message: string, context?: ILogContext): void {
    if (this.isDevelopment && !this.isTest) {
      this.log(ELogLevel.WARN, message, context)
    }
  }

  /**
   * Log info messages - shown in development
   */
  public info(message: string, context?: ILogContext): void {
    if (this.isDevelopment && !this.isTest) {
      this.log(ELogLevel.INFO, message, context)
    }
  }

  /**
   * Log debug messages - shown in development only
   */
  public debug(message: string, context?: ILogContext): void {
    if (this.isDevelopment && !this.isTest) {
      this.log(ELogLevel.DEBUG, message, context)
    }
  }

  /**
   * Internal logging implementation
   */
  private log(level: TLogLevel, message: string, context?: ILogContext): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case ELogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(prefix, message, context || '')
        break
      case ELogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(prefix, message, context || '')
        break
      case ELogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(prefix, message, context || '')
        break
      case ELogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(prefix, message, context || '')
        break
    }
  }

  /**
   * API request logging helper
   */
  public apiRequest(method: string, url: string, data?: unknown): void {
    this.debug(`🚀 API Request [${method}]`, { url, data })
  }

  /**
   * API response logging helper
   */
  public apiResponse(status: number, url: string, data?: unknown): void {
    this.debug(`✅ API Response [${status}]`, { url, data })
  }

  /**
   * API error logging helper
   */
  public apiError(method: string, url: string, error: unknown): void {
    this.error(`❌ API Error [${method}]`, { url, error })
  }

  /**
   * Authentication logging helper
   */
  public auth(message: string, context?: ILogContext): void {
    this.info(`🔐 Auth: ${message}`, context)
  }

  /**
   * MSW logging helper
   */
  public msw(message: string, context?: ILogContext): void {
    this.info(`🎭 MSW: ${message}`, context)
  }

  /**
   * Theme logging helper
   */
  public theme(message: string, context?: ILogContext): void {
    this.debug(`🎨 Theme: ${message}`, context)
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Convenience export for common usage
 */
export default logger
