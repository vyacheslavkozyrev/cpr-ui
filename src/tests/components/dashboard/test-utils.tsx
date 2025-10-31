/**
 * Dashboard Test Utilities
 * Shared utilities and setup for dashboard component testing
 */

import { vi } from 'vitest'

// Mock Chart.js to avoid canvas rendering issues in tests
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  ArcElement: vi.fn(),
}))

interface ChartProps {
  data: unknown
  options?: unknown
}

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: ChartProps) => (
    <div
      data-testid='line-chart'
      data-chart-data={JSON.stringify(data)}
      data-chart-options={JSON.stringify(options)}
    >
      Line Chart Mock
    </div>
  ),
  Doughnut: ({ data, options }: ChartProps) => (
    <div
      data-testid='doughnut-chart'
      data-chart-data={JSON.stringify(data)}
      data-chart-options={JSON.stringify(options)}
    >
      Doughnut Chart Mock
    </div>
  ),
}))

/**
 * Mock dashboard data for testing
 */
export const mockDashboardSummary = {
  goals: {
    total: 12,
    active: 8,
    completed: 3,
    overdue: 1,
    completionRate: 75.0,
  },
  feedback: {
    totalReceived: 15,
    averageRating: 4.2,
    pendingResponses: 3,
    responsesThisWeek: 5,
  },
  skills: {
    totalSkills: 12,
    skillsImproving: 5,
    averageProgress: 85,
    assessmentsCompleted: 8,
  },
  activities: {
    totalActivities: 25,
    thisWeek: 12,
    today: 3,
    averagePerDay: 3.5,
  },
}

export const mockGoalsSummary = {
  statistics: {
    total: 8,
    active: 5,
    completed: 3,
    overdue: 1,
    completionRate: 62.5,
    averageProgress: 75.0,
  },
  progressTrend: [
    {
      period: 'Oct Week 1',
      completed: 2,
      created: 3,
    },
    {
      period: 'Oct Week 2',
      completed: 1,
      created: 2,
    },
    {
      period: 'Oct Week 3',
      completed: 3,
      created: 1,
    },
  ],
  recentGoals: [
    {
      id: '1',
      title: 'Improve API Design Skills',
      status: 'completed' as const,
      progress: 100,
      deadline: '2024-11-30T23:59:59.000Z',
      isOverdue: false,
      createdAt: '2024-11-01T08:00:00.000Z',
    },
    {
      id: '2',
      title: 'Learn Advanced React Patterns',
      status: 'in_progress' as const,
      progress: 65,
      deadline: '2024-12-15T23:59:59.000Z',
      isOverdue: false,
      createdAt: '2024-10-15T08:00:00.000Z',
    },
  ],
}

export const mockFeedbackSummary = {
  totalFeedback: 15,
  averageRating: 4.2,
  pendingResponses: 3,
  ratingDistribution: {
    positive: 8,
    neutral: 4,
    constructive: 3,
  },
  recentFeedback: [
    {
      id: '1',
      title: 'Great improvement in communication skills',
      rating: 5,
      type: 'positive' as const,
      from: 'Sarah Johnson',
      receivedAt: '2024-11-08T10:30:00.000Z',
    },
    {
      id: '2',
      title: 'Needs work on time management',
      rating: 3,
      type: 'constructive' as const,
      from: 'Mike Chen',
      receivedAt: '2024-11-06T14:15:00.000Z',
    },
  ],
}

export const mockSkillsSummary = {
  totalSkills: 12,
  skillsImproving: 5,
  averageProgress: 85,
  progressTrend: [75, 78, 82, 85, 88, 90],
  recentSkills: [
    {
      id: '1',
      name: 'React Development',
      category: 'Technical',
      level: 'Advanced',
      progress: 90,
      description: 'Component development and hooks',
      lastUpdated: '2024-11-05T12:00:00.000Z',
    },
    {
      id: '2',
      name: 'TypeScript',
      category: 'Technical',
      level: 'Intermediate',
      progress: 85,
      description: 'Type-safe JavaScript development',
      lastUpdated: '2024-11-03T15:30:00.000Z',
    },
    {
      id: '3',
      name: 'Team Leadership',
      category: 'Communication',
      level: 'Beginner',
      progress: 75,
      description: 'Leading small development teams',
      lastUpdated: '2024-11-01T09:45:00.000Z',
    },
  ],
}

export const mockActivityFeed = {
  totalActivities: 25,
  thisWeek: 12,
  today: 3,
  activityTrend: [2, 1, 4, 3, 5, 2, 3],
  recentActivities: [
    {
      id: '1',
      title: 'Completed React Advanced Patterns course',
      description: 'Advanced React patterns and best practices',
      type: 'goal' as const,
      timestamp: '2024-11-08T14:30:00.000Z',
      relativeTime: '2 hours ago',
      priority: 'High',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Submitted project proposal',
      description: 'Q4 development roadmap proposal',
      type: 'feedback' as const,
      timestamp: '2024-11-07T09:15:00.000Z',
      relativeTime: '1 day ago',
      priority: 'Medium',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Updated TypeScript skills assessment',
      description: 'Improved from intermediate to advanced level',
      type: 'skill' as const,
      timestamp: '2024-11-06T16:45:00.000Z',
      relativeTime: '2 days ago',
      priority: 'Medium',
      status: 'completed',
    },
  ],
}

// Viewport size helpers for responsive testing
export const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1200, height: 800 },
  wide: { width: 1920, height: 1080 },
}
