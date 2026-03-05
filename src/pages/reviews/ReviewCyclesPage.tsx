import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Container,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import CreateCycleForm from '../../components/ReviewCycles/CreateCycleForm'
import CycleStatusBadge from '../../components/ReviewCycles/CycleStatusBadge'
import { useReviewCycles } from '../../hooks/useReviewCycles'

const PAGE_SIZE = 20

const ReviewCyclesPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading } = useReviewCycles({
    page,
    page_size: PAGE_SIZE,
  })

  const cycles = data?.data ?? []
  const totalPages = data?.pagination.total_pages ?? 1

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <Typography variant='h5'>{t('pages.reviewCycles.title')}</Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          {t('pages.reviewCycles.createButton')}
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 1 }} />
          ))
        ) : cycles.length === 0 ? (
          <Typography color='text.secondary' sx={{ p: 2 }}>
            {t('pages.reviewCycles.emptyState')}
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('pages.reviewCycles.titleColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.subjectColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.statusColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.nomineesColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.responsesColumn')}</TableCell>
                <TableCell>{t('pages.reviewCycles.createdColumn')}</TableCell>
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
                  <TableCell>{cycle.subject_display_name}</TableCell>
                  <TableCell>
                    <CycleStatusBadge status={cycle.status} />
                  </TableCell>
                  <TableCell>{cycle.nominee_count}</TableCell>
                  <TableCell>{cycle.response_count}</TableCell>
                  <TableCell>
                    {new Date(cycle.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Box display='flex' justifyContent='center'>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, p) => setPage(p)}
        />
      </Box>

      <CreateCycleForm open={createOpen} onClose={() => setCreateOpen(false)} />
    </Container>
  )
}

export default ReviewCyclesPage
