import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlagIcon from '@mui/icons-material/Flag'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { TGoalDto } from '../../../dtos/GoalDto'

interface GoalCardProps {
  goal: TGoalDto
}

/**
 * Goal Card Component
 * Displays goal summary in card format
 * Feature 0001 - Phase 3
 */
export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleCardClick = () => {
    navigate(`/goals/${goal.id}`)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    navigate(`/goals/${goal.id}/edit`)
  }

  // Calculate task completion
  const completedTasks = goal.tasks
    ? goal.tasks.filter(t => t.isCompleted).length
    : 0
  const totalTasks = goal.tasks ? goal.tasks.length : 0

  // Status colors
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

  // Priority label
  const getPriorityLabel = (priority?: number) => {
    if (!priority) return null
    if (priority >= 75) return { label: 'High', color: 'error' as const }
    if (priority >= 50) return { label: 'Medium', color: 'warning' as const }
    return { label: 'Low', color: 'info' as const }
  }

  const priorityInfo = getPriorityLabel(goal.priority)

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          {/* Header with status and menu */}
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='start'
            mb={1}
          >
            <Stack direction='row' spacing={1} flexWrap='wrap' gap={0.5}>
              <Chip
                label={t(`goals.status.${goal.status}`, goal.status)}
                color={getStatusColor(goal.status)}
                size='small'
              />
              {priorityInfo && (
                <Chip
                  icon={<FlagIcon />}
                  label={priorityInfo.label}
                  color={priorityInfo.color}
                  size='small'
                />
              )}
              {goal.isCompleted && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={t('goals.completed', 'Completed')}
                  color='success'
                  size='small'
                />
              )}
            </Stack>

            <IconButton size='small' onClick={handleMenuOpen} sx={{ ml: 1 }}>
              <MoreVertIcon />
            </IconButton>
          </Stack>

          {/* Goal Title */}
          <Typography
            variant='h6'
            component='h3'
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '3em',
            }}
          >
            {goal.title}
          </Typography>

          {/* Description */}
          {goal.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 2,
              }}
            >
              {goal.description}
            </Typography>
          )}

          {/* Progress */}
          <Box mb={1}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={0.5}
            >
              <Typography variant='caption' color='text.secondary'>
                {t('goals.progress', 'Progress')}
              </Typography>
              <Typography variant='caption' fontWeight='medium'>
                {goal.progressPercent.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={goal.progressPercent}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>

          {/* Tasks count */}
          {totalTasks > 0 && (
            <Typography variant='caption' color='text.secondary'>
              {t('goals.tasksCompleted', {
                completed: completedTasks,
                total: totalTasks,
                defaultValue: `${completedTasks} / ${totalTasks} tasks completed`,
              })}
            </Typography>
          )}

          {/* Deadline */}
          {goal.deadline && (
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
              mt={1}
            >
              {t('goals.deadline', 'Deadline')}:{' '}
              {new Date(goal.deadline).toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={e => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>{t('common.edit', 'Edit')}</MenuItem>
        <MenuItem onClick={() => navigate(`/goals/${goal.id}`)}>
          {t('common.view', 'View Details')}
        </MenuItem>
      </Menu>
    </Card>
  )
}
