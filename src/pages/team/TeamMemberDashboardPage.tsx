import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  mapManagerViewFeedback,
  mapTeamMember,
} from '../../mappers/teamMemberMapper'
import { EUserRole } from '../../models'
import {
  useEmployeeFeedbackManager,
  useEmployeeGoalsManager,
  useMyTeam,
} from '../../services/teamQueryService'
import { useAuthStore } from '../../stores/authStore'
import AnalyticsTabSection from './components/AnalyticsTabSection'
import { FeedbackSectionManager } from './components/FeedbackSectionManager'
import { GoalsSectionManager } from './components/GoalsSectionManager'
import { ProjectsSectionManager } from './components/ProjectsSectionManager'
import { SkillsSectionManager } from './components/SkillsSectionManager'

const getStyles = () => ({
  container: { p: 3 },
  header: { display: 'flex', alignItems: 'center', gap: 2, mb: 3 },
  avatar: { width: 64, height: 64, fontSize: '1.5rem' },
  tabsBox: { borderBottom: 1, borderColor: 'divider', mb: 2 },
})

type TTabKey = 'goals' | 'feedback' | 'skills' | 'projects' | 'analytics'

const MANAGER_ROLES: string[] = [
  EUserRole.PEOPLE_MANAGER,
  EUserRole.DIRECTOR,
  EUserRole.ADMINISTRATOR,
]

/**
 * Dashboard page for a specific team member (direct report).
 * Route: /team/:employeeId (PeopleManager / Director / Administrator only)
 */
const TeamMemberDashboardPage: React.FC = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { employeeId } = useParams<{ employeeId: string }>()
  const styles = useMemo(() => getStyles(), [])
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState<TTabKey>('goals')

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: TTabKey) => {
      setActiveTab(newValue)
    },
    []
  )

  const { data: teamData } = useMyTeam()
  const memberDto = teamData?.data.find(m => m.id === employeeId)
  const member = memberDto ? mapTeamMember(memberDto) : null

  const { data: goalsData, isLoading: goalsLoading } =
    useEmployeeGoalsManager(employeeId)
  const { data: feedbackData, isLoading: feedbackLoading } =
    useEmployeeFeedbackManager(employeeId)

  const goals = goalsData?.data ?? []
  const feedback = useMemo(
    () => (feedbackData?.data ?? []).map(mapManagerViewFeedback),
    [feedbackData]
  )

  const userRoles = user?.roles ?? []
  const showAnalyticsTab = MANAGER_ROLES.some(role =>
    userRoles.includes(role as EUserRole)
  )

  if (!employeeId) {
    return (
      <Alert severity='error'>
        {t('team_dashboard.invalid_id', 'Invalid employee ID.')}
      </Alert>
    )
  }

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <IconButton
          onClick={() => navigate('/team')}
          aria-label={t('common.back', 'Back')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={styles.avatar}>{member?.initials ?? '?'}</Avatar>
        <Box>
          <Typography variant='h5'>{member?.fullName ?? '—'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {member?.jobTitle ?? ''}
          </Typography>
        </Box>
      </Box>

      {/* Tab navigation */}
      <Box sx={styles.tabsBox}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            label={t('team_dashboard.goals_section.title', 'Goals')}
            value='goals'
          />
          <Tab
            label={t(
              'team_dashboard.feedback_section.title',
              'Feedback Received'
            )}
            value='feedback'
          />
          <Tab
            label={t('team_dashboard.skills_section.title', 'Skills')}
            value='skills'
          />
          <Tab
            label={t('team_dashboard.projects_section.title', 'Projects')}
            value='projects'
          />
          {showAnalyticsTab && (
            <Tab
              label={t('analytics.tab.title', 'Analytics')}
              value='analytics'
            />
          )}
        </Tabs>
      </Box>

      {/* Tab panels */}
      {activeTab === 'goals' && (
        <GoalsSectionManager
          employeeId={employeeId}
          goals={goals}
          isLoading={goalsLoading}
        />
      )}
      {activeTab === 'feedback' && (
        <FeedbackSectionManager
          feedback={feedback}
          isLoading={feedbackLoading}
        />
      )}
      {activeTab === 'skills' && (
        <SkillsSectionManager employeeId={employeeId} />
      )}
      {activeTab === 'projects' && (
        <ProjectsSectionManager employeeId={employeeId} />
      )}
      {activeTab === 'analytics' && showAnalyticsTab && (
        <AnalyticsTabSection employeeId={employeeId} />
      )}
    </Box>
  )
})

TeamMemberDashboardPage.displayName = 'TeamMemberDashboardPage'

export default TeamMemberDashboardPage
