import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IPositionSkillRequirement } from '@/types/taxonomy.types'

type TSortField =
  | 'category_title'
  | 'skill_title'
  | 'skill_level_value'
  | 'is_mandatory'
  | 'weight'
type TSortDir = 'asc' | 'desc'

interface ISkillRequirementsTableProps {
  skills: IPositionSkillRequirement[]
  onSkillClick: (skillId: string) => void
}

const getStyles = () => ({
  skillLink: {
    cursor: 'pointer',
    color: 'primary.main',
    textDecoration: 'underline',
    '&:hover': {
      color: 'primary.dark',
    },
  },
  emptyState: {
    py: 4,
    textAlign: 'center' as const,
    color: 'text.secondary',
  },
})

const SkillRequirementsTable: React.FC<ISkillRequirementsTableProps> =
  React.memo(({ skills, onSkillClick }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const [sortField, setSortField] = useState<TSortField>('category_title')
    const [sortDir, setSortDir] = useState<TSortDir>('asc')

    const handleSort = useCallback(
      (field: TSortField) => {
        if (sortField === field) {
          setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
          setSortField(field)
          setSortDir('asc')
        }
      },
      [sortField]
    )

    const handleSortCategory = useCallback(
      () => handleSort('category_title'),
      [handleSort]
    )
    const handleSortSkill = useCallback(
      () => handleSort('skill_title'),
      [handleSort]
    )
    const handleSortLevel = useCallback(
      () => handleSort('skill_level_value'),
      [handleSort]
    )
    const handleSortMandatory = useCallback(
      () => handleSort('is_mandatory'),
      [handleSort]
    )
    const handleSortWeight = useCallback(
      () => handleSort('weight'),
      [handleSort]
    )

    const sorted = useMemo(() => {
      const dir = sortDir === 'asc' ? 1 : -1
      return [...skills].sort((a, b) => {
        const va = a[sortField]
        const vb = b[sortField]
        if (va === null || va === undefined) return 1
        if (vb === null || vb === undefined) return -1
        if (typeof va === 'boolean' && typeof vb === 'boolean') {
          return (Number(va) - Number(vb)) * dir
        }
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir
        }
        return String(va).localeCompare(String(vb)) * dir
      })
    }, [skills, sortField, sortDir])

    if (skills.length === 0) {
      return (
        <Typography sx={styles.emptyState}>
          {t('taxonomy.position.noSkills', 'No skill requirements defined.')}
        </Typography>
      )
    }

    return (
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'category_title'}
                  direction={sortField === 'category_title' ? sortDir : 'asc'}
                  onClick={handleSortCategory}
                >
                  {t('taxonomy.skill.category', 'Category')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'skill_title'}
                  direction={sortField === 'skill_title' ? sortDir : 'asc'}
                  onClick={handleSortSkill}
                >
                  {t('taxonomy.skill.skillName', 'Skill')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'skill_level_value'}
                  direction={
                    sortField === 'skill_level_value' ? sortDir : 'asc'
                  }
                  onClick={handleSortLevel}
                >
                  {t('taxonomy.skill.level', 'Required Level')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'is_mandatory'}
                  direction={sortField === 'is_mandatory' ? sortDir : 'asc'}
                  onClick={handleSortMandatory}
                >
                  {t('taxonomy.skill.mandatory', 'Mandatory')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'weight'}
                  direction={sortField === 'weight' ? sortDir : 'asc'}
                  onClick={handleSortWeight}
                >
                  {t('taxonomy.skill.weight', 'Weight')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                {t('taxonomy.skill.rationale', 'Rationale')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(skill => (
              <TableRow key={skill.id} hover>
                <TableCell>
                  <Typography variant='body2'>
                    {skill.category_title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={styles.skillLink}
                    onClick={() => onSkillClick(skill.skill_id)}
                    component='span'
                  >
                    {skill.skill_title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {skill.skill_level_title} ({skill.skill_level_value})
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      skill.is_mandatory
                        ? t('taxonomy.skill.mandatory', 'Mandatory')
                        : t('taxonomy.skill.optional', 'Optional')
                    }
                    color={skill.is_mandatory ? 'primary' : 'default'}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {skill.weight !== null ? skill.weight : '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {skill.rationale ?? '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  })

SkillRequirementsTable.displayName = 'SkillRequirementsTable'

export default SkillRequirementsTable
