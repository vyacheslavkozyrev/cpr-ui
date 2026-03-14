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
  useUpsertManagerAssessment,
} from '@/services/skillAssessmentQueryService'
import type { ISkillItem } from '@/types/skillAssessment.types'
import EvidenceList from './EvidenceList'
import EvidenceModal from './EvidenceModal'

interface AssessmentSkillRowProps {
  skill: ISkillItem
  readOnly?: boolean
  /** True when there is a next position — shows Next Level Required column */
  showNextLevel?: boolean
  /** Present when rendering the employee assessment page — enables manager assessment column */
  employeeId?: string
  /** True when the viewer can set manager assessments (People Manager, Director, Administrator) */
  isManager?: boolean
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
  showNextLevel = false,
  employeeId,
  isManager = false,
}) => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const showManagerColumn = Boolean(employeeId)
  const colSpan = 5 + (showNextLevel ? 1 : 0) + (showManagerColumn ? 1 : 0)

  // Self-assessment state
  const [selfValue, setSelfValue] = useState<string>(
    skill.assessed?.self_assessment_value != null
      ? String(skill.assessed.self_assessment_value)
      : ''
  )
  const [notes, setNotes] = useState(skill.assessed?.notes ?? '')
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [rowError, setRowError] = useState<string | null>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)

  // Manager assessment state
  const [managerValue, setManagerValue] = useState<string>(
    skill.assessed?.manager_assessment_value != null
      ? String(skill.assessed.manager_assessment_value)
      : ''
  )
  const [managerSaved, setManagerSaved] = useState(false)
  const [managerError, setManagerError] = useState<string | null>(null)

  const upsertCurrent = useUpsertCurrentLevel()
  const deleteCurrent = useDeleteCurrentLevel()
  const unlinkEvidence = useUnlinkEvidence()
  const upsertManager = useUpsertManagerAssessment()

  useEffect(() => {
    setSelfValue(
      skill.assessed?.self_assessment_value != null
        ? String(skill.assessed.self_assessment_value)
        : ''
    )
    setNotes(skill.assessed?.notes ?? '')
  }, [skill.assessed?.self_assessment_value, skill.assessed?.notes])

  useEffect(() => {
    setManagerValue(
      skill.assessed?.manager_assessment_value != null
        ? String(skill.assessed.manager_assessment_value)
        : ''
    )
  }, [skill.assessed?.manager_assessment_value])

  const showSaved = useCallback(() => {
    setSavedIndicator(true)
    setTimeout(() => setSavedIndicator(false), 2000)
  }, [])

  const showManagerSaved = useCallback(() => {
    setManagerSaved(true)
    setTimeout(() => setManagerSaved(false), 2000)
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

  const handleManagerValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setManagerValue(e.target.value)
    },
    []
  )

  const handleManagerValueBlur = useCallback(async () => {
    if (!employeeId) return
    setManagerError(null)
    const parsed = parseFloat(managerValue)
    if (managerValue === '' || isNaN(parsed)) return
    if (parsed <= 0) {
      setManagerError(
        t(
          'components.assessmentSkillRow.valueMustBePositive',
          'Value must be greater than 0'
        )
      )
      return
    }
    try {
      await upsertManager.mutateAsync({
        employeeId,
        skillId: skill.skill_id,
        dto: { manager_assessment_value: parsed },
      })
      showManagerSaved()
    } catch (err: unknown) {
      setManagerError((err as { message?: string })?.message ?? 'Error')
    }
  }, [
    employeeId,
    managerValue,
    skill.skill_id,
    upsertManager,
    showManagerSaved,
    t,
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
  const isManagerSaving = upsertManager.isPending
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

        {/* Next level required */}
        {showNextLevel && (
          <TableCell sx={styles.topCell}>
            {skill.next_position_required_level ? (
              <Chip
                label={skill.next_position_required_level.title}
                size='small'
                color='secondary'
                variant='outlined'
              />
            ) : (
              <Typography variant='body2' color='text.secondary'>
                —
              </Typography>
            )}
          </TableCell>
        )}

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

        {/* Manager assessment column (employee assessment page only) */}
        {showManagerColumn && (
          <TableCell sx={styles.topCell}>
            {isManager ? (
              <>
                <TextField
                  size='small'
                  type='number'
                  value={managerValue}
                  onChange={handleManagerValueChange}
                  onBlur={handleManagerValueBlur}
                  inputProps={{ min: 0.1, step: 0.1 }}
                  placeholder={t(
                    'components.assessmentSkillRow.notAssessed',
                    'Not assessed'
                  )}
                  sx={{ width: 120 }}
                  error={Boolean(managerError)}
                />
                {isManagerSaving && (
                  <CircularProgress size={14} sx={{ ml: 1 }} />
                )}
                {managerSaved && !isManagerSaving && (
                  <Typography
                    variant='caption'
                    color='success.main'
                    sx={styles.saveIndicator}
                  >
                    {t('components.assessmentSkillRow.saved', 'Saved ✓')}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant='body2'>
                {skill.assessed?.manager_assessment_value ??
                  t(
                    'components.assessmentSkillRow.notAssessed',
                    'Not assessed'
                  )}
              </Typography>
            )}
          </TableCell>
        )}

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
          {!readOnly && Boolean(skill.assessed) && (
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
      {(rowError || managerError) && (
        <TableRow>
          <TableCell colSpan={colSpan} sx={{ py: 0, borderBottom: 'none' }}>
            <Typography variant='caption' color='error'>
              {rowError ?? managerError}
            </Typography>
          </TableCell>
        </TableRow>
      )}

      {/* Evidence row */}
      {skill.evidence.length > 0 && (
        <TableRow>
          <TableCell colSpan={colSpan} sx={{ py: 0.5 }}>
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
