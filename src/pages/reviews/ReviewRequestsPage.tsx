import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Skeleton,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyReviewRequests } from '../../hooks/useReviewCycles'

const ReviewRequestsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: requests = [], isLoading } = useMyReviewRequests()

  return (
    <Container maxWidth='md' sx={{ py: 3 }}>
      <Typography variant='h5' mb={3}>
        {t('pages.reviewRequests.title')}
      </Typography>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={80} sx={{ mb: 1 }} />
        ))
      ) : requests.length === 0 ? (
        <Box textAlign='center' py={6}>
          <Typography color='text.secondary'>
            {t('pages.reviewRequests.emptyState')}
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={1}>
            {t('pages.reviewRequests.emptyStateSubtext')}
          </Typography>
        </Box>
      ) : (
        requests.map(request => (
          <Card key={request.cycle_id} variant='outlined' sx={{ mb: 2 }}>
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant='subtitle1'>
                  {request.cycle_title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {request.subject_display_name}
                </Typography>
                <Chip
                  label={request.nominee_status}
                  size='small'
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Button
                variant='contained'
                onClick={() => navigate(`/reviews/${request.cycle_id}`)}
              >
                {t('pages.reviewRequests.submitButton')}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  )
}

export default ReviewRequestsPage
