import { Box, Skeleton } from '@mui/material'
import React, { useMemo } from 'react'

const getStyles = () => ({
  container: { p: 2 },
  header: { mb: 2 },
  content: { mb: 2 },
  listContainer: { display: 'flex', flexDirection: 'column', gap: 1 },
})

/**
 * WidgetSkeleton Component
 * Loading skeleton for dashboard widgets
 */
export const WidgetSkeleton: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.container}>
      {/* Widget Header */}
      <Box sx={styles.header}>
        <Skeleton variant='text' width='60%' height={32} />
      </Box>

      {/* Main Content */}
      <Box sx={styles.content}>
        <Skeleton variant='rectangular' width='100%' height={120} />
      </Box>

      {/* List Items */}
      <Box sx={styles.listContainer}>
        <Skeleton variant='text' width='100%' height={24} />
        <Skeleton variant='text' width='85%' height={24} />
        <Skeleton variant='text' width='70%' height={24} />
      </Box>
    </Box>
  )
}
