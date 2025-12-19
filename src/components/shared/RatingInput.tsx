// RatingInput Component
// Feature 0005 - Feedback Submission Collection
// Controlled 1-5 star rating input with hover labels

import {
  Rating,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RatingValue } from '../../types/feedback'

// Style factory outside component (per CPR Constitutional Principle 8)
const getStyles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  rating: {
    fontSize: '2rem',
    '& .MuiRating-iconEmpty': {
      color: theme.palette.grey[400],
    },
  },
  label: {
    minWidth: 150,
    fontWeight: 500,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
  },
})

/**
 * Props for RatingInput component
 */
export interface RatingInputProps {
  /** Current rating value (1-5) */
  value: RatingValue | null
  /** Change handler */
  onChange: (value: RatingValue | null) => void
  /** Disabled state */
  disabled?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  helperText?: string
  /** Required field indicator */
  required?: boolean
  /** Label text */
  label?: string
}

/**
 * Rating labels for 1-5 scale (translatable)
 */
const getRatingLabels = (
  t: (key: string) => string
): Record<number, string> => ({
  1: t('pages.feedback.rating.label_1'), // "Needs Improvement"
  2: t('pages.feedback.rating.label_2'), // "Below Expectations"
  3: t('pages.feedback.rating.label_3'), // "Meets Expectations"
  4: t('pages.feedback.rating.label_4'), // "Exceeds Expectations"
  5: t('pages.feedback.rating.label_5'), // "Outstanding"
})

/**
 * RatingInput Component
 * 1-5 star rating input with hover labels and accessibility
 *
 * Features:
 * - Controlled component (value + onChange)
 * - Hover labels showing rating descriptions
 * - Error state with helper text
 * - Keyboard accessible
 * - Screen reader support
 * - Required field indicator
 *
 * Usage:
 * ```tsx
 * <RatingInput
 *   value={rating}
 *   onChange={setRating}
 *   required
 *   error={!!errors.rating}
 *   helperText={errors.rating?.message}
 * />
 * ```
 */
export const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  required = false,
  label,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])
  const ratingLabels = useMemo(() => getRatingLabels(t), [t])

  // Hover state for showing label
  const [hover, setHover] = useState<number>(-1)

  // Get label text (hover label takes precedence, then selected value label)
  const displayLabel = useMemo(() => {
    const labelValue = hover !== -1 ? hover : value
    return labelValue
      ? ratingLabels[labelValue]
      : t('pages.feedback.rating.select_rating')
  }, [hover, value, ratingLabels, t])

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: number | null
  ) => {
    onChange(newValue as RatingValue | null)
  }

  return (
    <Stack sx={styles.container}>
      {label && (
        <Typography variant='body2' color='text.secondary'>
          {label}
          {required && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
        </Typography>
      )}
      <Stack sx={styles.ratingRow}>
        <Tooltip title={t('feedback.rating.tooltip')} placement='top'>
          <Rating
            value={value}
            onChange={handleChange}
            onChangeActive={(_event, newHover) => setHover(newHover)}
            disabled={disabled}
            size='large'
            sx={styles.rating}
            max={5}
            precision={1}
            aria-label={t('feedback.rating.aria_label')}
          />
        </Tooltip>
        <Typography
          variant='body2'
          sx={{
            ...styles.label,
            color: error
              ? theme.palette.error.main
              : theme.palette.text.primary,
            fontWeight: hover !== -1 || value ? 600 : 400,
          }}
        >
          {displayLabel}
        </Typography>
      </Stack>
      {helperText && (
        <Typography sx={styles.errorText}>{helperText}</Typography>
      )}
    </Stack>
  )
}
