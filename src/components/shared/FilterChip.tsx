// FilterChip Component
// Feature 0005 - Feedback Submission Collection
// Display active filter with remove button

import { Chip, type ChipProps } from '@mui/material'
import React from 'react'

/**
 * Props for FilterChip component
 */
export interface FilterChipProps extends Omit<ChipProps, 'onDelete'> {
  /** Filter label */
  label: string
  /** Remove handler */
  onRemove: () => void
  /** Chip variant */
  variant?: 'filled' | 'outlined'
  /** Chip color */
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
}

/**
 * FilterChip Component
 * Displays an active filter with a remove button
 *
 * Features:
 * - Consistent styling for filter badges
 * - Delete icon with hover effect
 * - Accessible (keyboard + screen reader support)
 *
 * Usage:
 * ```tsx
 * <FilterChip
 *   label="Rating: 5 stars"
 *   onRemove={() => clearFilter('rating')}
 *   color="primary"
 * />
 * ```
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  onRemove,
  variant = 'filled',
  color = 'primary',
  ...chipProps
}) => {
  return (
    <Chip
      label={label}
      onDelete={onRemove}
      variant={variant}
      color={color}
      size='small'
      {...chipProps}
    />
  )
}
