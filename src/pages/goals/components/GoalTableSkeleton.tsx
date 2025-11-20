import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface GoalTableSkeletonProps {
  rows?: number
}

/**
 * Goal Table Skeleton Loader
 * Displays loading placeholder for goal table
 * Feature 0001 - Phase 5A
 */
export const GoalTableSkeleton: React.FC<GoalTableSkeletonProps> = ({
  rows = 10,
}) => {
  const { t } = useTranslation()

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('pages.goals.table.title', 'Title')}</TableCell>
            <TableCell>{t('pages.goals.table.status', 'Status')}</TableCell>
            <TableCell>{t('pages.goals.table.progress', 'Progress')}</TableCell>
            <TableCell>{t('pages.goals.table.tasks', 'Tasks')}</TableCell>
            <TableCell>{t('pages.goals.table.deadline', 'Deadline')}</TableCell>
            <TableCell align='right'>
              {t('pages.goals.table.actions', 'Actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              {/* Title cell */}
              <TableCell>
                <Skeleton variant='text' width='80%' height={24} />
                <Skeleton variant='text' width='60%' height={16} />
              </TableCell>

              {/* Status cell */}
              <TableCell>
                <Skeleton variant='rounded' width={90} height={24} />
              </TableCell>

              {/* Progress cell */}
              <TableCell>
                <Skeleton variant='rounded' width={120} height={6} />
              </TableCell>

              {/* Tasks cell */}
              <TableCell>
                <Skeleton variant='text' width={60} height={20} />
              </TableCell>

              {/* Deadline cell */}
              <TableCell>
                <Skeleton variant='text' width={100} height={20} />
              </TableCell>

              {/* Actions cell */}
              <TableCell align='right'>
                <Skeleton
                  variant='circular'
                  width={32}
                  height={32}
                  sx={{ ml: 'auto' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
