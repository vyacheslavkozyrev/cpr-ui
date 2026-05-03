/**
 * AnalyticsPage
 * Route: /analytics
 * Personal analytics view — wraps AnalyticsContent with no employeeId (AC-003, AC-004).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Box, Typography } from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnalyticsContent } from '../../components/analytics/AnalyticsContent'

const getStyles = () => ({
  container: { p: 3 },
  title: { mb: 2 },
})

/**
 * Top-level analytics page for the authenticated user's own data.
 */
const AnalyticsPage: React.FC = memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box sx={styles.container}>
      <Typography variant='h4' sx={styles.title}>
        {t('analytics.page_title', 'Analytics')}
      </Typography>
      <AnalyticsContent />
    </Box>
  )
})

AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage
