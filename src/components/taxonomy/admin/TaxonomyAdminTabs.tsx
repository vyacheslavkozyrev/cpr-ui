import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material'
import React, { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RoleGuard } from '@/components/auth'
import { UserRole } from '@/models'

const CareerPathsAdminPanel = lazy(() => import('./CareerPathsAdminPanel'))
const CareerTracksAdminPanel = lazy(() => import('./CareerTracksAdminPanel'))
const PositionsAdminPanel = lazy(() => import('./PositionsAdminPanel'))
const SkillCategoriesAdminPanel = lazy(
  () => import('./SkillCategoriesAdminPanel')
)
const SkillsAdminPanel = lazy(() => import('./SkillsAdminPanel'))

interface ITabPanelProps {
  children: React.ReactNode
  index: number
  value: number
}

const getStyles = () => ({
  container: {
    width: '100%',
  },
  tabPanel: {
    py: 3,
  },
  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 4,
  },
})

const TabPanel: React.FC<ITabPanelProps> = ({ children, value, index }) => {
  if (value !== index) return null
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      }
    >
      {children}
    </Suspense>
  )
}

const TaxonomyAdminTabs: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  return (
    <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]}>
      <Box sx={styles.container}>
        <Typography variant='h5' gutterBottom>
          {t('taxonomy.admin.title', 'Taxonomy Administration')}
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
        >
          <Tab label={t('taxonomy.careerFramework.title', 'Career Paths')} />
          <Tab label={t('taxonomy.admin.careerTracks', 'Career Tracks')} />
          <Tab label={t('taxonomy.admin.positions', 'Positions')} />
          <Tab
            label={t('taxonomy.admin.skillCategories', 'Skill Categories')}
          />
          <Tab label={t('taxonomy.admin.skills', 'Skills')} />
        </Tabs>

        <Box sx={styles.tabPanel}>
          <TabPanel value={activeTab} index={0}>
            <CareerPathsAdminPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <CareerTracksAdminPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <PositionsAdminPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <SkillCategoriesAdminPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <SkillsAdminPanel />
          </TabPanel>
        </Box>
      </Box>
    </RoleGuard>
  )
})

TaxonomyAdminTabs.displayName = 'TaxonomyAdminTabs'

export default TaxonomyAdminTabs
