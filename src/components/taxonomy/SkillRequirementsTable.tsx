import {
  ButtonBase,
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
  | 'skill_title'
  | 'skill_level_value'
  | 'is_mandatory'
  | 'weight'
type TSortDir = 'asc' | 'desc'

interface ISkillRequirementsTableProps {
  skills: IPositionSkillRequirement[]
  onSkillClick: (skillId: string) => void
}

interface ISkillRowProps {
  skill: IPositionSkillRequirement
  onSkillClick: (skillId: string) => void
}

// W3: factory function per CLAUDE.md convention
const getStyles = () => ({
  skillLink: {
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'primary.main',
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

// B2: extracted sub-component so the click handler is a stable useCallback
const SkillRow: React.FC<ISkillRowProps> = React.memo(
  ({ skill, onSkillClick }) => {
    const { t, i18n } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const handleClick = useCallback(
      () => onSkillClick(skill.skill_id),
      [onSkillClick, skill.skill_id]
    )

    return (
      <TableRow hover>
        <TableCell>
          {/* S4: ButtonBase is natively keyboard-accessible (Enter/Space) */}
          <ButtonBase onClick={handleClick} sx={styles.skillLink}>
            <Typography variant='body2'>{skill.skill_title}</Typography>
          </ButtonBase>
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
                ? t('taxonomy.skill.mandatory')
                : t('taxonomy.skill.optional')
            }
            color={skill.is_mandatory ? 'primary' : 'default'}
            size='small'
          />
        </TableCell>
        <TableCell>
          <Typography variant='body2'>
            {/* S3: locale-aware number formatting */}
            {skill.weight !== null
              ? new Intl.NumberFormat(i18n.language).format(skill.weight)
              : '—'}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant='body2' color='text.secondary'>
            {skill.rationale ?? '—'}
          </Typography>
        </TableCell>
      </TableRow>
    )
  }
)

SkillRow.displayName = 'SkillRow'

const SkillRequirementsTable: React.FC<ISkillRequirementsTableProps> =
  React.memo(({ skills, onSkillClick }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const [sortField, setSortField] = useState<TSortField>('skill_title')
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
        // W7: nulls always sort last regardless of direction
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
          {t('taxonomy.position.noSkills')}
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
                  active={sortField === 'skill_title'}
                  direction={sortField === 'skill_title' ? sortDir : 'asc'}
                  onClick={handleSortSkill}
                >
                  {t('taxonomy.skill.skillName')}
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
                  {t('taxonomy.skill.requiredLevel')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'is_mandatory'}
                  direction={sortField === 'is_mandatory' ? sortDir : 'asc'}
                  onClick={handleSortMandatory}
                >
                  {t('taxonomy.skill.mandatory')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'weight'}
                  direction={sortField === 'weight' ? sortDir : 'asc'}
                  onClick={handleSortWeight}
                >
                  {t('taxonomy.skill.weight')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('taxonomy.skill.rationale')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(skill => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onSkillClick={onSkillClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  })

SkillRequirementsTable.displayName = 'SkillRequirementsTable'

export default SkillRequirementsTable
