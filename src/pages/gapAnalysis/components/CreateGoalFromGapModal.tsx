import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillGap } from '@/models/GapAnalysis'
import { useCreateGoalFromGap } from '@/services/gapAnalysisQueryService'

interface ICreateGoalFromGapModalProps {
  open: boolean
  skillGap: ISkillGap | null
  /** When set, the goal is created on behalf of the target employee (manager view). */
  targetEmployeeId?: string
  onClose: () => void
}

const getStyles = () => ({
  field: { mb: 2 } as const,
})

const CreateGoalFromGapModal: React.FC<ICreateGoalFromGapModalProps> =
  React.memo(({ open, skillGap, targetEmployeeId, onClose }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const [title, setTitle] = useState('')
    const [deadline, setDeadline] = useState('')
    const [error, setError] = useState<string | null>(null)

    const createGoal = useCreateGoalFromGap(targetEmployeeId)

    // Pre-populate title when skillGap changes
    useEffect(() => {
      if (skillGap) {
        setTitle(
          t(
            'gap_analysis.goal_title_prefix',
            'Improve {{skill}} to {{level}}',
            {
              skill: skillGap.skill.title,
              level: skillGap.requiredLevel.title,
            }
          )
        )
        setDeadline('')
        setError(null)
      }
    }, [skillGap, t])

    const handleTitleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
      },
      []
    )

    const handleDeadlineChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeadline(e.target.value)
      },
      []
    )

    const handleSubmit = useCallback(async () => {
      if (!skillGap) return
      setError(null)

      if (!title.trim()) {
        setError(t('gap_analysis.goal_title_required', 'Title is required.'))
        return
      }

      try {
        await createGoal.mutateAsync({
          title: title.trim(),
          ...(deadline ? { deadline } : {}),
          relatedSkillId: skillGap.skill.id,
          relatedSkillLevelId: skillGap.requiredLevel.id,
          ...(targetEmployeeId ? { employeeId: targetEmployeeId } : {}),
        })
        onClose()
      } catch (err: unknown) {
        setError(
          (err as { message?: string })?.message ??
            t('gap_analysis.goal_create_error', 'Failed to create goal.')
        )
      }
    }, [skillGap, title, deadline, targetEmployeeId, createGoal, onClose, t])

    const handleClose = useCallback(() => {
      if (!createGoal.isPending) {
        onClose()
      }
    }, [createGoal.isPending, onClose])

    return (
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          {t('gap_analysis.create_goal_modal_title', 'Create Goal')}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label={t('gap_analysis.goal_title_label', 'Title')}
            value={title}
            onChange={handleTitleChange}
            fullWidth
            required
            inputProps={{ maxLength: 250 }}
            sx={styles.field}
            autoFocus
          />
          <TextField
            label={t('gap_analysis.goal_deadline_label', 'Deadline (optional)')}
            type='date'
            value={deadline}
            onChange={handleDeadlineChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={styles.field}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={createGoal.isPending}>
            {t('gap_analysis.cancel_btn', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={createGoal.isPending || !title.trim()}
          >
            {createGoal.isPending
              ? t('gap_analysis.saving_btn', 'Saving…')
              : t('gap_analysis.save_btn', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  })

CreateGoalFromGapModal.displayName = 'CreateGoalFromGapModal'

export default CreateGoalFromGapModal
