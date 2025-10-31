# Testing Strategy - Phase 4 Goals Management

## Overview

Phase 4 testing follows the established patterns from previous phases, maintaining 100% test coverage using Jest, React Testing Library, MSW v2, and Vitest for comprehensive testing.

## Testing Architecture

### Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **Integration Testing**: MSW v2 for API mocking
- **E2E Testing**: Component integration scenarios
- **Accessibility Testing**: @testing-library/jest-dom + axe-core
- **Performance Testing**: React Testing Library performance utilities

### Test File Structure

```
src/
├── tests/
│   ├── pages/
│   │   └── goals/
│   │       ├── GoalsPage.test.tsx
│   │       ├── GoalDetailsPage.test.tsx
│   │       └── components/
│   │           ├── GoalCard.test.tsx
│   │           ├── GoalForm.test.tsx
│   │           ├── GoalProgress.test.tsx
│   │           ├── TasksList.test.tsx
│   │           ├── TaskItem.test.tsx
│   │           ├── TaskForm.test.tsx
│   │           ├── GoalFilters.test.tsx
│   │           ├── GoalStats.test.tsx
│   │           └── EmptyGoalsState.test.tsx
│   └── services/
│       ├── goalsService.test.ts
│       └── tasksService.test.ts
└── mocks/
    ├── handlers/
    │   └── goalsHandlers.ts
    └── data/
        ├── goalsMockData.ts
        ├── tasksMockData.ts
        └── goalStatsMockData.ts
```

## Mock Data Strategy

### Goals Mock Data

```typescript
// src/mocks/data/goalsMockData.ts
export const mockGoals: Goal[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Improve React Skills',
    description: 'Learn advanced React patterns and hooks',
    employeeId: '550e8400-e29b-41d4-a716-446655440100',
    status: 'in_progress',
    progress: 65,
    priority: 85,
    visibility: 'private',
    relatedSkillId: '550e8400-e29b-41d4-a716-446655440200',
    deadline: '2025-12-31T23:59:59Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-10-31T12:00:00Z',
    createdBy: '550e8400-e29b-41d4-a716-446655440100',
    tasks: [
      {
        id: '550e8400-e29b-41d4-a716-446655440301',
        goalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Complete React Hooks tutorial',
        description: 'Go through official React hooks documentation',
        isCompleted: true,
        completedAt: '2025-10-15T14:30:00Z',
        createdAt: '2025-01-01T00:00:00Z',
        deadline: '2025-10-15T23:59:59Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440302',
        goalId: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Build sample project with Context API',
        isCompleted: false,
        createdAt: '2025-01-01T00:00:00Z',
        deadline: '2025-11-30T23:59:59Z',
      },
    ],
  },
  // More mock goals...
]

export const mockGoalStatistics: GoalsStatistics = {
  total: 12,
  active: 8,
  completed: 4,
  overdue: 2,
  completionRate: 0.33,
  averageProgress: 0.65,
}

export const mockRecentGoals: RecentGoalDto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Improve React Skills',
    status: 'in_progress',
    progress: 0.65,
    deadline: '2025-12-31T23:59:59Z',
    isOverdue: false,
  },
]
```

### MSW Handlers

