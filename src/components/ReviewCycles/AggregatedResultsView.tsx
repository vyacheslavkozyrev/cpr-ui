import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Rating,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IAggregatedResults } from '../../types/reviewCycle.types'

interface AggregatedResultsViewProps {
  results: IAggregatedResults
}

const AggregatedResultsView: React.FC<AggregatedResultsViewProps> = ({
  results,
}) => {
  const { t } = useTranslation()

  // Shuffle comments on each render for privacy
  const shuffledComments = useMemo(() => {
    return [...results.comments].sort(() => Math.random() - 0.5)
  }, [results.comments])

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {t('components.resultsView.aggregatedTitle')}
      </Typography>
      <Box display='flex' alignItems='center' gap={2} mb={2}>
        <Rating value={results.average_rating} precision={0.1} readOnly />
        <Typography>
          {results.average_rating.toFixed(1)} — {results.response_count}{' '}
          {t('components.resultsView.responseCountLabel')}
        </Typography>
      </Box>
      <Typography variant='subtitle1' gutterBottom>
        {t('components.resultsView.anonymizedCommentsHeading')}
      </Typography>
      {shuffledComments.length === 0 ? (
        <Typography color='text.secondary'>
          {t('components.resultsView.noResults')}
        </Typography>
      ) : (
        <List>
          {shuffledComments.map((item, i) => (
            <ListItem key={i} alignItems='flex-start' disableGutters>
              <Card variant='outlined' sx={{ width: '100%' }}>
                <CardContent sx={{ py: 1 }}>
                  <Box display='flex' alignItems='center' gap={1} mb={0.5}>
                    <Rating value={item.overall_rating} size='small' readOnly />
                  </Box>
                  <ListItemText primary={item.comments} />
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

export default AggregatedResultsView
