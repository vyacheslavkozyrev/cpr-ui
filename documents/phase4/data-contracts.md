# Data Contracts - Phase 4 Goals Management

## Goal Data Transfer Objects (DTOs)

### CreateGoalDto

**Purpose**: Create a new goal

```typescript
interface CreateGoalDto {
  title: string // Required, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO date format
  relatedSkillId?: string // Optional, UUID format
  relatedSkillLevelId?: string // Optional, UUID format
  employeeId?: string // Optional, UUID format (admin override)
  priority?: number // Optional, 0-100 integer
  visibility?: 'private' | 'team' | 'org' // Optional, enum values
}
```

**Validation Rules**:

- `title`: Required, string length 1-250
- `description`: Max length 2000
- `deadline`: Must be parseable ISO date/datetime
- `employeeId`: Valid GUID format (regex validated)
- `priority`: Integer between 0-100 inclusive
- `visibility`: Must be one of: "private", "team", "org"

### UpdateGoalDto

**Purpose**: Partially update an existing goal

```typescript
interface UpdateGoalDto {
  title?: string // Optional, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
  status?: 'open' | 'in_progress' | 'completed' // Optional, enum values
  relatedSkillId?: string // Optional, UUID format
  relatedSkillLevelId?: string // Optional, UUID format
  priority?: number // Optional, 0-100 integer
  visibility?: 'private' | 'team' | 'org' // Optional, enum values
}
```

### GoalDto (Response)

**Purpose**: Complete goal object with tasks

```typescript
interface GoalDto {
  id: string // UUID format
  employeeId: string // UUID format
  title: string // Goal title
  description?: string // Goal description
  status: 'open' | 'in_progress' | 'completed' // Current status
  deadline?: string // ISO datetime format
  relatedSkillId?: string // UUID format
  relatedSkillLevelId?: string // UUID format
  priority?: number // 0-100 integer
  visibility?: string // Visibility level
  createdAt: string // ISO datetime format
  updatedAt?: string // ISO datetime format
  createdBy: string // UUID format
  tasks: GoalTaskDto[] // Array of associated tasks
}
```

## Goal Task Data Transfer Objects

### CreateGoalTaskDto

**Purpose**: Add a new task to a goal

```typescript
interface CreateGoalTaskDto {
  title: string // Required, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
}
```

### UpdateGoalTaskDto

**Purpose**: Update an existing goal task

```typescript
interface UpdateGoalTaskDto {
  title?: string // Optional, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
  isCompleted?: boolean // Optional, completion status
}
```

### GoalTaskDto (Response)

**Purpose**: Complete task object

```typescript
interface GoalTaskDto {
  id: string // UUID format
  goalId: string // UUID format
  title: string // Task title
  description?: string // Task description
  deadline?: string // ISO datetime format
  isCompleted: boolean // Completion status
  completedAt?: string // ISO datetime format
  createdAt: string // ISO datetime format
}
```

## Dashboard Integration DTOs

### GoalsSummaryDto

**Purpose**: Dashboard goals summary with statistics

```typescript
interface GoalsSummaryDto {
  statistics: GoalsStatistics
  recentGoals?: RecentGoalDto[]
  progressTrend?: ProgressTrendDto[]
}
```

### GoalsStatistics

**Purpose**: Goals statistics for dashboard

```typescript
interface GoalsStatistics {
  total: number // Total goals count
  active: number // Active goals count
  completed: number // Completed goals count
  overdue: number // Overdue goals count
  completionRate: number // Completion rate (0.0-1.0)
  averageProgress: number // Average progress (0.0-1.0)
}
```

### RecentGoalDto

**Purpose**: Recent goal summary for dashboard

```typescript
interface RecentGoalDto {
  id: string // UUID format
  title: string // Goal title
  status: string // Goal status
  progress: number // Progress (0.0-1.0)
  deadline?: string // ISO datetime format
  isOverdue: boolean // Overdue flag
}
```

### ProgressTrendDto

**Purpose**: Progress trend data for charts

```typescript
interface ProgressTrendDto {
  period: string // Time period identifier
  completed: number // Goals completed in period
  created: number // Goals created in period
}
```

## Team Management DTOs

### TeamGoalsDto

**Purpose**: Team goals overview for managers

```typescript
interface TeamGoalsDto {
  totalGoals: number // Total team goals
  activeGoals: number // Active team goals
  completedGoals: number // Completed team goals
  overdueGoals: number // Overdue team goals
  averageProgress: number // Average team progress
  goalsByStatus?: Record<string, number> // Goals grouped by status
  memberGoals?: TeamMemberGoalsDto[] // Per-member breakdown
}
```

### TeamMemberGoalsDto

**Purpose**: Individual team member goals summary

```typescript
interface TeamMemberGoalsDto {
  employeeId: string // UUID format
  employeeName: string // Employee display name
  totalGoals: number // Total goals count
  activeGoals: number // Active goals count
  completedGoals: number // Completed goals count
  overdueGoals: number // Overdue goals count
  averageProgress: number // Average progress (0.0-1.0)
}
```

## Pagination DTOs

### PaginatedGoalsResponse

**Purpose**: Paginated goals list response

```typescript
interface PaginatedGoalsResponse {
  items: GoalSummaryDto[] // Array of goal summaries
  total: number // Total items count
  page: number // Current page number
  per_page: number // Items per page
}
```

### GoalSummaryDto

**Purpose**: Minimal goal information for lists

```typescript
interface GoalSummaryDto {
  id: string // UUID format
  title: string // Goal title
  status: string // Goal status
  createdAt: string // ISO datetime format
}
```

## Validation Patterns

### String Validations

- **Title fields**: 1-250 characters, required
- **Description fields**: 0-2000 characters, optional
- **UUID fields**: Valid GUID format with regex pattern
- **Enum fields**: Exact string match from allowed values

### Numeric Validations

- **Priority**: Integer between 0-100 inclusive
- **Progress**: Number between 0.0-1.0
- **Counts**: Non-negative integers

### Date Validations

- **ISO DateTime**: Valid ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Future Dates**: Deadlines should typically be future dates

## Error Response Format

```typescript
interface ProblemDetails {
  type?: string // Error type URI
  title?: string // Error title
  status?: number // HTTP status code
  detail?: string // Error detail
  instance?: string // Error instance URI
  errors?: Record<string, string[]> // Validation errors
}
```

## Content Types

- **Request**: `application/json`
- **Response**: `application/json`
- **Character Encoding**: UTF-8
