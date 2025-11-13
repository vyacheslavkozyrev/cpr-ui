import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, List, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalTaskDto } from '../../../dtos/GoalDto'
import { useTaskOrderStore } from '../../../stores'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  goalId: string
  tasks: TGoalTaskDto[]
}

/**
 * Task List Component
 * Displays and manages tasks for a goal with drag-and-drop reordering
 * Feature 0001 - Phase 3 & 5B
 */
export const TaskList: React.FC<TaskListProps> = ({ goalId, tasks }) => {
  const { t } = useTranslation()
  const [showAddForm, setShowAddForm] = useState(false)
  const taskOrderStore = useTaskOrderStore()
  const customOrder = taskOrderStore.taskOrders[goalId]

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sort tasks with custom order from localStorage
  const sortedTasks = useMemo(() => {
    if (!customOrder || customOrder.length === 0) {
      // Default sort: incomplete first, then by created date
      return [...tasks].sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }
        return a.isCompleted ? 1 : -1
      })
    }

    // Sort by custom order, then fallback to default for new tasks
    const taskMap = new Map(tasks.map(task => [task.id, task]))
    const orderedTasks: TGoalTaskDto[] = []
    const remainingTasks: TGoalTaskDto[] = []

    customOrder.forEach(id => {
      const task = taskMap.get(id)
      if (task) {
        orderedTasks.push(task)
        taskMap.delete(id)
      }
    })

    // Add remaining tasks (new tasks not in custom order)
    taskMap.forEach(task => remainingTasks.push(task))
    remainingTasks.sort((a, b) => {
      if (a.isCompleted === b.isCompleted) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a.isCompleted ? 1 : -1
    })

    return [...orderedTasks, ...remainingTasks]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, customOrder])

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedTasks.findIndex(task => task.id === active.id)
    const newIndex = sortedTasks.findIndex(task => task.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder tasks
    const reorderedTasks = [...sortedTasks]
    const [movedTask] = reorderedTasks.splice(oldIndex, 1)
    reorderedTasks.splice(newIndex, 0, movedTask)

    // Save new order to localStorage
    const newOrder = reorderedTasks.map(task => task.id)
    taskOrderStore.setTaskOrder(goalId, newOrder)
  }

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

      {/* Tasks List with Drag-and-Drop */}
      {sortedTasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <List>
              {sortedTasks.map(task => (
                <TaskItem key={task.id} goalId={goalId} task={task} />
              ))}
            </List>
          </SortableContext>
        </DndContext>
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
