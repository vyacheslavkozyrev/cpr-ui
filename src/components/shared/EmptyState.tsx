// EmptyState Component
// Feature 0005 - Feedback Submission Collection
// Consistent empty state UI with icon, heading, description, and CTA

import { Box, Button, Typography, useTheme, type Theme } from '@mui/material'
import React, { useMemo } from 'react'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    py: 8,
    px: 3,
  },
  iconContainer: {
    mb: 3,
    color: theme.palette.text.disabled,
  },
  icon: {
    fontSize: '4rem',
    opacity: 0.5,
  },
  heading: {
    mb: 1,
    fontWeight: 600,
  },
  description: {
    mb: 3,
    maxWidth: 400,
    color: theme.palette.text.secondary,
  },
})

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Icon to display (Material-UI icon component) */
  icon?: React.ReactNode
  /** Heading text */
  heading: string
  /** Description text */
  description?: string
  /** Call-to-action button text */
  actionLabel?: string
  /** Call-to-action handler */
  onAction?: () => void
  /** Custom content to render below description */
  children?: React.ReactNode
}

/**
 * EmptyState Component
 * Displays a consistent empty state with icon, heading, description, and optional CTA
 *
 * Features:
 * - Centered layout
 * - Icon with opacity effect
 * - Heading and description
 * - Optional CTA button
 * - Customizable content slot
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={<FeedbackIcon />}
 *   heading="No feedback yet"
 *   description="You haven't received any feedback. Ask your colleagues for input on your goals."
 *   actionLabel="Request Feedback"
 *   onAction={() => navigate('/feedback/request')}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  description,
  actionLabel,
  onAction,
  children,
}) => {
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  return (
    <Box sx={styles.container}>
      {icon && (
        <Box sx={styles.iconContainer}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon, { sx: styles.icon } as never)
            : icon}
        </Box>
      )}
      <Typography variant='h6' sx={styles.heading}>
        {heading}
      </Typography>
      {description && (
        <Typography variant='body2' sx={styles.description}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant='contained' onClick={onAction} size='large'>
          {actionLabel}
        </Button>
      )}
      {children}
    </Box>
  )
}
