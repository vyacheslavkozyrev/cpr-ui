import {
  Box,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { IDetailedResults } from '../../types/reviewCycle.types'

interface DetailedResultsViewProps {
  results: IDetailedResults
}

const DetailedResultsView: React.FC<DetailedResultsViewProps> = ({
  results,
}) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        {t('components.resultsView.detailedTitle')}
      </Typography>
      <Box display='flex' alignItems='center' gap={2} mb={2}>
        <Rating value={results.average_rating} precision={0.1} readOnly />
        <Typography>
          {results.average_rating.toFixed(1)} — {results.response_count}{' '}
          {t('components.resultsView.responseCountLabel')}
        </Typography>
      </Box>
      {results.responses.length === 0 ? (
        <Typography color='text.secondary'>
          {t('components.resultsView.noResults')}
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reviewer</TableCell>
              <TableCell>
                {t('components.resultsView.averageRatingLabel')}
              </TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.responses.map(response => (
              <TableRow key={response.reviewer_employee_id}>
                <TableCell>{response.reviewer_display_name}</TableCell>
                <TableCell>
                  <Rating
                    value={response.overall_rating}
                    readOnly
                    size='small'
                  />
                </TableCell>
                <TableCell>{response.comments}</TableCell>
                <TableCell>
                  {new Date(response.submitted_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )
}

export default DetailedResultsView
