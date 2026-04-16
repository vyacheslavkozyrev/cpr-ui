import StarIcon from '@mui/icons-material/Star'
import {
  Box,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IManagerViewFeedback } from '../../../models/TeamMember'

interface FeedbackSectionManagerProps {
  feedback: IManagerViewFeedback[]
  isLoading?: boolean
}

const getStyles = () => ({
  container: { mt: 2 },
  feedbackPaper: { p: 2, mb: 1 },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comment: { mt: 1 },
  emptyText: { color: 'text.secondary', py: 2 },
})

/**
 * Manager view of received feedback for a direct report.
 * Displays rating, comment, submitter name, and date sorted newest-first.
 */
export const FeedbackSectionManager: React.FC<FeedbackSectionManagerProps> =
  memo(({ feedback, isLoading = false }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (isLoading) {
      return (
        <Box display='flex' justifyContent='center' py={4}>
          <CircularProgress />
        </Box>
      )
    }

    const sortedFeedback = [...feedback].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return (
      <Box sx={styles.container}>
        <Typography variant='h6' mb={2}>
          {t('team_dashboard.feedback_section.title', 'Feedback Received')}
        </Typography>

        {sortedFeedback.length === 0 ? (
          <Typography sx={styles.emptyText}>
            {t('team_dashboard.feedback_section.empty', 'No feedback yet.')}
          </Typography>
        ) : (
          sortedFeedback.map((item, index) => (
            <Paper key={item.id} variant='outlined' sx={styles.feedbackPaper}>
              <Stack spacing={0.5}>
                <Box sx={styles.metaRow}>
                  <Rating
                    value={item.rating}
                    readOnly
                    size='small'
                    icon={<StarIcon fontSize='inherit' />}
                    emptyIcon={<StarIcon fontSize='inherit' />}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {item.createdAt.toLocaleDateString()}
                  </Typography>
                </Box>

                <Typography variant='caption' color='text.secondary'>
                  {t('team_dashboard.feedback_section.from', 'From')}{' '}
                  {item.submittedByName}
                </Typography>

                <Divider />

                <Typography variant='body2' sx={styles.comment}>
                  {item.comment}
                </Typography>
              </Stack>

              {index < sortedFeedback.length - 1 && <Box mt={1} />}
            </Paper>
          ))
        )}
      </Box>
    )
  })

FeedbackSectionManager.displayName = 'FeedbackSectionManager'
