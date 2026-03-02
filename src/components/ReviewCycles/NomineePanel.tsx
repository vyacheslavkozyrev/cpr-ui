import DeleteIcon from '@mui/icons-material/Delete'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAddNominee,
  useRemoveNominee,
  useTransitionCycleStatus,
} from '../../hooks/useReviewCycles'
import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IReviewCycleDetail,
  type IReviewNominee,
} from '../../types/reviewCycle.types'
import CycleStatusBadge from './CycleStatusBadge'

interface NomineePanelProps {
  cycle: IReviewCycleDetail
  nominees: IReviewNominee[]
  actorRole: string
  actorEmployeeId: string
}

const NomineePanel: React.FC<NomineePanelProps> = ({
  cycle,
  nominees,
  actorRole,
  actorEmployeeId,
}) => {
  const { t } = useTranslation()
  const [confirmTransition, setConfirmTransition] = useState<
    'open' | 'in_progress' | 'closed' | null
  >(null)
  const [newReviewerId, setNewReviewerId] = useState('')

  const addNomineeMutation = useAddNominee(cycle.id)
  const removeNomineeMutation = useRemoveNominee(cycle.id)
  const transitionMutation = useTransitionCycleStatus(cycle.id)

  const isDirector = actorRole === 'Director' || actorRole === 'Administrator'

  const canManageNominees =
    cycle.status === EReviewCycleStatus.OPEN &&
    (actorEmployeeId === cycle.subject_employee_id || isDirector)

  const handleAddNominee = async () => {
    if (!newReviewerId.trim()) return
    await addNomineeMutation.mutateAsync({
      reviewer_employee_id: newReviewerId.trim(),
    })
    setNewReviewerId('')
  }

  const handleRemoveNominee = (nomineeId: string) => {
    removeNomineeMutation.mutate(nomineeId)
  }

  const handleTransition = async () => {
    if (!confirmTransition) return
    await transitionMutation.mutateAsync({ status: confirmTransition })
    setConfirmTransition(null)
  }

  const activeNominees = nominees.filter(
    n => n.status !== EReviewNomineeStatus.PENDING || true
  )
  const minNomineesOk = activeNominees.length >= 2

  return (
    <Box>
      {/* Status badge */}
      <Box display='flex' alignItems='center' gap={1} mb={2}>
        <Typography variant='h6'>
          {t('components.nomineePanel.sectionTitle')}
        </Typography>
        <CycleStatusBadge status={cycle.status} />
      </Box>

      {/* Nominees table */}
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>{t('components.nomineePanel.reviewerColumn')}</TableCell>
            <TableCell>
              {t('components.nomineePanel.nominatedByColumn')}
            </TableCell>
            <TableCell>{t('components.nomineePanel.statusColumn')}</TableCell>
            {canManageNominees && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {nominees.map(nominee => (
            <TableRow key={nominee.id}>
              <TableCell>{nominee.reviewer_display_name}</TableCell>
              <TableCell>{nominee.nominated_by_display_name}</TableCell>
              <TableCell>
                <Chip label={nominee.status} size='small' />
              </TableCell>
              {canManageNominees && (
                <TableCell>
                  <IconButton
                    size='small'
                    onClick={() => handleRemoveNominee(nominee.id)}
                    title={t('components.nomineePanel.removeTooltip')}
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add nominee */}
      {canManageNominees && (
        <Box display='flex' gap={1} mt={2}>
          <TextField
            label={t('components.nomineePanel.addNomineeLabel')}
            value={newReviewerId}
            onChange={e => setNewReviewerId(e.target.value)}
            size='small'
            placeholder={t('components.nomineePanel.reviewerIdPlaceholder')}
          />
          <Button
            variant='outlined'
            onClick={handleAddNominee}
            disabled={addNomineeMutation.isPending}
          >
            {t('components.nomineePanel.nominateButton')}
          </Button>
        </Box>
      )}

      {/* Transition buttons (Director only) */}
      {isDirector && (
        <Box mt={3} display='flex' gap={2}>
          {cycle.status === EReviewCycleStatus.DRAFT && (
            <Button
              variant='contained'
              onClick={() => setConfirmTransition('open')}
            >
              {t(
                'components.nomineePanel.transitionButtons.openForNominations'
              )}
            </Button>
          )}
          {cycle.status === EReviewCycleStatus.OPEN && (
            <>
              <Button
                variant='contained'
                color='warning'
                disabled={!minNomineesOk}
                onClick={() => setConfirmTransition('in_progress')}
              >
                {t('components.nomineePanel.transitionButtons.startReview')}
              </Button>
              {!minNomineesOk && (
                <Alert severity='info' sx={{ py: 0 }}>
                  {t('components.nomineePanel.minNomineesHint')}
                </Alert>
              )}
            </>
          )}
          {cycle.status === EReviewCycleStatus.IN_PROGRESS && (
            <Button
              variant='contained'
              color='error'
              onClick={() => setConfirmTransition('closed')}
            >
              {t('components.nomineePanel.transitionButtons.closeCycle')}
            </Button>
          )}
        </Box>
      )}

      {/* Confirmation dialog */}
      <Dialog
        open={Boolean(confirmTransition)}
        onClose={() => setConfirmTransition(null)}
      >
        <DialogTitle>
          {t('components.nomineePanel.confirmDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('components.nomineePanel.confirmDialog.body')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmTransition(null)}>
            {t('components.nomineePanel.confirmDialog.cancel')}
          </Button>
          <Button
            onClick={handleTransition}
            variant='contained'
            disabled={transitionMutation.isPending}
          >
            {t('components.nomineePanel.confirmDialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NomineePanel
