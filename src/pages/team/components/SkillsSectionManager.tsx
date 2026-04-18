import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IEmployeeSkillAssessmentResponse } from '../../../types/skillAssessment.types'
import { useEmployeeGapAnalysis } from '../../../services/gapAnalysisQueryService'
import { useEmployeeSkillAssessment } from '../../../services/skillAssessmentQueryService'

interface SkillsSectionManagerProps {
  employeeId: string
}

const getStyles = () => ({
  container: { mt: 2 },
  paper: { p: 2, mb: 2 },
  tableCell: { py: 0.75 },
})

/**
 * Manager view of a direct report's skill assessments and gap analysis.
 * Reuses useEmployeeSkillAssessment (F007) and useEmployeeGapAnalysis (F009).
 */
export const SkillsSectionManager: React.FC<SkillsSectionManagerProps> = memo(
  ({ employeeId }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const {
      data: skillAssessment,
      isLoading: skillLoading,
      isError: skillError,
    } = useEmployeeSkillAssessment(employeeId)

    const {
      data: gapAnalysis,
      isLoading: gapLoading,
      isError: gapError,
    } = useEmployeeGapAnalysis(employeeId)

    const isLoading = skillLoading || gapLoading

    if (isLoading) {
      return (
        <Box display='flex' justifyContent='center' py={4}>
          <CircularProgress />
        </Box>
      )
    }

    return (
      <Box sx={styles.container}>
        <Typography variant='h6' mb={2}>
          {t('team_dashboard.skills_section.title', 'Skills')}
        </Typography>

        {skillError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {t(
              'team_dashboard.skills_section.assessment_error',
              'Failed to load skill assessments.'
            )}
          </Alert>
        )}

        {!skillError && skillAssessment && (
          <Paper variant='outlined' sx={styles.paper}>
            <Typography variant='subtitle2' gutterBottom>
              {t(
                'team_dashboard.skills_section.assessments',
                'Skill Assessments'
              )}
            </Typography>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableCell}>
                    {t('team_dashboard.skills_section.skill', 'Skill')}
                  </TableCell>
                  <TableCell sx={styles.tableCell} align='center'>
                    {t('team_dashboard.skills_section.self', 'Self')}
                  </TableCell>
                  <TableCell sx={styles.tableCell} align='center'>
                    {t('team_dashboard.skills_section.manager', 'Manager')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(
                  skillAssessment as IEmployeeSkillAssessmentResponse
                ).skill_categories
                  ?.flatMap(cat => cat.skills)
                  .map(skill => (
                    <TableRow key={skill.skill_id}>
                      <TableCell sx={styles.tableCell}>
                        {skill.skill_title}
                      </TableCell>
                      <TableCell sx={styles.tableCell} align='center'>
                        {skill.assessed?.self_assessment_value ??
                          t('team_dashboard.skills_section.not_assessed', '—')}
                      </TableCell>
                      <TableCell sx={styles.tableCell} align='center'>
                        {skill.assessed?.manager_assessment_value ??
                          t('team_dashboard.skills_section.not_assessed', '—')}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {gapError && (
          <Alert severity='warning'>
            {t(
              'team_dashboard.skills_section.gap_error',
              'Failed to load gap analysis.'
            )}
          </Alert>
        )}

        {!gapError && gapAnalysis && (
          <Paper variant='outlined' sx={styles.paper}>
            <Typography variant='subtitle2' gutterBottom>
              {t('team_dashboard.skills_section.gap_analysis', 'Gap Analysis')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'team_dashboard.skills_section.gap_description',
                'Gap analysis data is available above.'
              )}
            </Typography>
          </Paper>
        )}
      </Box>
    )
  }
)

SkillsSectionManager.displayName = 'SkillsSectionManager'