```typescript
// src/mocks/handlers/goalsHandlers.ts
export const goalsHandlers = [
  // Get user goals (paginated)
  http.get('/api/me/goals', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '20')

    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedGoals = mockGoals.slice(startIndex, endIndex)

    return HttpResponse.json({
      items: paginatedGoals.map(goal => ({
        id: goal.id,
        title: goal.title,
        status: goal.status,
        createdAt: goal.createdAt,
      })),
      total: mockGoals.length,
      page,
      per_page: perPage,
    })
  }),

  // Get specific goal
  http.get('/api/Goals/:id', ({ params }) => {
    const { id } = params
    const goal = mockGoals.find(g => g.id === id)

    if (!goal) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(goal)
  }),

  // Create goal
  http.post('/api/Goals', async ({ request }) => {
    const goalData = (await request.json()) as CreateGoalDto

    const newGoal: Goal = {
      id: generateMockId(),
      ...goalData,
      employeeId: getCurrentUserId(),
      status: 'open',
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: getCurrentUserId(),
      tasks: [],
    }

    mockGoals.push(newGoal)
    return HttpResponse.json(newGoal, { status: 201 })
  }),

  // Update goal
  http.patch('/api/Goals/:id', async ({ params, request }) => {
    const { id } = params
    const updates = (await request.json()) as UpdateGoalDto

    const goalIndex = mockGoals.findIndex(g => g.id === id)
    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json(mockGoals[goalIndex])
  }),

  // Delete goal
  http.delete('/api/Goals/:id', ({ params }) => {
    const { id } = params
    const goalIndex = mockGoals.findIndex(g => g.id === id)

    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    mockGoals.splice(goalIndex, 1)
    return new HttpResponse(null, { status: 200 })
  }),

  // Create task
  http.post('/api/Goals/:id/tasks', async ({ params, request }) => {
    const { id } = params
    const taskData = (await request.json()) as CreateGoalTaskDto

    const goal = mockGoals.find(g => g.id === id)
    if (!goal) {
      return new HttpResponse(null, { status: 404 })
    }

    const newTask: GoalTask = {
      id: generateMockId(),
      goalId: id as string,
      ...taskData,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    }

    goal.tasks.push(newTask)
    return HttpResponse.json(newTask, { status: 200 })
  }),

  // Update task
  http.patch('/api/Goals/:id/tasks/:taskId', async ({ params, request }) => {
    const { id, taskId } = params
    const updates = (await request.json()) as UpdateGoalTaskDto

    const goal = mockGoals.find(g => g.id === id)
    if (!goal) {
      return new HttpResponse(null, { status: 404 })
    }

    const taskIndex = goal.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    goal.tasks[taskIndex] = {
      ...goal.tasks[taskIndex],
      ...updates,
      ...(updates.isCompleted && { completedAt: new Date().toISOString() }),
    }

    return HttpResponse.json(goal.tasks[taskIndex])
  }),

  // Delete task (new endpoint)
  http.delete('/api/Goals/:id/tasks/:taskId', ({ params }) => {
    const { id, taskId } = params

    const goal = mockGoals.find(g => g.id === id)
    if (!goal) {
      return new HttpResponse(null, { status: 404 })
    }

    const taskIndex = goal.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    goal.tasks.splice(taskIndex, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Dashboard goals summary
  http.get('/api/dashboard/goals-summary', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    return HttpResponse.json({
      statistics: mockGoalStatistics,
      recentGoals: mockRecentGoals,
      progressTrend: mockProgressTrend[period] || [],
    })
  }),
]
```

### Component Testing Patterns

### Page Component Testing

```typescript
// src/tests/pages/goals/GoalsPage.test.tsx
import { render, screen, waitFor, userEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GoalsPage from '../../../pages/goals/GoalsPage';
import { setupMSW } from '../../mocks/setupMSW';

const renderGoalsPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <GoalsPage />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('GoalsPage', () => {
  beforeAll(() => setupMSW());

  beforeEach(() => {
    // Reset mock data
    mockGoals.length = 0;
    mockGoals.push(...originalMockGoals);
  });

  describe('Goals List Display', () => {
    it('displays goals list correctly', async () => {
      renderGoalsPage();

      await waitFor(() => {
        expect(screen.getByText('Improve React Skills')).toBeInTheDocument();
      });

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays empty state when no goals', async () => {
      mockGoals.length = 0;

      renderGoalsPage();

      await waitFor(() => {
        expect(screen.getByText('No goals yet')).toBeInTheDocument();
      });

      expect(screen.getByText('Create your first goal to get started')).toBeInTheDocument();
    });
  });

  describe('Goal Creation', () => {
    it('opens create goal form when FAB clicked', async () => {
      const user = userEvent.setup();
      renderGoalsPage();

      await waitFor(() => {
        expect(screen.getByLabelText('Add new goal')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Add new goal'));

      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    });

    it('creates new goal successfully', async () => {
      const user = userEvent.setup();
      renderGoalsPage();

      await user.click(screen.getByLabelText('Add new goal'));

      await user.type(screen.getByLabelText('Title'), 'Test Goal');
      await user.type(screen.getByLabelText('Description'), 'Test Description');

      await user.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters goals by status', async () => {
      const user = userEvent.setup();
      renderGoalsPage();

      await waitFor(() => {
        expect(screen.getByText('Improve React Skills')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by status'));
      await user.click(screen.getByText('Completed'));

      await waitFor(() => {
        expect(screen.queryByText('Improve React Skills')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      renderGoalsPage();

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'Goals' })).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderGoalsPage();

      await user.tab();
      expect(screen.getByLabelText('Add new goal')).toHaveFocus();
    });
  });
});
```

### Form Component Testing

