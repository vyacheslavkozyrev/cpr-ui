import {
  format,
  formatDistance,
  formatRelative,
  isValid,
  parseISO,
} from 'date-fns'
import { be, enUS, es, fr } from 'date-fns/locale'
import type { TLanguageCode } from '../config/i18n'
import { logger } from './logger'

// Date-fns locale mapping to our language codes
const DATE_LOCALES = {
  en: enUS,
  es: es,
  fr: fr,
  be: be, // Belarusian locale is available in date-fns
} as const

// Common date formats for different use cases
export const DATE_FORMATS = {
  SHORT: 'P', // 04/29/1453 (locale-aware)
  MEDIUM: 'PP', // Apr 29, 1453 (locale-aware)
  LONG: 'PPP', // April 29th, 1453 (locale-aware)
  FULL: 'PPPP', // Friday, April 29th, 1453 (locale-aware)

  // Time formats
  TIME_SHORT: 'p', // 5:46 AM (locale-aware)
  TIME_MEDIUM: 'pp', // 5:46:13 AM (locale-aware)

  // Date + Time formats
  DATETIME_SHORT: 'Pp', // 04/29/1453, 5:46 AM
  DATETIME_MEDIUM: 'PPp', // Apr 29, 1453, 5:46 AM
  DATETIME_LONG: 'PPPp', // April 29th, 1453 at 5:46 AM
  DATETIME_FULL: 'PPPPp', // Friday, April 29th, 1453 at 5:46:13 AM

  // Custom formats
  MONTH_YEAR: 'MMMM yyyy', // April 2023
  DAY_MONTH: 'dd MMM', // 29 Apr
  WEEKDAY_SHORT: 'EEE', // Fri
  WEEKDAY_LONG: 'EEEE', // Friday
} as const

export type TDateFormat = keyof typeof DATE_FORMATS

/**
 * Get the date-fns locale object for a given language code
 */
export const getDateLocale = (languageCode: TLanguageCode) => {
  return DATE_LOCALES[languageCode] || DATE_LOCALES.en
}

/**
 * Format a date using the current language locale
 */
export const formatDate = (
  date: Date | string | number,
  formatString: TDateFormat | string = 'MEDIUM',
  languageCode: TLanguageCode = 'en'
): string => {
  try {
    // Parse string dates
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)

    // Validate date
    if (!isValid(dateObj)) {
      logger.warn('Invalid date provided to formatDate', { date })
      return 'Invalid Date'
    }

    // Get format string
    const formatStr = DATE_FORMATS[formatString as TDateFormat] || formatString

    // Get locale
    const locale = getDateLocale(languageCode)

    // Format the date
    return format(dateObj, formatStr, { locale })
  } catch (error) {
    logger.error('Error formatting date', { error })
    return 'Invalid Date'
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export const formatDateDistance = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  options: { addSuffix?: boolean; includeSeconds?: boolean } = {
    addSuffix: true,
  },
  languageCode: TLanguageCode = 'en'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (!isValid(dateObj)) {
      logger.warn('Invalid date provided to formatDateDistance', { date })
      return 'Invalid Date'
    }

    const locale = getDateLocale(languageCode)

    return formatDistance(dateObj, baseDate, {
      ...options,
      locale,
    })
  } catch (error) {
    logger.error('Error formatting date distance', { error })
    return 'Invalid Date'
  }
}

/**
 * Format a date relative to now with context (e.g., "yesterday at 3:20 PM", "next Friday at 2:15 PM")
 */
export const formatDateRelative = (
  date: Date | string | number,
  baseDate: Date = new Date(),
  languageCode: TLanguageCode = 'en'
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)

    if (!isValid(dateObj)) {
      logger.warn('Invalid date provided to formatDateRelative', { date })
      return 'Invalid Date'
    }

    const locale = getDateLocale(languageCode)

    return formatRelative(dateObj, baseDate, { locale })
  } catch (error) {
    logger.error('Error formatting relative date', { error })
    return 'Invalid Date'
  }
}

/**
 * Get the user's preferred date format based on locale
 */
export const getPreferredDateFormat = (
  languageCode: TLanguageCode
): TDateFormat => {
  // Different locales may prefer different date formats
  switch (languageCode) {
    case 'en':
      return 'MEDIUM' // Apr 29, 1453
    case 'es':
    case 'fr':
      return 'MEDIUM' // 29 abr 1453 / 29 avr. 1453
    case 'be':
      return 'MEDIUM' // Fallback to medium format
    default:
      return 'MEDIUM'
  }
}

/**
 * Check if a date string is valid
 */
export const isValidDate = (date: Date | string | number): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return isValid(dateObj)
  } catch {
    return false
  }
}
