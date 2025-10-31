import { Box } from '@mui/material'
import React, { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { BreadcrumbNavigation } from './BreadcrumbNavigation'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

// Style factory outside component
const getStyles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  contentWrapper: {
    display: 'flex',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    p: 3,
    pt: 2, // Reduced top padding since breadcrumbs provide spacing
    backgroundColor: 'background.default',
    minHeight: 'calc(100vh - 64px)', // Account for header height
  },
})

/**
 * AppLayout Component
 * Main layout wrapper with header, sidebar, and footer
 * Uses Outlet for nested route rendering
 */
export const AppLayout: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.root}>
      {/* Header */}
      <Header />

      <Box sx={styles.contentWrapper}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <Box component='main' sx={styles.mainContent}>
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation />

          {/* Page Content */}
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
