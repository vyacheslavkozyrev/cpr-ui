import { http, HttpResponse } from 'msw'
import { logger } from '../../utils/logger'

/**
 * Dashboard API Mock Data
 * Realistic mock data for dashboard endpoints
 */

// Mock data generators
const generateMockSummary = () => ({
  goals: {
    total: 12,
    active: 8,
    completed: 3,
    overdue: 1,
    completionRate: 75.0,
  },
  feedback: {
    totalReceived: 15,
    pendingRequests: 3,
    averageRating: 4.2,
    recentCount: 5,
  },
  skills: {
    totalSkills: 20,
    assessedSkills: 16,
    assessmentProgress: 80.0,
    averageLevel: 3.2,
  },
  activity: {
    totalActivities: 25,
    recentActivities: 8,
  },
})

const generateMockActivity = (days: number, page: number, perPage: number) => {
  const activities = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      type: 'goal_completed',
      title: 'Goal Completed',
      description: 'Successfully completed "Improve API Design Skills"',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        goalId: '550e8400-e29b-41d4-a716-446655440010',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      type: 'feedback_received',
      title: 'New Feedback Received',
      description: 'Received 5-star feedback from Sarah Johnson',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        feedbackId: '550e8400-e29b-41d4-a716-446655440020',
        fromUserId: '550e8400-e29b-41d4-a716-446655440030',
        rating: 5,
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      type: 'skill_assessed',
      title: 'Skill Assessment Updated',
      description: 'Updated React skill level to Advanced',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        skillId: '550e8400-e29b-41d4-a716-446655440040',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      type: 'goal_created',
      title: 'New Goal Created',
      description: 'Created goal "Master TypeScript Advanced Features"',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        goalId: '550e8400-e29b-41d4-a716-446655440011',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      type: 'feedback_requested',
      title: 'Feedback Request Sent',
      description: 'Requested feedback from team lead on presentation skills',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        feedbackId: '550e8400-e29b-41d4-a716-446655440021',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      type: 'goal_updated',
      title: 'Goal Progress Updated',
      description: 'Updated progress on "Learn Docker Containerization"',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        goalId: '550e8400-e29b-41d4-a716-446655440012',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      type: 'skill_updated',
      title: 'Skill Level Improved',
      description: 'Node.js skill advanced from Intermediate to Advanced',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        skillId: '550e8400-e29b-41d4-a716-446655440041',
      },
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      type: 'feedback_received',
      title: 'Peer Feedback Received',
      description: 'Received constructive feedback on code review practices',
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        feedbackId: '550e8400-e29b-41d4-a716-446655440022',
        fromUserId: '550e8400-e29b-41d4-a716-446655440031',
        rating: 4,
      },
    },
  ]

  // Filter by days
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const filteredActivities = activities.filter(
    activity => new Date(activity.timestamp) >= cutoffDate
  )

  // Paginate
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const paginatedItems = filteredActivities.slice(startIndex, endIndex)

  return {
    items: paginatedItems,
    total: filteredActivities.length,
    page,
    per_page: perPage,
  }
}

const generateMockGoalsSummary = () => ({
  statistics: {
    total: 12,
    active: 8,
    completed: 3,
    overdue: 1,
    completionRate: 75.0,
    averageProgress: 65.5,
  },
  recentGoals: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      title: 'Improve API Design Skills',
      status: 'completed',
      progress: 100,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: false,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      title: 'Master TypeScript Advanced Features',
      status: 'in_progress',
      progress: 65,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: false,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      title: 'Learn Docker Containerization',
      status: 'in_progress',
      progress: 40,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: false,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      title: 'Mentor Junior Developers',
      status: 'open',
      progress: 20,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: true,
    },
  ],
  progressTrend: [
    {
      period: '2025-10-01',
      completed: 2,
      created: 3,
    },
    {
      period: '2025-10-08',
      completed: 1,
      created: 2,
    },
    {
      period: '2025-10-15',
      completed: 3,
      created: 1,
    },
    {
      period: '2025-10-22',
      completed: 0,
      created: 4,
    },
  ],
})

