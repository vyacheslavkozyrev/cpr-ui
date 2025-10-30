import { Box } from '@mui/material'
import React from 'react'

interface IDashboardGridProps {
  children: React.ReactNode
}

/**
 * DashboardGrid Component
 * Responsive grid layout for dashboard widgets using CSS Grid
 *
 * Layout:
 * - Mobile (xs): Single column, widgets stacked vertically
 * - Tablet (sm): 2x2 grid
 * - Desktop (md+): 2x2 grid with better spacing
 */
export const DashboardGrid: React.FC<IDashboardGridProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 3 },
        gridTemplateColumns: {
          xs: '1fr', // Mobile: single column (stacked)
          sm: 'repeat(2, 1fr)', // Tablet+: 2 columns
        },
        width: '100%',
      }}
    >
      {children}
    </Box>
  )
}
