import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../services/apiClient'

interface ProjectAssignment {
  id: string
  code: string
  title: string
  description?: string
}

interface ProjectsSectionManagerProps {
  employeeId: string
}

const getStyles = () => ({
  container: { mt: 2 },
  paper: { p: 2, mb: 1 },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap' as const,
  },
})

const useEmployeeProjects = (employeeId: string) =>
  useQuery<ProjectAssignment[], Error>({
    queryKey: ['employees', employeeId, 'projects'],
    queryFn: async () => {
      const response = await apiClient.get<ProjectAssignment[]>(
        `/employees/${employeeId}/projects`
      )
      if (!response.success)
        throw new Error(response.message || 'Failed to load projects')
      return response.data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

/**
 * Manager view of a direct report's projects.
 * Calls GET /api/employees/{id}/projects.
 */
export const ProjectsSectionManager: React.FC<ProjectsSectionManagerProps> =
  memo(({ employeeId }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const {
      data: projects,
      isLoading,
      isError,
    } = useEmployeeProjects(employeeId)

    if (isLoading) {
      return (
        <Box display='flex' justifyContent='center' py={4}>
          <CircularProgress />
        </Box>
      )
    }

    if (isError) {
      return (
        <Alert severity='warning' sx={{ mt: 2 }}>
          {t(
            'team_dashboard.projects_section.error',
            'Could not load project assignments.'
          )}
        </Alert>
      )
    }

    return (
      <Box sx={styles.container}>
        <Typography variant='h6' mb={2}>
          {t('team_dashboard.projects_section.title', 'Projects')}
        </Typography>

        {!projects || projects.length === 0 ? (
          <Typography color='text.secondary'>
            {t(
              'team_dashboard.projects_section.empty',
              'No project assignments.'
            )}
          </Typography>
        ) : (
          projects.map(project => (
            <Paper key={project.id} variant='outlined' sx={styles.paper}>
              <Stack spacing={0.5}>
                <Box sx={styles.metaRow}>
                  <Chip label={project.code} size='small' variant='outlined' />
                  <Typography variant='subtitle2'>{project.title}</Typography>
                </Box>
                {project.description && (
                  <Typography variant='body2' color='text.secondary'>
                    {project.description}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))
        )}
      </Box>
    )
  })

ProjectsSectionManager.displayName = 'ProjectsSectionManager'
