import AddIcon from '@mui/icons-material/Add'
import { Box, Button, List, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalTaskDto } from '../../../dtos/GoalDto'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  goalId: string
  tasks: TGoalTaskDto[]
}

/**
 * Task List Component
 * Displays and manages tasks for a goal
 * Feature 0001 - Phase 3
 */
export const TaskList: React.FC<TaskListProps> = ({ goalId, tasks }) => {
  const { t } = useTranslation()
  const [showAddForm, setShowAddForm] = useState(false)

  // Sort tasks: incomplete first, then by created date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return a.isCompleted ? 1 : -1
  })

  return (
    <Box>
      {/* Add Task Button */}
      {!showAddForm && (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          variant='outlined'
          sx={{ mb: 2 }}
        >
          {t('pages.goalDetail.addTask', 'Add Task')}
        </Button>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <Box mb={2}>
          <TaskForm
            goalId={goalId}
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => setShowAddForm(false)}
          />
        </Box>
      )}

      {/* Tasks List */}
      {sortedTasks.length > 0 ? (
        <List>
          {sortedTasks.map(task => (
            <TaskItem key={task.id} goalId={goalId} task={task} />
          ))}
        </List>
      ) : (
        <Typography
          variant='body2'
          color='text.secondary'
          textAlign='center'
          py={4}
        >
          {t(
            'pages.goalDetail.noTasks',
            'No tasks yet. Add your first task to get started.'
          )}
        </Typography>
      )}
    </Box>
  )
}
