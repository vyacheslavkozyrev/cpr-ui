import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Container,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import CycleStatusBadge from '../../components/ReviewCycles/CycleStatusBadge'
import { useReviewCycles } from '../../hooks/useReviewCycles'
import { EReviewCycleStatus } from '../../types/reviewCycle.types'

const MyCyclesPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useReviewCycles()
  const cycles = data?.data ?? []

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Typography variant='h5' mb={2}>
        {t('pages.myReviews.title')}
      </Typography>
      <Paper>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 1 }} />
          ))
        ) : cycles.length === 0 ? (
          <Typography color='text.secondary' sx={{ p: 2 }}>
            {t('pages.myReviews.emptyState')}
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('pages.reviewCycles.titleColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.statusColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.nomineesColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.responsesColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.createdColumn')}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {cycles.map(cycle => (
                <TableRow
                  key={cycle.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/reviews/${cycle.id}`)}
                >
                  <TableCell>{cycle.title}</TableCell>
                  <TableCell>
                    <CycleStatusBadge status={cycle.status} />
                  </TableCell>
                  <TableCell>{cycle.nominee_count}</TableCell>
                  <TableCell>{cycle.response_count}</TableCell>
                  <TableCell>
                    {new Date(cycle.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size='small'
                      disabled={cycle.status !== EReviewCycleStatus.CLOSED}
                      onClick={e => {
                        e.stopPropagation()
                        navigate(`/reviews/${cycle.id}`)
                      }}
                    >
                      <VisibilityIcon fontSize='small' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  )
}

export default MyCyclesPage
