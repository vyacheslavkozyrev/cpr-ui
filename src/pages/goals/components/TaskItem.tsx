import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalTaskDto } from '../../../dtos/GoalDto'
import { useDeleteTask, useUpdateTask } from '../../../services'
import { TaskForm } from './TaskForm'

interface TaskItemProps {
  goalId: string
  task: TGoalTaskDto
}

/**
 * Task Item Component
 * Single task with inline editing
 * Feature 0001 - Phase 3
 */
export const TaskItem: React.FC<TaskItemProps> = ({ goalId, task }) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const handleToggleComplete = async () => {
    try {
      await updateTaskMutation.mutateAsync({
        goalId,
        taskId: task.id,
        taskData: { isCompleted: !task.isCompleted },
      })
    } catch {
      // Error handled by mutation
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync({ goalId, taskId: task.id })
      setDeleteDialogOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  if (isEditing) {
    return (
      <ListItem sx={{ px: 0 }}>
        <Box width='100%'>
          <TaskForm
            goalId={goalId}
            task={task}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        </Box>
      </ListItem>
    )
  }

  return (
    <ListItem
      secondaryAction={
        <Box>
          <IconButton
            edge='end'
            size='small'
            onClick={() => setIsEditing(true)}
            sx={{ mr: 1 }}
          >
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton
            edge='end'
            size='small'
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteTaskMutation.isPending}
          >
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      }
      disablePadding
      sx={{
        opacity: task.isCompleted ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <ListItemButton onClick={handleToggleComplete} dense>
        <ListItemIcon>
          <Checkbox
            edge='start'
            checked={task.isCompleted}
            tabIndex={-1}
            disableRipple
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<CheckCircleIcon />}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant='body1'
              sx={{
                textDecoration: task.isCompleted ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </Typography>
          }
          secondary={
            <>
              {task.description && (
                <Typography variant='body2' color='text.secondary'>
                  {task.description}
                </Typography>
              )}
              {task.deadline && (
                <Typography variant='caption' color='text.secondary'>
                  {t('goals.deadline', 'Deadline')}:{' '}
                  {new Date(task.deadline).toLocaleDateString()}
                </Typography>
              )}
            </>
          }
        />
      </ListItemButton>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {t('pages.goalDetail.deleteTaskConfirmTitle', 'Delete Task?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'pages.goalDetail.deleteTaskConfirmMessage',
              'Are you sure you want to delete this task? This action cannot be undone.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color='error'
            variant='contained'
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending
              ? t('common.deleting', 'Deleting...')
              : t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </ListItem>
  )
}
