import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillCategoryGroup } from '@/types/skillAssessment.types'
import AssessmentSkillRow from './AssessmentSkillRow'

interface AssessmentSkillCategorySectionProps {
  category: ISkillCategoryGroup
  readOnly?: boolean
  showTitle?: boolean
  /** True when there is a next position — adds Next Level Required column */
  showNextLevel?: boolean
  /** Present when rendering the employee assessment page — adds Manager Assessment column */
  employeeId?: string
  /** True when the viewer can set manager assessments */
  isManager?: boolean
}

const AssessmentSkillCategorySection: React.FC<
  AssessmentSkillCategorySectionProps
> = ({
  category,
  readOnly = false,
  showTitle = false,
  showNextLevel = false,
  employeeId,
  isManager = false,
}) => {
  const { t } = useTranslation()
  const showManagerColumn = Boolean(employeeId)
  const colSpan = 5 + (showNextLevel ? 1 : 0) + (showManagerColumn ? 1 : 0)

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table size='small'>
        <TableHead>
          {showTitle && (
            <TableRow>
              <TableCell colSpan={colSpan}>
                <Typography variant='subtitle1' fontWeight='medium'>
                  {category.title}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell>
              {t('components.assessmentSkillRow.skill', 'Skill')}
            </TableCell>
            <TableCell>
              {t('components.assessmentSkillRow.required', 'Required')}
            </TableCell>
            {showNextLevel && (
              <TableCell>
                {t(
                  'components.assessmentSkillRow.nextLevelRequired',
                  'Next Level Required'
                )}
              </TableCell>
            )}
            <TableCell>
              {t('components.assessmentSkillRow.selfAssessment', 'My Weight')}
            </TableCell>
            <TableCell>
              {t('components.assessmentSkillRow.notes', 'Notes')}
            </TableCell>
            {showManagerColumn && (
              <TableCell>
                {t(
                  'components.assessmentSkillRow.managerAssessment',
                  'Manager Assessment'
                )}
              </TableCell>
            )}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {category.skills.map(skill => (
            <AssessmentSkillRow
              key={skill.skill_id}
              skill={skill}
              readOnly={readOnly}
              showNextLevel={showNextLevel}
              {...(employeeId !== undefined ? { employeeId, isManager } : {})}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AssessmentSkillCategorySection