const generateMockFeedbackSummary = () => ({
  statistics: {
    totalReceived: 15,
    pendingRequests: 3,
    averageRating: 4.2,
    ratingDistribution: {
      '1': 0,
      '2': 1,
      '3': 2,
      '4': 7,
      '5': 5,
    },
  },
  recentFeedback: [
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440030',
      fromEmployeeName: 'Sarah Johnson',
      goalTitle: 'Improve API Design Skills',
      rating: 5,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440031',
      fromEmployeeName: 'Michael Chen',
      goalTitle: 'Code Review Excellence',
      rating: 4,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440032',
      fromEmployeeName: 'Emma Davis',
      goalTitle: 'Team Collaboration',
      rating: 4,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  ratingTrend: [
    {
      period: '2025-10-01',
      averageRating: 4.0,
      count: 2,
    },
    {
      period: '2025-10-08',
      averageRating: 4.3,
      count: 3,
    },
    {
      period: '2025-10-15',
      averageRating: 4.1,
      count: 4,
    },
    {
      period: '2025-10-22',
      averageRating: 4.4,
      count: 3,
    },
  ],
})

const generateMockSkillsSummary = () => ({
  statistics: {
    totalSkills: 20,
    assessedSkills: 16,
    assessmentProgress: 80.0,
    averageLevel: 3.2,
    skillGaps: 4,
  },
  skillCategories: [
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440050',
      categoryName: 'Technical Skills',
      totalSkills: 8,
      assessedSkills: 7,
      averageLevel: 3.5,
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440051',
      categoryName: 'Leadership',
      totalSkills: 5,
      assessedSkills: 4,
      averageLevel: 2.8,
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440052',
      categoryName: 'Communication',
      totalSkills: 4,
      assessedSkills: 3,
      averageLevel: 3.0,
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440053',
      categoryName: 'Business Skills',
      totalSkills: 3,
      assessedSkills: 2,
      averageLevel: 3.5,
    },
  ],
  recentAssessments: [
    {
      skillId: '550e8400-e29b-41d4-a716-446655440040',
      skillName: 'React',
      level: 4,
      assessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      skillId: '550e8400-e29b-41d4-a716-446655440041',
      skillName: 'Node.js',
      level: 4,
      assessedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      skillId: '550e8400-e29b-41d4-a716-446655440042',
      skillName: 'TypeScript',
      level: 3,
      assessedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      skillId: '550e8400-e29b-41d4-a716-446655440043',
      skillName: 'Team Leadership',
      level: 3,
      assessedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
})

/**
 * Dashboard API Mock Handlers
 * MSW handlers for dashboard endpoints
 */
export const dashboardHandlers = [
  // GET /api/dashboard/summary
  http.get('*/api/dashboard/summary', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    logger.msw(`Dashboard summary requested - period: ${period}`)

    // Validate period parameter
    const validPeriods = ['week', 'month', 'quarter', 'year']
    if (!validPeriods.includes(period)) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
          errors: {
            period: ['Period must be one of: week, month, quarter, year'],
          },
        },
        { status: 400 }
      )
    }

    return HttpResponse.json(generateMockSummary())
  }),

  // GET /api/dashboard/activity
  http.get('*/api/dashboard/activity', ({ request }) => {
    const url = new URL(request.url)
    const days = Math.min(
      Math.max(parseInt(url.searchParams.get('days') || '10'), 1),
      30
    )
    const page = Math.max(parseInt(url.searchParams.get('page') || '1'), 1)
    const perPage = Math.min(
      Math.max(parseInt(url.searchParams.get('per_page') || '20'), 1),
      50
    )

    logger.msw(
      `Dashboard activity requested - days: ${days}, page: ${page}, per_page: ${perPage}`
    )

    return HttpResponse.json(generateMockActivity(days, page, perPage))
  }),

  // GET /api/dashboard/goals-summary
  http.get('*/api/dashboard/goals-summary', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    logger.msw(`Goals summary requested - period: ${period}`)

    // Validate period parameter
    const validPeriods = ['week', 'month', 'quarter', 'year']
    if (!validPeriods.includes(period)) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
          errors: {
            period: ['Period must be one of: week, month, quarter, year'],
          },
        },
        { status: 400 }
      )
    }

    return HttpResponse.json(generateMockGoalsSummary())
  }),

  // GET /api/dashboard/feedback-summary
  http.get('*/api/dashboard/feedback-summary', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    logger.msw(`Feedback summary requested - period: ${period}`)

    // Validate period parameter
    const validPeriods = ['week', 'month', 'quarter', 'year']
    if (!validPeriods.includes(period)) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
          errors: {
            period: ['Period must be one of: week, month, quarter, year'],
          },
        },
        { status: 400 }
      )
    }

    return HttpResponse.json(generateMockFeedbackSummary())
  }),

  // GET /api/dashboard/skills-summary
  http.get('*/api/dashboard/skills-summary', () => {
    logger.msw('Skills summary requested')

    return HttpResponse.json(generateMockSkillsSummary())
  }),
]
