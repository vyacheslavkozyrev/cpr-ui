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
    completion_rate: 75.0,
  },
  feedback: {
    total_received: 15,
    pending_requests: 3,
    average_rating: 4.2,
    recent_count: 5,
  },
  skills: {
    total_skills: 20,
    assessed_skills: 16,
    assessment_progress: 80.0,
    average_level: 3.2,
  },
  activity: {
    total_activities: 25,
    recent_activities: 8,
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
    total: 9,
    active: 5,
    completed: 3,
    overdue: 1,
    completionRate: 0.75, // API uses camelCase and decimal instead of percentage
    averageProgress: 0.65, // Required field
  },
  recentGoals: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      title: 'Improve API Design Skills',
      status: 'completed',
      progress: 1.0, // API uses 0-1 range
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // API uses 'deadline'
      isOverdue: false, // Required field
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      title: 'Learn Advanced React Patterns',
      status: 'active',
      progress: 0.65, // API uses 0-1 range
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: false,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      title: 'Learn Docker Containerization',
      status: 'active',
      progress: 0.4,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: false,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      title: 'Mentor Junior Developers',
      status: 'on_hold',
      progress: 0.2,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isOverdue: true, // This is overdue since deadline is in the past
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
    totalReceived: 15, // API uses camelCase
    pendingRequests: 3,
    averageRating: 4.2,
  },
  recentFeedback: [
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440030', // API uses camelCase field names
      fromEmployeeName: 'Sarah Johnson',
      goalTitle: 'Great collaboration on the API design project!',
      rating: 5,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // API uses camelCase
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440031',
      fromEmployeeName: 'Michael Chen',
      goalTitle: 'Excellent code review skills, very thorough!',
      rating: 4,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      fromEmployeeId: '550e8400-e29b-41d4-a716-446655440032',
      fromEmployeeName: 'Emma Davis',
      goalTitle: 'Strong team collaboration and communication.',
      rating: 4,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  ratingTrend: [
    {
      period: '2025-10-01',
      averageRating: 4.0, // API uses camelCase
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
    // Real API uses 'statistics' instead of 'summary'
    totalSkills: 22, // Real API uses camelCase
    assessedSkills: 16,
    assessmentProgress: 80.0,
    averageLevel: 3.2,
    skillGaps: 6, // Additional field in real API
  },
  skillCategories: [
    // Real API uses 'skillCategories' instead of 'categories'
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440050', // Real API uses categoryId
      categoryName: 'Technical Skills', // Real API uses categoryName
      totalSkills: 8, // Real API uses totalSkills
      assessedSkills: 6, // Real API uses assessedSkills
      averageLevel: 3.5, // Real API uses camelCase
      color: '#3B82F6',
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440051',
      categoryName: 'Leadership',
      totalSkills: 5,
      assessedSkills: 3,
      averageLevel: 2.2,
      color: '#10B981',
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440052',
      categoryName: 'Communication',
      totalSkills: 4,
      assessedSkills: 3,
      averageLevel: 2.0,
      color: '#F59E0B',
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440053',
      categoryName: 'Business Skills',
      totalSkills: 3,
      assessedSkills: 2,
      averageLevel: 2.3,
      color: '#EF4444',
    },
    {
      categoryId: '550e8400-e29b-41d4-a716-446655440054',
      categoryName: 'Project Management',
      totalSkills: 2,
      assessedSkills: 1,
      averageLevel: 2.1,
      color: '#8B5CF6',
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