```typescript
// src/tests/pages/goals/components/GoalForm.test.tsx
describe('GoalForm', () => {
  describe('Validation', () => {
    it('shows validation error for empty title', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(<GoalForm onSubmit={onSubmit} onCancel={jest.fn()} />);

      await user.click(screen.getByText('Create Goal'));

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error for title too long', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(<GoalForm onSubmit={onSubmit} onCancel={jest.fn()} />);

      const longTitle = 'a'.repeat(251);
      await user.type(screen.getByLabelText('Title'), longTitle);
      await user.click(screen.getByText('Create Goal'));

      expect(screen.getByText('Title must be 250 characters or less')).toBeInTheDocument();
    });
  });

  describe('Skills Integration', () => {
    it('loads and displays skills options', async () => {
      render(<GoalForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

      const skillSelect = screen.getByLabelText('Related Skill');
      await userEvent.click(skillSelect);

      await waitFor(() => {
        expect(screen.getByText('React Development')).toBeInTheDocument();
      });
    });
  });
});
```

## Service Layer Testing

### API Service Testing

```typescript
// src/tests/services/goalsService.test.ts
import { goalsService } from '../../services/goalsService'
import { setupMSW } from '../../mocks/setupMSW'

describe('goalsService', () => {
  beforeAll(() => setupMSW())

  describe('getUserGoals', () => {
    it('fetches user goals with pagination', async () => {
      const result = await goalsService.getUserGoals({ page: 1, perPage: 10 })

      expect(result.items).toHaveLength(mockGoals.length)
      expect(result.total).toBe(mockGoals.length)
      expect(result.page).toBe(1)
    })

    it('handles API errors gracefully', async () => {
      // Mock API error
      server.use(
        http.get('/api/me/goals', () => {
          return new HttpResponse(null, { status: 500 })
        })
      )

      await expect(goalsService.getUserGoals()).rejects.toThrow()
    })
  })

  describe('createGoal', () => {
    it('creates goal successfully', async () => {
      const goalData: CreateGoalDto = {
        title: 'Test Goal',
        description: 'Test Description',
      }

      const result = await goalsService.createGoal(goalData)

      expect(result.title).toBe('Test Goal')
      expect(result.id).toBeDefined()
    })
  })
})
```

## Integration Testing

### Full User Workflow Testing

```typescript
describe('Goals Management Integration', () => {
  it('completes full goal lifecycle', async () => {
    const user = userEvent.setup()

    // Render goals page
    renderGoalsPage()

    // Create new goal
    await user.click(screen.getByLabelText('Add new goal'))
    await user.type(screen.getByLabelText('Title'), 'Integration Test Goal')
    await user.click(screen.getByText('Create Goal'))

    // Navigate to goal details
    await user.click(screen.getByText('Integration Test Goal'))

    // Add task
    await user.click(screen.getByText('Add Task'))
    await user.type(screen.getByLabelText('Task Title'), 'Test Task')
    await user.click(screen.getByText('Add'))

    // Complete task
    await user.click(screen.getByLabelText('Mark task as complete'))

    // Verify progress update
    expect(screen.getByText('100%')).toBeInTheDocument()

    // Complete goal
    await user.click(screen.getByText('Mark Complete'))

    // Verify status change
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
```

## Performance Testing

### Component Performance

```typescript
describe('Performance', () => {
  it('renders large goals list efficiently', async () => {
    const largeGoalsList = Array(100)
      .fill(null)
      .map((_, index) => ({
        ...mockGoals[0],
        id: `goal-${index}`,
        title: `Goal ${index}`,
      }))

    mockGoals.push(...largeGoalsList)

    const startTime = performance.now()
    renderGoalsPage()

    await waitFor(() => {
      expect(screen.getByText('Goal 0')).toBeInTheDocument()
    })

    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(1000) // Should render in under 1s
  })
})
```

## Coverage Requirements

### Minimum Coverage Thresholds

- **Statements**: 95%
- **Branches**: 90%
- **Functions**: 95%
- **Lines**: 95%

### Coverage Configuration

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 95,
      "lines": 95,
      "statements": 95
    },
    "src/tests/pages/goals/": {
      "branches": 90,
      "functions": 95,
      "lines": 95,
      "statements": 95
    }
  }
}
```

## Test Execution

### Running Tests

```bash
# Run all goals tests
npm test src/tests/pages/goals

# Run with coverage
npm run test:coverage src/tests/pages/goals

# Run in watch mode
npm run test:watch src/tests/pages/goals

# Run specific test file
npm test GoalsPage.test.tsx
```

### Continuous Integration

- Tests run on every PR
- Coverage reports generated
- Performance regression detection
- Accessibility compliance checks
