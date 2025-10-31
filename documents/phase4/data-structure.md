# Data Structure - Phase 4 Goals Management

## Database Schema

Based on the existing database schema from `data.md`, the goals management system utilizes the following tables:

### goals Table

**Purpose**: Store individual employee goals

```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(250) NOT NULL,
    description TEXT,
    employee_id UUID NOT NULL REFERENCES employees(id),
    related_skill_id UUID REFERENCES skills(id),
    related_skill_level_id UUID REFERENCES skill_levels(id),
    deadline TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    priority INTEGER CHECK (priority >= 0 AND priority <= 100),
    visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'org')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    is_deleted BOOLEAN DEFAULT FALSE
);
```

### goal_tasks Table

**Purpose**: Store tasks that break down goals into smaller items

```sql
CREATE TABLE goal_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE
);
```

## Relationships

### Primary Relationships

```
employees (1) ←→ (N) goals
goals (1) ←→ (N) goal_tasks
skills (1) ←→ (N) goals (optional)
skill_levels (1) ←→ (N) goals (optional)
users (1) ←→ (N) goals (created_by)
```

### Relationship Details

#### Employee → Goals (One-to-Many)

- Each goal belongs to exactly one employee (`employee_id`)
- An employee can have multiple goals
- Goals are individual (not shared or hierarchical)

#### Goal → Tasks (One-to-Many)

- Each task belongs to exactly one goal (`goal_id`)
- A goal can have multiple tasks for breakdown
- Tasks are deleted when goal is deleted (CASCADE)

#### Skills Integration (Optional)

- Goals can optionally link to a skill (`related_skill_id`)
- Goals can optionally link to a target skill level (`related_skill_level_id`)
- This enables skills-based goal setting and tracking

#### Audit Trail

- All goals track creator (`created_by` → users.id)
- Timestamps for creation and updates
- Soft delete pattern with `is_deleted` flags

## Data Constraints

### Business Rules

1. **Individual Ownership**: Goals belong to one employee only
2. **Task Dependency**: Tasks cannot exist without parent goal
3. **Progress Tracking**: Progress percentage 0-100
4. **Priority Levels**: Priority 0-100 (higher = more important)
5. **Status Workflow**: open → in_progress → completed
6. **Visibility Levels**: private (default), team, org

### Field Constraints

- **Title**: Required, 1-250 characters
- **Description**: Optional, unlimited text
- **Progress**: 0-100 integer percentage
- **Priority**: 0-100 integer (optional)
- **Visibility**: Enum values only
- **Status**: Enum values only
- **Deadlines**: Future dates recommended
- **UUIDs**: Valid GUID format

## Indexes (Recommended)

### Performance Indexes

```sql
-- Employee goals lookup (most common query)
CREATE INDEX idx_goals_employee_id ON goals(employee_id) WHERE is_deleted = FALSE;

-- Goal status filtering
CREATE INDEX idx_goals_status ON goals(status) WHERE is_deleted = FALSE;

-- Goals by deadline (overdue detection)
CREATE INDEX idx_goals_deadline ON goals(deadline) WHERE is_deleted = FALSE AND deadline IS NOT NULL;

-- Task lookup by goal
CREATE INDEX idx_goal_tasks_goal_id ON goal_tasks(goal_id) WHERE is_deleted = FALSE;

-- Skills-based goal filtering
CREATE INDEX idx_goals_skill ON goals(related_skill_id) WHERE is_deleted = FALSE AND related_skill_id IS NOT NULL;
```

## Data Flow Patterns

### Goal Lifecycle

```
1. CREATE: Employee creates goal with basic info
2. PLANNING: Add tasks to break down goal
3. EXECUTION: Update progress, mark tasks complete
4. COMPLETION: Mark goal as completed
5. ARCHIVAL: Soft delete if needed
```

### Progress Calculation

```typescript
// Automatic progress calculation based on completed tasks
const calculateGoalProgress = (tasks: GoalTask[]): number => {
  if (tasks.length === 0) return 0
  const completedTasks = tasks.filter(task => task.isCompleted).length
  return Math.round((completedTasks / tasks.length) * 100)
}
```

### Status Management

```typescript
// Status transitions
const statusTransitions = {
  open: ['in_progress', 'completed'],
  in_progress: ['open', 'completed'],
  completed: ['in_progress'], // Allow reopening
}
```

## Data Validation Rules

### Server-side Validation

- Title: Required, 1-250 chars
- Description: Max 2000 chars
- Employee ID: Must exist in employees table
- Skills: Must exist in respective tables if provided
- Progress: 0-100 integer
- Priority: 0-100 integer
- Visibility: Enum validation
- Status: Enum validation
- Deadlines: Valid datetime format

### Client-side Validation

- Form validation before submission
- Real-time feedback on field errors
- Progress bar updates
- Status transition validation

## Data Migration Considerations

### Initial Data Setup

- Goals table already exists (confirmed in database schema)
- Goal_tasks table already exists (confirmed in database schema)
- No migration scripts needed for Phase 4

### Future Enhancements

- Goal templates (Phase 4.5)
- Goal collaboration (future phases)
- Advanced reporting (future phases)
- Performance metrics (future phases)

## Data Privacy & Security

### Access Control

- Users can only access their own goals
- Managers can view team member goals (via API permissions)
- Administrators have full access
- Skills data integration respects existing permissions

### Data Retention

- Soft delete pattern preserves data
- Audit trail with created_by tracking
- Timestamp tracking for compliance
- No automatic data purging (manual process)

## Query Patterns

### Common Queries

```sql
-- Get user's active goals
SELECT * FROM goals
WHERE employee_id = ? AND status != 'completed' AND is_deleted = FALSE
ORDER BY priority DESC, deadline ASC;

-- Get goal with tasks
SELECT g.*, t.* FROM goals g
LEFT JOIN goal_tasks t ON g.id = t.goal_id
WHERE g.id = ? AND g.is_deleted = FALSE AND t.is_deleted = FALSE;

-- Get overdue goals
SELECT * FROM goals
WHERE deadline < NOW() AND status != 'completed' AND is_deleted = FALSE;

-- Get team goals summary
SELECT employee_id, COUNT(*) as total_goals,
       COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals
FROM goals
WHERE employee_id IN (?) AND is_deleted = FALSE
GROUP BY employee_id;
```
