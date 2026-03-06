import {
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteCurrentLevel,
  useDeleteTarget,
  useUnlinkEvidence,
  useUpsertCurrentLevel,
  useUpsertTarget,
} from '../../services/skillAssessmentQueryService'
import type {
  ISkillItem,
  ISkillLevelBrief,
} from '../../types/skillAssessment.types'
import EvidenceList from './EvidenceList'
import EvidenceModal from './EvidenceModal'

interface AssessmentSkillRowProps {
  skill: ISkillItem
  availableLevels: ISkillLevelBrief[]
  readOnly?: boolean
}

const CLEAR_TARGET = '__clear__'
const NOT_ASSESSED = ''

const AssessmentSkillRow: React.FC<AssessmentSkillRowProps> = ({
  skill,
  availableLevels,
  readOnly = false,
}) => {
  const { t } = useTranslation()
  const [notes, setNotes] = useState(skill.assessed?.notes ?? '')
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  const upsertCurrent = useUpsertCurrentLevel()
  const deleteCurrent = useDeleteCurrentLevel()
  const upsertTarget = useUpsertTarget()
  const deleteTarget = useDeleteTarget()
  const unlinkEvidence = useUnlinkEvidence()

  // Keep notes in sync with external data
  useEffect(() => {
    setNotes(skill.assessed?.notes ?? '')
  }, [skill.assessed?.notes])

  const showSaved = () => {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }

  const handleLevelChange = async (levelId: string) => {
    setRowError(null)
    if (levelId === NOT_ASSESSED) {
      if (skill.assessed) {
        await deleteCurrent
          .mutateAsync(skill.skill_id)
          .catch(err => setRowError(err?.message ?? 'Error'))
      }
      return
    }
    try {
      await upsertCurrent.mutateAsync({
        skillId: skill.skill_id,
        dto: { skill_level_id: levelId, notes: notes || null },
      })
      showSaved()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error'
      if (msg.includes('target_conflict')) {
        setRowError(
          t(
            'components.assessmentSkillRow.targetConflict',
            'Target level must be higher than your current level. Clear or raise the target first.'
          )
        )
      } else {
        setRowError(msg)
      }
    }
  }

  const handleNotesBlur = async () => {
    if (!skill.assessed) return
    setRowError(null)
    try {
      await upsertCurrent.mutateAsync({
        skillId: skill.skill_id,
        dto: {
          skill_level_id: skill.assessed.skill_level_id,
          notes: notes || null,
        },
      })
      showSaved()
    } catch {
      /* ignore */
    }
  }

  const handleTargetChange = async (levelId: string) => {
    setRowError(null)
    if (levelId === CLEAR_TARGET) {
      if (skill.target) {
        await deleteTarget
          .mutateAsync(skill.skill_id)
          .catch(err => setRowError(err?.message ?? 'Error'))
      }
      return
    }
    try {
      await upsertTarget.mutateAsync({
        skillId: skill.skill_id,
        dto: { skill_level_id: levelId },
      })
      showSaved()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Error'
      if (msg.includes('target_too_low')) {
        setRowError(
          t(
            'components.assessmentSkillRow.targetTooLow',
            'Target level must be strictly greater than your current level.'
          )
        )
      } else {
        setRowError(msg)
      }
    }
  }

  const handleRemoveEvidence = async (feedbackId: string) => {
    await unlinkEvidence.mutateAsync({
      skillId: skill.skill_id,
      feedbackId,
    })
  }

  const isSaving =
    upsertCurrent.isPending ||
    deleteCurrent.isPending ||
    upsertTarget.isPending ||
    deleteTarget.isPending

  return (
    <>
      <TableRow>
        {/* Skill title */}
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Tooltip title={skill.skill_description ?? ''}>
            <Typography variant='body2' fontWeight='medium'>
              {skill.skill_title}
            </Typography>
          </Tooltip>
        </TableCell>

        {/* Required level */}
        <TableCell sx={{ verticalAlign: 'top' }}>
          <Chip
            label={skill.required_level.title}
            size='small'
            color='primary'
            variant='outlined'
          />
        </TableCell>

        {/* Current level */}
        <TableCell sx={{ verticalAlign: 'top' }}>
          {readOnly ? (
            <Typography variant='body2'>
              {skill.assessed?.skill_level_title ??
                t('components.assessmentSkillRow.notAssessed', 'Not assessed')}
            </Typography>
          ) : (
            <Select
              size='small'
              value={skill.assessed?.skill_level_id ?? NOT_ASSESSED}
              onChange={e => handleLevelChange(e.target.value)}
              displayEmpty
              sx={{ minWidth: 140 }}
            >
              <MenuItem value={NOT_ASSESSED}>
                <em>
                  {t(
                    'components.assessmentSkillRow.notAssessed',
                    'Not assessed'
                  )}
                </em>
              </MenuItem>
              {availableLevels.map(l => (
                <MenuItem key={l.id} value={l.id}>
                  {l.title}
                </MenuItem>
              ))}
            </Select>
          )}
        </TableCell>

        {/* Target level */}
        <TableCell sx={{ verticalAlign: 'top' }}>
          {readOnly ? (
            <Typography variant='body2'>
              {skill.target?.skill_level_title ??
                t('components.assessmentSkillRow.noTarget', 'No target set')}
            </Typography>
          ) : (
            <Select
              size='small'
              value={skill.target?.skill_level_id ?? NOT_ASSESSED}
              onChange={e => handleTargetChange(e.target.value)}
              displayEmpty
              sx={{ minWidth: 140 }}
            >
              <MenuItem value={NOT_ASSESSED}>
                <em>
                  {t('components.assessmentSkillRow.noTarget', 'No target set')}
                </em>
              </MenuItem>
              {availableLevels.map(l => (
                <MenuItem key={l.id} value={l.id}>
                  {l.title}
                </MenuItem>
              ))}
              {skill.target && (
                <MenuItem value={CLEAR_TARGET}>
                  <em>
                    {t(
                      'components.assessmentSkillRow.clearTarget',
                      'Clear target'
                    )}
                  </em>
                </MenuItem>
              )}
            </Select>
          )}
        </TableCell>

        {/* Notes */}
        <TableCell sx={{ verticalAlign: 'top' }}>
          {readOnly ? (
            <Typography variant='body2' color='text.secondary'>
              {skill.assessed?.notes ?? '—'}
            </Typography>
          ) : (
            <TextField
              size='small'
              multiline
              maxRows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder='Add notes...'
              inputProps={{ maxLength: 1000 }}
              sx={{ minWidth: 180 }}
            />
          )}
        </TableCell>

        {/* Status / actions */}
        <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
          {isSaving && <CircularProgress size={16} sx={{ mr: 1 }} />}
          {savedIndicator && !isSaving && (
            <Typography variant='caption' color='success.main'>
              {t('components.assessmentSkillRow.saved', 'Saved ✓')}
            </Typography>
          )}
          {!readOnly && (
            <Typography
              variant='caption'
              color='primary'
              sx={{ cursor: 'pointer', display: 'block' }}
              onClick={() => setEvidenceModalOpen(true)}
            >
              {t('components.assessmentSkillRow.linkFeedback', 'Link feedback')}
            </Typography>
          )}
        </TableCell>
      </TableRow>

      {/* Error row */}
      {rowError && (
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0, borderBottom: 'none' }}>
            <Typography variant='caption' color='error'>
              {rowError}
            </Typography>
          </TableCell>
        </TableRow>
      )}

      {/* Evidence row */}
      {skill.evidence.length > 0 && (
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0.5 }}>
            <EvidenceList
              evidence={skill.evidence}
              readOnly={readOnly}
              onRemove={handleRemoveEvidence}
            />
          </TableCell>
        </TableRow>
      )}

      <EvidenceModal
        open={evidenceModalOpen}
        skillId={skill.skill_id}
        existingEvidence={skill.evidence}
        onClose={() => setEvidenceModalOpen(false)}
      />
    </>
  )
}

export default AssessmentSkillRow
