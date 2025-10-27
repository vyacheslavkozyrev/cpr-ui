import { useCallback } from 'react'
import type { TLanguageCode } from '../config/i18n'
import { useLanguageStore } from '../stores/languageStore'
import {
  formatDate,
  formatDateDistance,
  formatDateRelative,
  getPreferredDateFormat,
  isValidDate,
  type TDateFormat,
} from '../utils/dateLocalization'

export interface IUseDateFormat {
  // Current language code
  language: TLanguageCode

  // Format functions that use the current language
  formatDate: (
    date: Date | string | number,
    format?: TDateFormat | string
  ) => string

  formatDateDistance: (
    date: Date | string | number,
    baseDate?: Date,
    options?: { addSuffix?: boolean; includeSeconds?: boolean }
  ) => string

  formatDateRelative: (date: Date | string | number, baseDate?: Date) => string

  // Utility functions
  getPreferredFormat: () => TDateFormat
  isValidDate: (date: Date | string | number) => boolean

  // Quick format shortcuts
  formatShort: (date: Date | string | number) => string
  formatMedium: (date: Date | string | number) => string
  formatLong: (date: Date | string | number) => string
  formatDateTime: (date: Date | string | number) => string
  formatTimeAgo: (date: Date | string | number) => string
}

/**
 * Hook for localized date formatting
 *
 * Automatically uses the current language from the language store
 * and provides convenient formatting functions.
 *
 * @example
 * ```tsx
 * const { formatDate, formatTimeAgo } = useDateFormat()
 *
 * return (
 *   <div>
 *     <p>Created: {formatDate(user.createdAt, 'MEDIUM')}</p>
 *     <p>Last seen: {formatTimeAgo(user.lastLogin)}</p>
 *   </div>
 * )
 * ```
 */
export const useDateFormat = (): IUseDateFormat => {
  const { language, dateFormat: userDateFormat } = useLanguageStore()

  // Format date with current language
  const formatDateLocalized = useCallback(
    (date: Date | string | number, format?: TDateFormat | string) => {
      // Use user's preferred format if no format specified
      const formatToUse = format || userDateFormat
      return formatDate(date, formatToUse, language)
    },
    [language, userDateFormat]
  )

  // Format date distance with current language
  const formatDateDistanceLocalized = useCallback(
    (
      date: Date | string | number,
      baseDate: Date = new Date(),
      options: { addSuffix?: boolean; includeSeconds?: boolean } = {
        addSuffix: true,
      }
    ) => {
      return formatDateDistance(date, baseDate, options, language)
    },
    [language]
  )

  // Format relative date with current language
  const formatDateRelativeLocalized = useCallback(
    (date: Date | string | number, baseDate: Date = new Date()) => {
      return formatDateRelative(date, baseDate, language)
    },
    [language]
  )

  // Get preferred format for current language
  const getPreferredFormatLocalized = useCallback(() => {
    // Return user's selected format, fall back to language default
    return userDateFormat || getPreferredDateFormat(language)
  }, [language, userDateFormat])

  // Quick format shortcuts
  const formatShort = useCallback(
    (date: Date | string | number) => formatDateLocalized(date, 'SHORT'),
    [formatDateLocalized]
  )

  const formatMedium = useCallback(
    (date: Date | string | number) => formatDateLocalized(date, 'MEDIUM'),
    [formatDateLocalized]
  )

  const formatLong = useCallback(
    (date: Date | string | number) => formatDateLocalized(date, 'LONG'),
    [formatDateLocalized]
  )

  const formatDateTime = useCallback(
    (date: Date | string | number) =>
      formatDateLocalized(date, 'DATETIME_MEDIUM'),
    [formatDateLocalized]
  )

  const formatTimeAgo = useCallback(
    (date: Date | string | number) => formatDateDistanceLocalized(date),
    [formatDateDistanceLocalized]
  )

  return {
    language,
    formatDate: formatDateLocalized,
    formatDateDistance: formatDateDistanceLocalized,
    formatDateRelative: formatDateRelativeLocalized,
    getPreferredFormat: getPreferredFormatLocalized,
    isValidDate,
    formatShort,
    formatMedium,
    formatLong,
    formatDateTime,
    formatTimeAgo,
  }
}
