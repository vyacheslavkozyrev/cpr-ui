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
import type {
  ISkillCategoryGroup,
  ISkillLevelBrief,
} from '@/types/skillAssessment.types'
import AssessmentSkillRow from './AssessmentSkillRow'

interface AssessmentSkillCategorySectionProps {
  category: ISkillCategoryGroup
  availableLevels: ISkillLevelBrief[]
  readOnly?: boolean
  showTitle?: boolean
}

const AssessmentSkillCategorySection: React.FC<
  AssessmentSkillCategorySectionProps
> = ({ category, availableLevels, readOnly = false, showTitle = false }) => {
  const { t } = useTranslation()

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table size='small'>
        <TableHead>
          {showTitle && (
            <TableRow>
              <TableCell colSpan={5}>
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
            <TableCell>
              {t('components.assessmentSkillRow.myWeight', 'My Weight')}
            </TableCell>
            <TableCell>
              {t('components.assessmentSkillRow.notes', 'Notes')}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {category.skills.map(skill => (
            <AssessmentSkillRow
              key={skill.skill_id}
              skill={skill}
              availableLevels={availableLevels}
              readOnly={readOnly}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AssessmentSkillCategorySection
