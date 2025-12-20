// Top Lists Component - Feature 0005 Task T099
// Displays top 5 providers, goals, and projects with counts and averages

import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Rating,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TopGoal, TopProject, TopProvider } from '../../types/feedback'

export interface TopListsProps {
  /** Top feedback providers */
  topProviders: TopProvider[]
  /** Goals with most feedback */
  topGoals: TopGoal[]
  /** Projects with most feedback */
  topProjects: TopProject[]
}

/**
 * Top Lists Component
 * Shows three lists side-by-side (responsive grid):
 * - Top 5 Feedback Providers
 * - Goals with Most Feedback
 * - Projects with Most Feedback
 *
 * Each item shows count, average rating, and is clickable for drill-down (Task T100)
 */
export const TopLists: React.FC<TopListsProps> = ({
  topProviders,
  topGoals,
  topProjects,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Handle drill-down navigation (Task T100 - partial implementation)
  const handleProviderClick = (employeeId: string) => {
    // Navigate to feedback list filtered by provider
    navigate(`/feedback?from_employee_id=${employeeId}`)
  }

  const handleGoalClick = (goalId: string) => {
    // Navigate to feedback list filtered by goal
    navigate(`/feedback?goal_id=${goalId}`)
  }

  const handleProjectClick = (projectId: string) => {
    // Navigate to feedback list filtered by project
    navigate(`/feedback?project_id=${projectId}`)
  }

  return (
    <Grid container spacing={3}>
      {/* Top Providers */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              {t(
                'feedback.analytics.topLists.providers',
                'Top Feedback Providers'
              )}
            </Typography>
            <List dense>
              {topProviders.length > 0 ? (
                topProviders.slice(0, 5).map((provider, index) => (
                  <ListItem
                    key={provider.employee.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                    }}
                    onClick={() => handleProviderClick(provider.employee.id)}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant='body2'>
                            {index + 1}. {provider.employee.display_name}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ ml: 1 }}
                          >
                            {provider.count}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          component='span'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Rating
                            value={provider.average_rating}
                            precision={0.1}
                            readOnly
                            size='small'
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {provider.average_rating.toFixed(1)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('feedback.analytics.noData', 'No data available')}
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Goals */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              {t(
                'feedback.analytics.topLists.goals',
                'Goals with Most Feedback'
              )}
            </Typography>
            <List dense>
              {topGoals.length > 0 ? (
                topGoals.slice(0, 5).map((goal, index) => (
                  <ListItem
                    key={goal.goal.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                    }}
                    onClick={() => handleGoalClick(goal.goal.id)}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant='body2'
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                            }}
                          >
                            {index + 1}. {goal.goal.title}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ ml: 1, flexShrink: 0 }}
                          >
                            {goal.count}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          component='span'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Rating
                            value={goal.average_rating}
                            precision={0.1}
                            readOnly
                            size='small'
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {goal.average_rating.toFixed(1)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('feedback.analytics.noData', 'No data available')}
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Projects */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              {t(
                'feedback.analytics.topLists.projects',
                'Projects with Most Feedback'
              )}
            </Typography>
            <List dense>
              {topProjects.length > 0 ? (
                topProjects.slice(0, 5).map((project, index) => (
                  <ListItem
                    key={project.project.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                    }}
                    onClick={() => handleProjectClick(project.project.id)}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography
                            variant='body2'
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                            }}
                          >
                            {index + 1}. {project.project.name}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ ml: 1, flexShrink: 0 }}
                          >
                            {project.count}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          component='span'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Rating
                            value={project.average_rating}
                            precision={0.1}
                            readOnly
                            size='small'
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {project.average_rating.toFixed(1)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {t('feedback.analytics.noData', 'No data available')}
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
