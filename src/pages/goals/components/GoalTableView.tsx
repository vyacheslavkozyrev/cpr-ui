import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TGoalDto } from '../../../dtos/GoalDto'

interface GoalTableViewProps {
  goals: TGoalDto[]
}

/**
 * Goal Table View Component
 * Displays goals in table format
 * Feature 0001 - Phase 3
 */
export const GoalTableView: React.FC<GoalTableViewProps> = ({ goals }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    goalId: string
  ) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedGoalId(goalId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedGoalId(null)
  }

  const handleRowClick = (goalId: string) => {
    navigate(`/goals/${goalId}`)
  }

  const handleEdit = () => {
    if (selectedGoalId) {
      navigate(`/goals/${selectedGoalId}/edit`)
    }
    handleMenuClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'primary'
      default:
        return 'default'
    }
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('goals.table.title', 'Title')}</TableCell>
              <TableCell>{t('goals.table.status', 'Status')}</TableCell>
              <TableCell>{t('goals.table.progress', 'Progress')}</TableCell>
              <TableCell>{t('goals.table.tasks', 'Tasks')}</TableCell>
              <TableCell>{t('goals.table.deadline', 'Deadline')}</TableCell>
              <TableCell align='right'>
                {t('goals.table.actions', 'Actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.map(goal => {
              const completedTasks = goal.tasks
                ? goal.tasks.filter(t => t.isCompleted).length
                : 0
              const totalTasks = goal.tasks ? goal.tasks.length : 0

              return (
                <TableRow
                  key={goal.id}
                  hover
                  onClick={() => handleRowClick(goal.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant='body1' fontWeight='medium'>
                        {goal.title}
                      </Typography>
                      {goal.description && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {goal.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={t(`goals.status.${goal.status}`, goal.status)}
                      color={getStatusColor(goal.status)}
                      size='small'
                      {...(goal.isCompleted && { icon: <CheckCircleIcon /> })}
                    />
                  </TableCell>

                  <TableCell>
                    <Box display='flex' alignItems='center' gap={1}>
                      <Box flexGrow={1} maxWidth={150}>
                        <LinearProgress
                          variant='determinate'
                          value={goal.progressPercent}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                      <Typography variant='caption' minWidth={40}>
                        {goal.progressPercent.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant='body2'>
                      {completedTasks} / {totalTasks}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {goal.deadline ? (
                      <Typography variant='body2'>
                        {new Date(goal.deadline).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        {t('goals.noDeadline', 'No deadline')}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align='right'>
                    <IconButton
                      size='small'
                      onClick={e => handleMenuOpen(e, goal.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>{t('common.edit', 'Edit')}</MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedGoalId) navigate(`/goals/${selectedGoalId}`)
            handleMenuClose()
          }}
        >
          {t('common.view', 'View Details')}
        </MenuItem>
      </Menu>
    </>
  )
}
