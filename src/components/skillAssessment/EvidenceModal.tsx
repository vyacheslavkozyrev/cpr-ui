import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Rating,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '../../services/apiClient'
import { useLinkEvidence } from '../../services/skillAssessmentQueryService'
import type { IEvidenceItem } from '../../types/skillAssessment.types'

interface FeedbackItem {
  id: string
  sender_display_name?: string
  from_employee_display_name?: string
  rating: number | null
  content: string
}

interface EvidenceModalProps {
  open: boolean
  skillId: string
  existingEvidence: IEvidenceItem[]
  onClose: () => void
}

const EvidenceModal: React.FC<EvidenceModalProps> = ({
  open,
  skillId,
  existingEvidence,
  onClose,
}) => {
  const { t } = useTranslation()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const linkEvidence = useLinkEvidence()

  const existingFeedbackIds = new Set(existingEvidence.map(e => e.feedback_id))

  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiClient
      .get<FeedbackItem[]>('/me/feedback')
      .then(res => {
        setFeedback(res.data ?? [])
      })
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false))
  }, [open])

  const filteredFeedback = feedback.filter(fb => {
    const name = fb.sender_display_name ?? fb.from_employee_display_name ?? ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      fb.content.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleToggle = (feedbackId: string) => {
    if (existingFeedbackIds.has(feedbackId)) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(feedbackId)) next.delete(feedbackId)
      else next.add(feedbackId)
      return next
    })
  }

  const handleSave = async () => {
    for (const feedbackId of selected) {
      await linkEvidence.mutateAsync({
        skillId,
        dto: { feedback_id: feedbackId },
      })
    }
    setSelected(new Set())
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {t('components.evidenceModal.title', 'Link Evidence')}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size='small'
          placeholder={t(
            'components.evidenceModal.searchPlaceholder',
            'Search feedback...'
          )}
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={56} sx={{ mb: 1 }} />
          ))
        ) : filteredFeedback.length === 0 ? (
          <Typography color='text.secondary'>
            {t(
              'components.evidenceModal.emptyState',
              'No feedback received yet.'
            )}
          </Typography>
        ) : (
          filteredFeedback.map(fb => {
            const alreadyLinked = existingFeedbackIds.has(fb.id)
            const senderName =
              fb.sender_display_name ??
              fb.from_employee_display_name ??
              'Unknown'
            return (
              <Box
                key={fb.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 1,
                  p: 1,
                  bgcolor: alreadyLinked ? 'action.selected' : 'transparent',
                  borderRadius: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={alreadyLinked || selected.has(fb.id)}
                      disabled={alreadyLinked}
                      onChange={() => handleToggle(fb.id)}
                    />
                  }
                  label={
                    <Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant='body2' fontWeight='medium'>
                          {senderName}
                        </Typography>
                        {fb.rating != null && (
                          <Rating
                            value={fb.rating}
                            size='small'
                            readOnly
                            precision={0.5}
                          />
                        )}
                      </Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {fb.content.length > 200
                          ? `${fb.content.substring(0, 200)}…`
                          : fb.content}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', width: '100%', mx: 0 }}
                />
              </Box>
            )
          })
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('components.evidenceModal.cancel', 'Cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={selected.size === 0 || linkEvidence.isPending}
        >
          {t('components.evidenceModal.save', 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EvidenceModal
