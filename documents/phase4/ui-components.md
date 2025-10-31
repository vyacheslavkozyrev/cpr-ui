# UI Components - Phase 4 Goals Management

## Component Hierarchy

```
src/pages/goals/
├── GoalsPage.tsx                    // Main goals page container
├── GoalDetailsPage.tsx              // Individual goal details page
└── components/
    ├── GoalsList.tsx               // Goals list with filters
    ├── GoalCard.tsx                // Individual goal card
    ├── GoalForm.tsx                // Create/edit goal form
    ├── GoalProgress.tsx            // Progress visualization
    ├── TasksList.tsx               // Tasks within a goal
    ├── TaskItem.tsx                // Individual task component
    ├── TaskForm.tsx                // Create/edit task form
    ├── GoalFilters.tsx             // Status, priority, deadline filters
    ├── GoalStats.tsx               // Statistics cards
    └── EmptyGoalsState.tsx         // Empty state component
```

## Page Components

### GoalsPage.tsx

**Purpose**: Main goals management page
**Features**:

- Responsive grid layout (mobile-first)
- Goals list with filtering and sorting
- Create new goal FAB button
- Statistics cards at top
- Breadcrumb navigation integration

```typescript
interface GoalsPageProps {
  // No props - uses authenticated user context
}

interface GoalsPageState {
  goals: Goal[]
  loading: boolean
  filters: GoalFilters
  pagination: PaginationState
}
```

**Layout**:

- Header: Statistics cards (4-column grid → 2-column tablet → 1-column mobile)
- Filters: Collapsible filter panel
- Content: Goals grid (3-column → 2-column → 1-column)
- FAB: Floating action button for new goal (bottom-right)

### GoalDetailsPage.tsx

**Purpose**: Individual goal detail view and editing
**Features**:

- Goal header with title, status, progress
- Tasks list management
- Goal editing capabilities
- Progress visualization
- Skills integration display

```typescript
interface GoalDetailsPageProps {
  goalId: string
}
```

**Layout**:

- Header: Goal info card with actions
- Main: Two-column layout (goal info + tasks) → single column mobile
- Actions: Edit, delete, complete buttons
- Tasks: Full task management interface

## Core Components

### GoalCard.tsx

**Purpose**: Reusable goal card for lists and grids
**Features**:

- Compact goal information display
- Progress bar visualization
- Status indicators (badges)
- Priority indicators
- Click to navigate to details

```typescript
interface GoalCardProps {
  goal: Goal
  onClick?: (goalId: string) => void
  showActions?: boolean
  compact?: boolean
}
```

**Visual Design**:

- Material-UI Card component
- Header: Title + status badge
- Body: Description (truncated), progress bar
- Footer: Deadline, priority, skills
- Hover effects and accessibility

### GoalForm.tsx

**Purpose**: Create and edit goals form
**Features**:

- Form validation with real-time feedback
- Skills selection integration
- Priority slider
- Deadline date picker
- Rich text description

```typescript
interface GoalFormProps {
  goal?: Goal // Undefined for create mode
  onSubmit: (data: CreateGoalDto | UpdateGoalDto) => Promise<void>
  onCancel: () => void
  loading?: boolean
}
```

**Form Fields**:

- Title (required, 1-250 chars)
- Description (optional, rich text, max 2000 chars)
- Related skill (searchable select)
- Target skill level (dependent select)
- Priority (slider 0-100)
- Deadline (date picker)
- Visibility (radio buttons)

### GoalProgress.tsx

**Purpose**: Visual progress representation
**Features**:

- Circular and linear progress bars
- Animated progress updates
- Task completion breakdown
- Deadline proximity indicators

```typescript
interface GoalProgressProps {
  goal: Goal
  tasks: GoalTask[]
  variant?: 'circular' | 'linear' | 'compact'
  showDetails?: boolean
}
```

## Task Components

### TasksList.tsx

**Purpose**: Manage tasks within a goal
**Features**:

- Task creation inline form
- Task completion checkboxes
- Task editing capabilities
- Drag and drop reordering (future)

```typescript
interface TasksListProps {
  goalId: string
  tasks: GoalTask[]
  onTaskUpdate: (taskId: string, updates: UpdateGoalTaskDto) => Promise<void>
  onTaskDelete: (taskId: string) => Promise<void>
  onTaskCreate: (data: CreateGoalTaskDto) => Promise<void>
  readonly?: boolean
}
```

### TaskItem.tsx

**Purpose**: Individual task display and editing
**Features**:

- Inline editing on click
- Completion checkbox
- Due date display
- Delete action with confirmation

