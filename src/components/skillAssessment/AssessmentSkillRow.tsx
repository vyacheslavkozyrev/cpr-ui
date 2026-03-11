import {
  Button,
  Chip,
  CircularProgress,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteCurrentLevel,
  useUnlinkEvidence,
  useUpsertCurrentLevel,
} from '@/services/skillAssessmentQueryService'
import type { ISkillItem } from '@/types/skillAssessment.types'
import EvidenceList from './EvidenceList'
import EvidenceModal from './EvidenceModal'

interface AssessmentSkillRowProps {
  skill: ISkillItem
  readOnly?: boolean
}

const getStyles = () => ({
  skillTitle: { fontWeight: 'medium' } as const,
  actionsCell: { verticalAlign: 'top', whiteSpace: 'nowrap' } as const,
  topCell: { verticalAlign: 'top' } as const,
  linkFeedbackBtn: { p: 0, textTransform: 'none' } as const,
  saveIndicator: { display: 'block', mb: 0.5 } as const,
})

const AssessmentSkillRow: React.FC<AssessmentSkillRowProps> = ({
  skill,
  readOnly = false,
}) => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const [selfValue, setSelfValue] = useState<string>(
    skill.assessed?.self_assessment_value != null
      ? String(skill.assessed.self_assessment_value)
      : ''
  )
  const [notes, setNotes] = useState(skill.assessed?.notes ?? '')
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  const upsertCurrent = useUpsertCurrentLevel()
  const deleteCurrent = useDeleteCurrentLevel()
  const unlinkEvidence = useUnlinkEvidence()

  useEffect(() => {
    setSelfValue(
      skill.assessed?.self_assessment_value != null
        ? String(skill.assessed.self_assessment_value)
        : ''
    )
    setNotes(skill.assessed?.notes ?? '')
  }, [skill.assessed?.self_assessment_value, skill.assessed?.notes])

  const showSaved = useCallback(() => {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }, [])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelfValue(e.target.value)
    },
    []
  )

  const handleValueBlur = useCallback(async () => {
    setRowError(null)
    const parsed = parseFloat(selfValue)
    if (selfValue === '' || isNaN(parsed)) {
      if (skill.assessed) {
        await deleteCurrent
          .mutateAsync(skill.skill_id)
          .catch(err => setRowError(err?.message ?? 'Error'))
      }
      return
    }
    if (parsed <= 0) {
      setRowError(
        t(
          'components.assessmentSkillRow.valueMustBePositive',
          'Value must be greater than 0'
        )
      )
      return
    }
    try {
      await upsertCurrent.mutateAsync({
        skillId: skill.skill_id,
        dto: { self_assessment_value: parsed, notes: notes || null },
      })
      showSaved()
    } catch (err: unknown) {
      setRowError((err as { message?: string })?.message ?? 'Error')
    }
  }, [
    selfValue,
    skill.assessed,
    skill.skill_id,
    deleteCurrent,
    upsertCurrent,
    notes,
    showSaved,
    t,
  ])

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNotes(e.target.value)
    },
    []
  )

  const handleNotesBlur = useCallback(async () => {
    const parsed = parseFloat(selfValue)
    if (!skill.assessed || isNaN(parsed) || parsed <= 0) return
    setRowError(null)
    try {
      await upsertCurrent.mutateAsync({
        skillId: skill.skill_id,
        dto: { self_assessment_value: parsed, notes: notes || null },
      })
      showSaved()
    } catch {
      /* ignore */
    }
  }, [
    skill.assessed,
    skill.skill_id,
    selfValue,
    notes,
    upsertCurrent,
    showSaved,
  ])

  const handleRemoveEvidence = useCallback(
    async (feedbackId: string) => {
      await unlinkEvidence.mutateAsync({
        skillId: skill.skill_id,
        feedbackId,
      })
    },
    [unlinkEvidence, skill.skill_id]
  )

  const openEvidenceModal = useCallback(() => setEvidenceModalOpen(true), [])
  const closeEvidenceModal = useCallback(() => setEvidenceModalOpen(false), [])

  const isSaving = upsertCurrent.isPending || deleteCurrent.isPending

  const isRequired = skill.required_level != null

  return (
    <>
      <TableRow>
        {/* Skill */}
        <TableCell sx={styles.topCell}>
          <Tooltip title={skill.skill_description ?? ''}>
            <Typography variant='body2' sx={styles.skillTitle}>
              {skill.skill_title}
            </Typography>
          </Tooltip>
        </TableCell>

        {/* Required label */}
        <TableCell sx={styles.topCell}>
          {isRequired ? (
            <Chip
              label={skill.required_level.title}
              size='small'
              color='primary'
              variant='outlined'
            />
          ) : (
            <Typography variant='body2' color='text.secondary'>
              {t('components.assessmentSkillRow.notRequired', 'Not required')}
            </Typography>
          )}
        </TableCell>

        {/* Self assessment value */}
        <TableCell sx={styles.topCell}>
          {readOnly ? (
            <Typography variant='body2'>
              {skill.assessed?.self_assessment_value ??
                t('components.assessmentSkillRow.notAssessed', 'Not assessed')}
            </Typography>
          ) : (
            <TextField
              size='small'
              type='number'
              value={selfValue}
              onChange={handleValueChange}
              onBlur={handleValueBlur}
              inputProps={{ min: 0.1, step: 0.1 }}
              placeholder={t(
                'components.assessmentSkillRow.notAssessed',
                'Not assessed'
              )}
              sx={{ width: 120 }}
              error={Boolean(rowError)}
            />
          )}
        </TableCell>

        {/* Notes */}
        <TableCell sx={styles.topCell}>
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
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              placeholder={t(
                'components.assessmentSkillRow.notesPlaceholder',
                'Add notes...'
              )}
              inputProps={{ maxLength: 1000 }}
              sx={{ minWidth: 180 }}
            />
          )}
        </TableCell>

        {/* Actions */}
        <TableCell sx={styles.actionsCell}>
          {isSaving && <CircularProgress size={16} sx={{ mr: 1 }} />}
          {savedIndicator && !isSaving && (
            <Typography
              variant='caption'
              color='success.main'
              sx={styles.saveIndicator}
            >
              {t('components.assessmentSkillRow.saved', 'Saved ✓')}
            </Typography>
          )}
          {!readOnly && (
            <Button
              variant='text'
              size='small'
              onClick={openEvidenceModal}
              sx={styles.linkFeedbackBtn}
            >
              {t('components.assessmentSkillRow.linkFeedback', 'Link feedback')}
            </Button>
          )}
        </TableCell>
      </TableRow>

      {/* Error row */}
      {rowError && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0, borderBottom: 'none' }}>
            <Typography variant='caption' color='error'>
              {rowError}
            </Typography>
          </TableCell>
        </TableRow>
      )}

      {/* Evidence row */}
      {skill.evidence.length > 0 && (
        <TableRow>
          <TableCell colSpan={5} sx={{ py: 0.5 }}>
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
        onClose={closeEvidenceModal}
      />
    </>
  )
}

export default AssessmentSkillRow
