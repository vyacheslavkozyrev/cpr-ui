import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
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
import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalTaskDto } from '../../../dtos/GoalDto'
import { useDateFormat } from '../../../hooks'
import { useDeleteTask, useUpdateTask } from '../../../services'
import { TaskForm } from './TaskForm'

interface TaskItemProps {
  goalId: string
  task: TGoalTaskDto
}

/**
 * Task Item Component
 * Single task with inline editing and drag-and-drop
 * Memoized for performance optimization
 * Feature 0001 - Phase 3 & 5B
 */
export const TaskItem: React.FC<TaskItemProps> = memo(({ goalId, task }) => {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  // Drag-and-drop sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const handleToggleComplete = useCallback(async () => {
    try {
      await updateTaskMutation.mutateAsync({
        goalId,
        taskId: task.id,
        taskData: { isCompleted: !task.isCompleted },
      })
    } catch {
      // Error handled by mutation
    }
  }, [goalId, task.id, task.isCompleted, updateTaskMutation])

  const handleDelete = useCallback(async () => {
    try {
      await deleteTaskMutation.mutateAsync({ goalId, taskId: task.id })
      setDeleteDialogOpen(false)
    } catch {
      // Error handled by mutation
    }
  }, [goalId, task.id, deleteTaskMutation])

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

  // Drag-and-drop styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : task.isCompleted ? 0.6 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
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
        transition: 'opacity 0.2s',
      }}
    >
      <ListItemButton onClick={handleToggleComplete} dense>
        {/* Drag Handle */}
        <ListItemIcon
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', minWidth: 40 }}
        >
          <DragIndicatorIcon fontSize='small' color='action' />
        </ListItemIcon>

        {/* Checkbox */}
        <ListItemIcon sx={{ minWidth: 40 }}>
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
                <Typography
                  variant='caption'
                  color={
                    new Date(task.deadline) < new Date() && !task.isCompleted
                      ? 'error.main'
                      : 'text.secondary'
                  }
                  fontWeight={
                    new Date(task.deadline) < new Date() && !task.isCompleted
                      ? 'bold'
                      : 'normal'
                  }
                >
                  {new Date(task.deadline) < new Date() && !task.isCompleted
                    ? t('pages.goals.overdue', 'Overdue')
                    : t('pages.goals.deadline', 'Deadline')}
                  : {formatDate(task.deadline, 'MEDIUM')}
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
})
