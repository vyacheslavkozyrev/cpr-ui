import { Box, Skeleton } from '@mui/material'
import React from 'react'

/**
 * WidgetSkeleton Component
 * Loading skeleton for dashboard widgets
 */
export const WidgetSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Widget Header */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant='text' width='60%' height={32} />
      </Box>

      {/* Main Content */}
      <Box sx={{ mb: 2 }}>
        <Skeleton variant='rectangular' width='100%' height={120} />
      </Box>

      {/* List Items */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant='text' width='100%' height={24} />
        <Skeleton variant='text' width='85%' height={24} />
        <Skeleton variant='text' width='70%' height={24} />
      </Box>
    </Box>
  )
}