```typescript
interface TaskItemProps {
  task: GoalTask
  onUpdate: (updates: UpdateGoalTaskDto) => Promise<void>
  onDelete: () => Promise<void>
  readonly?: boolean
}
```

### TaskForm.tsx

**Purpose**: Create and edit task form
**Features**:

- Inline form for quick creation
- Modal form for detailed editing
- Validation and error handling

```typescript
interface TaskFormProps {
  task?: GoalTask
  goalId: string
  onSubmit: (data: CreateGoalTaskDto | UpdateGoalTaskDto) => Promise<void>
  onCancel: () => void
  mode?: 'inline' | 'modal'
}
```

## Filter and Utility Components

### GoalFilters.tsx

**Purpose**: Filter and sort goals
**Features**:

- Status filter (multi-select)
- Priority range filter
- Deadline filter (overdue, this week, this month)
- Skills filter
- Sort options (priority, deadline, created)

```typescript
interface GoalFiltersProps {
  filters: GoalFilters
  onFiltersChange: (filters: GoalFilters) => void
  onReset: () => void
}

interface GoalFilters {
  status: GoalStatus[]
  priority: { min: number; max: number }
  deadline: 'all' | 'overdue' | 'this_week' | 'this_month'
  skills: string[]
  sortBy: 'priority' | 'deadline' | 'created' | 'title'
  sortOrder: 'asc' | 'desc'
}
```

### GoalStats.tsx

**Purpose**: Statistics cards for dashboard integration
**Features**:

- Total, active, completed counts
- Completion rate visualization
- Overdue goals alert
- Progress trends

```typescript
interface GoalStatsProps {
  statistics: GoalsStatistics
  loading?: boolean
  period?: 'week' | 'month' | 'quarter' | 'year'
  onPeriodChange?: (period: string) => void
}
```

## Responsive Design Specifications

### Breakpoints (Material-UI)

- **xs**: 0-599px (Mobile)
- **sm**: 600-959px (Tablet)
- **md**: 960-1279px (Desktop)
- **lg**: 1280-1919px (Large Desktop)
- **xl**: 1920px+ (Extra Large)

### Grid Layouts

```typescript
// Goals grid responsive behavior
const goalsGridProps = {
  xs: 12, // 1 column on mobile
  sm: 6, // 2 columns on tablet
  md: 4, // 3 columns on desktop
  lg: 3, // 4 columns on large desktop
}

// Statistics cards responsive behavior
const statsGridProps = {
  xs: 12, // 1 column on mobile
  sm: 6, // 2 columns on tablet
  md: 3, // 4 columns on desktop
}
```

### Mobile Optimizations

- Touch-friendly buttons (min 44px)
- Swipe gestures for task completion
- Bottom sheet for mobile forms
- Collapsible sections for small screens
- Optimized typography scales

## Accessibility Features

### ARIA Labels and Roles

- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for interactive elements
- Role attributes for custom components
- Screen reader friendly descriptions

### Keyboard Navigation

- Tab order optimization
- Enter/Space key handlers
- Escape key for modals/forms
- Arrow keys for lists

### Color and Contrast

- WCAG 2.1 AA compliance
- High contrast mode support
- Color-blind friendly indicators
- Focus visible indicators

## Internationalization

### Text Keys Structure

```typescript
// Goal-related translations
const goalTranslations = {
  'goals.title': 'Goals',
  'goals.create.title': 'Create New Goal',
  'goals.edit.title': 'Edit Goal',
  'goals.status.open': 'Open',
  'goals.status.inProgress': 'In Progress',
  'goals.status.completed': 'Completed',
  'goals.priority.low': 'Low Priority',
  'goals.priority.medium': 'Medium Priority',
  'goals.priority.high': 'High Priority',
  'goals.empty.title': 'No goals yet',
  'goals.empty.description': 'Create your first goal to get started',
  // ... more keys
}
```

### Supported Languages

- English (en) - Primary
- Spanish (es)
- French (fr)
- Belarusian (be)

## Testing Strategy

### Component Testing

- Jest + React Testing Library
- MSW for API mocking
- User interaction testing
- Accessibility testing

### Test File Structure

```
src/pages/goals/__tests__/
├── GoalsPage.test.tsx
├── GoalDetailsPage.test.tsx
└── components/
    ├── GoalCard.test.tsx
    ├── GoalForm.test.tsx
    ├── TasksList.test.tsx
    └── ...
```

### Mock Data Patterns

- Consistent with existing MSW patterns
- Realistic test scenarios
- Edge case coverage
- Accessibility testing scenarios
