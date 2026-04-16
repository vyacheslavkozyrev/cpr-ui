import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Alert,
  Avatar,
  Box,
  Collapse,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  mapManagerViewFeedback,
  mapTeamMember,
} from '../../mappers/teamMemberMapper'
import {
  useEmployeeFeedbackManager,
  useEmployeeGoalsManager,
  useMyTeam,
} from '../../services/teamQueryService'
import { FeedbackSectionManager } from './components/FeedbackSectionManager'
import { GoalsSectionManager } from './components/GoalsSectionManager'
import { ProjectsSectionManager } from './components/ProjectsSectionManager'
import { SkillsSectionManager } from './components/SkillsSectionManager'

const getStyles = () => ({
  container: { p: 3 },
  header: { display: 'flex', alignItems: 'center', gap: 2, mb: 3 },
  avatar: { width: 64, height: 64, fontSize: '1.5rem' },
  sectionPaper: { p: 2, mb: 2 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none' as const,
  },
})

interface SectionState {
  goals: boolean
  feedback: boolean
  skills: boolean
  projects: boolean
}

/**
 * Dashboard page for a specific team member (direct report).
 * Route: /team/:employeeId (PeopleManager / Director only)
 */
const TeamMemberDashboardPage: React.FC = memo(() => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { employeeId } = useParams<{ employeeId: string }>()
  const styles = useMemo(() => getStyles(), [])

  const [expanded, setExpanded] = useState<SectionState>({
    goals: true,
    feedback: true,
    skills: false,
    projects: false,
  })

  const toggleSection = useCallback((section: keyof SectionState) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

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

      {/* Goals section */}
      <Paper variant='outlined' sx={styles.sectionPaper}>
        <Box sx={styles.sectionHeader} onClick={() => toggleSection('goals')}>
          <Typography variant='h6'>
            {t('team_dashboard.goals_section.title', 'Goals')}
          </Typography>
          <IconButton size='small'>
            {expanded.goals ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.goals}>
          <GoalsSectionManager
            employeeId={employeeId}
            goals={goals}
            isLoading={goalsLoading}
          />
        </Collapse>
      </Paper>

      {/* Feedback section */}
      <Paper variant='outlined' sx={styles.sectionPaper}>
        <Box
          sx={styles.sectionHeader}
          onClick={() => toggleSection('feedback')}
        >
          <Typography variant='h6'>
            {t('team_dashboard.feedback_section.title', 'Feedback Received')}
          </Typography>
          <IconButton size='small'>
            {expanded.feedback ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.feedback}>
          <FeedbackSectionManager
            feedback={feedback}
            isLoading={feedbackLoading}
          />
        </Collapse>
      </Paper>

      {/* Skills section */}
      <Paper variant='outlined' sx={styles.sectionPaper}>
        <Box sx={styles.sectionHeader} onClick={() => toggleSection('skills')}>
          <Typography variant='h6'>
            {t('team_dashboard.skills_section.title', 'Skills')}
          </Typography>
          <IconButton size='small'>
            {expanded.skills ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.skills}>
          <SkillsSectionManager employeeId={employeeId} />
        </Collapse>
      </Paper>

      {/* Projects section */}
      <Paper variant='outlined' sx={styles.sectionPaper}>
        <Box
          sx={styles.sectionHeader}
          onClick={() => toggleSection('projects')}
        >
          <Typography variant='h6'>
            {t('team_dashboard.projects_section.title', 'Projects')}
          </Typography>
          <IconButton size='small'>
            {expanded.projects ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded.projects}>
          <ProjectsSectionManager employeeId={employeeId} />
        </Collapse>
      </Paper>
    </Box>
  )
})

TeamMemberDashboardPage.displayName = 'TeamMemberDashboardPage'

export default TeamMemberDashboardPage
