import DeleteIcon from '@mui/icons-material/Delete'
import { Box, IconButton, Rating, Stack, Typography } from '@mui/material'
import React from 'react'
import type { IEvidenceItem } from '../../types/skillAssessment.types'

interface EvidenceListProps {
  evidence: IEvidenceItem[]
  readOnly?: boolean
  onRemove?: (feedbackId: string) => void
}

const EvidenceList: React.FC<EvidenceListProps> = ({
  evidence,
  readOnly = false,
  onRemove,
}) => {
  if (evidence.length === 0) return null

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {evidence.map(item => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <Typography variant='caption' fontWeight='medium'>
                {item.sender_display_name}
              </Typography>
              {item.rating != null && (
                <Rating
                  value={item.rating}
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
              {item.feedback_content}
            </Typography>
          </Box>
          {!readOnly && onRemove && (
            <IconButton
              size='small'
              aria-label='Remove evidence'
              onClick={() => onRemove(item.feedback_id)}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      ))}
    </Stack>
  )
}

export default EvidenceList
