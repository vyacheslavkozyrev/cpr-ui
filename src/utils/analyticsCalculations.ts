// Analytics calculation utilities for Feedback Analytics Dashboard
// Feature 0005 - Task T085

/**
 * Time range preset options for analytics
 */
export const TimeRangePreset = {
  Last30Days: 'last_30_days',
  Last90Days: 'last_90_days',
  Last6Months: 'last_6_months',
  YearToDate: 'year_to_date',
  AllTime: 'all_time',
  Custom: 'custom',
} as const

export type TimeRangePreset =
  (typeof TimeRangePreset)[keyof typeof TimeRangePreset]

/**
 * Custom date range interface
 */
export interface CustomDateRange {
  /** Start date (ISO 8601 format YYYY-MM-DD) */
  start_date: string
  /** End date (ISO 8601 format YYYY-MM-DD) */
  end_date: string
}

/**
 * Date range result with start and end dates
 */
export interface DateRange {
  /** Start date (ISO 8601 format) */
  date_from: string
  /** End date (ISO 8601 format) */
  date_to: string
}

/**
 * Calculate date range based on preset or custom range
 *
 * @param preset - Time range preset
 * @param customRange - Custom date range (required if preset is 'custom')
 * @returns Date range with start and end dates
 *
 * @example
 * // Last 30 days
 * calculateDateRange('last_30_days')
 * // Returns: { date_from: '2024-11-19', date_to: '2024-12-19' }
 *
 * @example
 * // Custom range
 * calculateDateRange('custom', { start_date: '2024-01-01', end_date: '2024-12-31' })
 * // Returns: { date_from: '2024-01-01', date_to: '2024-12-31' }
 */
export function calculateDateRange(
  preset: TimeRangePreset,
  customRange?: CustomDateRange
): DateRange {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  let dateFrom: Date
  const dateTo: Date = today

  switch (preset) {
    case TimeRangePreset.Last30Days:
      dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 30)
      break

    case TimeRangePreset.Last90Days:
      dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 90)
      break

    case TimeRangePreset.Last6Months:
      dateFrom = new Date(today)
      dateFrom.setMonth(dateFrom.getMonth() - 6)
      break

    case TimeRangePreset.YearToDate:
      dateFrom = new Date(today.getFullYear(), 0, 1) // January 1st of current year
      break

    case TimeRangePreset.AllTime:
      // Set to a very old date (e.g., 10 years ago)
      dateFrom = new Date(today)
      dateFrom.setFullYear(dateFrom.getFullYear() - 10)
      break

    case TimeRangePreset.Custom:
      if (!customRange) {
        throw new Error('Custom range requires start_date and end_date')
      }
      return {
        date_from: customRange.start_date,
        date_to: customRange.end_date,
      }

    default:
      // Default to last 30 days
      dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 30)
  }

  return {
    date_from: formatDateToISO(dateFrom),
    date_to: formatDateToISO(dateTo),
  }
}

/**
 * Calculate previous period date range for comparison
 * Uses same duration as current period, immediately before current period start
 *
 * @param currentRange - Current date range
 * @param preset - Time range preset (used for special handling of YTD)
 * @returns Previous period date range
 *
 * @example
 * // For current range 2024-11-19 to 2024-12-19 (30 days)
 * calculatePreviousPeriod({ date_from: '2024-11-19', date_to: '2024-12-19' }, 'last_30_days')
 * // Returns: { date_from: '2024-10-20', date_to: '2024-11-18' }
 *
 * @example
 * // For YTD 2025-01-01 to 2025-11-20 (partial year)
 * calculatePreviousPeriod({ date_from: '2025-01-01', date_to: '2025-11-20' }, 'year_to_date')
 * // Returns: { date_from: '2024-01-01', date_to: '2024-12-31' } (full previous year)
 */
export function calculatePreviousPeriod(
  currentRange: DateRange,
  preset: TimeRangePreset
): DateRange {
  const currentStart = new Date(currentRange.date_from)
  const currentEnd = new Date(currentRange.date_to)

  // Special handling for Year to Date: compare with full previous calendar year
  if (preset === TimeRangePreset.YearToDate) {
    const currentYear = currentStart.getFullYear()
    const previousYear = currentYear - 1
    return {
      date_from: `${previousYear}-01-01`,
      date_to: `${previousYear}-12-31`,
    }
  }

  // Calculate duration in milliseconds
  const durationMs = currentEnd.getTime() - currentStart.getTime()

  // Previous period ends one day before current period starts
  const previousEnd = new Date(currentStart)
  previousEnd.setDate(previousEnd.getDate() - 1)

  // Previous period starts [duration] before previous end
  const previousStart = new Date(previousEnd.getTime() - durationMs)

  return {
    date_from: formatDateToISO(previousStart),
    date_to: formatDateToISO(previousEnd),
  }
}

/**
 * Format date to ISO 8601 date string (YYYY-MM-DD)
 *
 * @param date - Date object
 * @returns ISO formatted date string
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date range for display
 *
 * @param range - Date range
 * @param preset - Time range preset (for friendly labels)
 * @returns Formatted date range string
 *
 * @example
 * formatDateRangeForDisplay({ date_from: '2024-11-19', date_to: '2024-12-19' }, 'last_30_days')
 * // Returns: "Nov 19, 2024 - Dec 19, 2024"
 */
export function formatDateRangeForDisplay(
  range: DateRange,
  preset?: TimeRangePreset
): string {
  // Use friendly labels for common presets
  const presetLabels: Record<string, string> = {
    [TimeRangePreset.Last30Days]: 'Last 30 Days',
    [TimeRangePreset.Last90Days]: 'Last 90 Days',
    [TimeRangePreset.Last6Months]: 'Last 6 Months',
    [TimeRangePreset.YearToDate]: 'Year to Date',
    [TimeRangePreset.AllTime]: 'All Time',
  }

  if (preset && presetLabels[preset]) {
    return presetLabels[preset]
  }

  // Format custom date range
  const startDate = new Date(range.date_from)
  const endDate = new Date(range.date_to)

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  const startFormatted = startDate.toLocaleDateString('en-US', options)
  const endFormatted = endDate.toLocaleDateString('en-US', options)

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Calculate percentage change between two values
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (e.g., 12.5 for 12.5% increase)
 *
 * @example
 * calculatePercentageChange(45, 40) // Returns: 12.5 (12.5% increase)
 * calculatePercentageChange(40, 45) // Returns: -11.11 (11.11% decrease)
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

/**
 * Format percentage change for display with sign
 *
 * @param change - Percentage change
 * @returns Formatted string (e.g., "+12.5%", "-11.1%")
 */
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

/**
 * Get trend indicator (↑ or ↓) based on change value
 *
 * @param change - Percentage change
 * @returns Trend indicator
 */
export function getTrendIndicator(change: number): '↑' | '↓' | '→' {
  if (change > 0) return '↑'
  if (change < 0) return '↓'
  return '→'
}

/**
 * Get trend color class based on change value
 * Green for positive, red for negative, gray for neutral
 *
 * @param change - Percentage change
 * @returns Color class name
 */
export function getTrendColorClass(change: number): string {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-500'
}
