/**
 * Dashboard Data Transformations
 * Converts between DTOs (API format) and Models (Client format)
 * Phase 4.1 - Dashboard Management System
 */

import type {
  IActivityFeedDto,
  IActivityItemDto,
  IDashboardSummaryDto,
  IFeedbackSummaryDto,
  IGoalsSummaryDto,
  IProgressTrendDto,
  IRatingTrendDto,
  IRecentAssessmentDto,
  IRecentFeedbackDto,
  IRecentGoalDto,
  ISkillCategoryDto,
  ISkillsSummaryDto,
} from '../../dtos/DashboardDto'

import type {
  ActivityFeed,
  ActivityItem,
  ActivityType,
  DashboardSummary,
  FeedbackSummary,
  GoalsSummary,
  GoalSummary,
  RecentAssessment,
  RecentFeedback,
  SkillCategory,
  SkillsSummary,
} from '../../models/Dashboard'

/**
 * Transform Dashboard Summary DTO to Model
 */
export const transformDashboardSummary = (
  dto: IDashboardSummaryDto
): DashboardSummary => {
  // Provide safe defaults for missing data
  const goals = dto.goals || {}
  const feedback = dto.feedback || {}
  const skills = dto.skills || {}
  const activity = dto.activity || {}

  return {
    goals: {
      total: goals.total || 0,
      active: goals.active || 0,
      completed: goals.completed || 0,
      overdue: goals.overdue || 0,
      completionRate: goals.completionRate || 0, // API now uses camelCase
    },
    feedback: {
      totalReceived: feedback.totalReceived || 0, // API now uses camelCase
      pendingRequests: feedback.pendingRequests || 0, // Default to 0 if not provided
      averageRating: feedback.averageRating || 0,
      recentCount: feedback.recentCount || 0,
    },
    skills: {
      totalSkills: skills.totalSkills || 0, // API now uses camelCase
      assessedSkills: skills.assessedSkills || 0,
      assessmentProgress: skills.assessmentProgress || 0,
      averageLevel: skills.averageLevel || 0,
    },
    activity: {
      totalActivities: activity.totalActivities || 0, // API now uses camelCase
      recentActivities: activity.recentActivities || 0,
    },
    // Computed UI properties
    totalMetrics: {
      goalsProgress: (goals.completionRate || 0) / 100, // Convert percentage to ratio
      feedbackEffectiveness: Math.min((feedback.averageRating || 0) / 5, 1), // Normalize to 0-1
      skillsGrowth: (skills.assessmentProgress || 0) / 100, // Convert percentage to ratio
      overallScore:
        ((goals.completionRate || 0) / 100 +
          Math.min((feedback.averageRating || 0) / 5, 1) +
          (skills.assessmentProgress || 0) / 100) /
        3, // Average of all metrics
    },
  }
}

/**
 * Transform Activity Item DTO to Model
 */
export const transformActivityItem = (dto: IActivityItemDto): ActivityItem => {
  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getCategoryLabel = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getPriorityLevel = (type: string): 'low' | 'medium' | 'high' => {
    if (type.includes('completed')) return 'high'
    if (type.includes('created') || type.includes('received')) return 'medium'
    return 'low'
  }

  return {
    id: dto.id,
    type: (dto.type || 'general') as ActivityType,
    title: dto.title || '',
    description: dto.description || '',
    timestamp: dto.timestamp,
    metadata: {
      ...(dto.metadata.goalId && { goalId: dto.metadata.goalId }), // API now uses camelCase
      ...(dto.metadata.feedbackId && { feedbackId: dto.metadata.feedbackId }),
      ...(dto.metadata.skillId && { skillId: dto.metadata.skillId }),
      ...(dto.metadata.fromUserId && { fromUserId: dto.metadata.fromUserId }),
      ...(dto.metadata.rating && { rating: dto.metadata.rating }),
    },
    // Computed UI properties
    timeAgo: formatTimeAgo(dto.timestamp),
    isRecent:
      new Date().getTime() - new Date(dto.timestamp).getTime() <
      24 * 60 * 60 * 1000,
    categoryLabel: getCategoryLabel(dto.type || ''),
    priorityLevel: getPriorityLevel(dto.type || ''),
  }
}

/**
 * Transform Activity Feed DTO to Model
 */
export const transformActivityFeed = (dto: IActivityFeedDto): ActivityFeed => {
  const items = (dto.items || []).map(transformActivityItem)

  return {
    items,
    total: dto.total,
    page: dto.page,
    perPage: dto.perPage, // API now uses camelCase
    // Computed UI properties
    hasMore: dto.total > dto.page * dto.perPage,
    isEmpty: items.length === 0,
    completionStats: {
      completedCount: items.filter((item: ActivityItem) =>
        item.type.includes('completed')
      ).length,
      createdCount: items.filter((item: ActivityItem) =>
        item.type.includes('created')
      ).length,
      updatedCount: items.filter((item: ActivityItem) =>
        item.type.includes('updated')
      ).length,
    },
  }
}

/**
 * Transform Recent Goal DTO to Model
 */
export const transformRecentGoal = (dto: IRecentGoalDto): GoalSummary => {
  return {
    id: dto.id,
    title: dto.title,
    status: dto.status as 'active' | 'completed' | 'on_hold',
    progress: dto.progress,
    ...(dto.deadline && { dueDate: dto.deadline }), // Handle nullable deadline
    category: 'General', // Default category since API doesn't provide this
    isOverdue: dto.isOverdue,
  }
}

/**
 * Transform Goals Summary DTO to Model
 */
export const transformGoalsSummary = (dto: IGoalsSummaryDto): GoalsSummary => {
  // Provide safe defaults for missing data
  const recentGoals = (dto.recentGoals || []).map(transformRecentGoal) // API uses camelCase
  const trendData = dto.progressTrend || []
  const statistics = dto.statistics || {}

  // Calculate trend direction
  const calculateTrend = (
    trendData: typeof dto.progressTrend
  ): 'up' | 'down' | 'stable' => {
    if (!trendData || trendData.length < 2) return 'stable'
    const recent = trendData[trendData.length - 1]
    const previous = trendData[trendData.length - 2]
    const recentRate = recent.completed / recent.created || 0
    const previousRate = previous.completed / previous.created || 0

    if (recentRate > previousRate * 1.1) return 'up'
    if (recentRate < previousRate * 0.9) return 'down'
    return 'stable'
  }

  return {
    summary: {
      total: statistics.total || 0,
      active: statistics.active || 0,
      completed: statistics.completed || 0,
      overdue: statistics.overdue || 0,
      completionRate: statistics.completionRate || 0, // API now uses camelCase
    },
    recentGoals,
    trendData: trendData.map((trend: IProgressTrendDto) => ({
      // API uses IProgressTrendDto
      period: trend.period,
      created: trend.created,
      completed: trend.completed,
    })),
    // Computed UI properties
    progressTrend: calculateTrend(trendData),
    completionVelocity:
      trendData.length > 0 ? trendData[trendData.length - 1].completed : 0,
  }
}

/**
 * Transform Recent Feedback DTO to Model
 */
export const transformRecentFeedback = (
  dto: IRecentFeedbackDto
): RecentFeedback => {
  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return {
    id: dto.id,
    fromUser: {
      id: dto.fromEmployeeId,
      name: dto.fromEmployeeName,
    }, // Transform to user object
    rating: dto.rating || 0, // Handle nullable rating
    comment: dto.goalTitle || '', // Use goalTitle as comment since API doesn't have comment field
    createdAt: dto.createdAt, // API uses camelCase
    // Computed UI properties
    timeAgo: formatTimeAgo(dto.createdAt),
    isPositive: (dto.rating || 0) >= 4,
  }
}

/**
 * Transform Feedback Summary DTO to Model
 */
export const transformFeedbackSummary = (
  dto: IFeedbackSummaryDto
): FeedbackSummary => {
  // Calculate overall trend
  const calculateTrend = (
    trendData: typeof dto.ratingTrend
  ): 'up' | 'down' | 'stable' => {
    if (!trendData || trendData.length < 2) return 'stable'
    const recent = trendData[trendData.length - 1]
    const previous = trendData[trendData.length - 2]

    if (recent.averageRating > previous.averageRating * 1.1) return 'up'
    if (recent.averageRating < previous.averageRating * 0.9) return 'down'
    return 'stable'
  }

  // Provide safe defaults for missing data
  const statistics = dto.statistics || {}
  const recentFeedback = dto.recentFeedback || []
  const ratingTrend = dto.ratingTrend || []

  return {
    summary: {
      totalReceived: statistics.totalReceived || 0, // API now uses camelCase
      pendingRequests: statistics.pendingRequests || 0, // Default to 0 if not provided
      averageRating: statistics.averageRating || 0,
      responseRate: 100, // Default response rate since API doesn't provide this
    },
    recentFeedback: recentFeedback.map(transformRecentFeedback),
    ratingTrend: ratingTrend.map((trend: IRatingTrendDto) => ({
      period: trend.period,
      averageRating: trend.averageRating, // API uses camelCase
      count: trend.count,
    })),
    // Computed UI properties
    overallTrend: calculateTrend(ratingTrend),
    qualityScore: Math.min((statistics.averageRating || 0) / 5, 1), // Normalize to 0-1
  }
}

/**
 * Transform Skill Category DTO to Model
 */
export const transformSkillCategory = (
  dto: ISkillCategoryDto
): SkillCategory => {
  const getProficiencyLabel = (level: number): string => {
    if (level >= 4) return 'Expert'
    if (level >= 3) return 'Proficient'
    if (level >= 2) return 'Intermediate'
    return 'Beginner'
  }

  return {
    id: dto.categoryId, // Real API uses categoryId, not id
    name: dto.categoryName, // Real API uses categoryName, not name
    skillCount: dto.totalSkills, // Real API uses totalSkills, not skill_count
    averageLevel: dto.averageLevel, // Real API already uses camelCase
    color: dto.color || '#3B82F6', // Provide default color if not provided
    // Computed UI properties
    proficiencyLabel: getProficiencyLabel(dto.averageLevel),
    growthRate: Math.random() * 0.3, // TODO: Calculate from real data when available
  }
}

/**
 * Transform Recent Assessment DTO to Model
 */
export const transformRecentAssessment = (
  dto: IRecentAssessmentDto
): RecentAssessment => {
  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getLevelLabel = (level: number): string => {
    if (level >= 4) return 'Expert'
    if (level >= 3) return 'Proficient'
    if (level >= 2) return 'Intermediate'
    return 'Beginner'
  }

  return {
    id: dto.skillId, // Real API uses skillId, not id
    skillName: dto.skillName, // Real API already uses camelCase
    level: dto.level,
    assessedAt: dto.assessedAt, // Real API already uses camelCase
    assessorName: dto.assessorName || 'Unknown', // Real API may not provide this
    // Computed UI properties
    timeAgo: formatTimeAgo(dto.assessedAt),
    levelLabel: getLevelLabel(dto.level),
  }
}

/**
 * Transform Skills Summary DTO to Model
 */
export const transformSkillsSummary = (
  dto: ISkillsSummaryDto
): SkillsSummary => {
  // Provide safe defaults for missing data - Updated for real API structure
  const categories = (dto.skillCategories || []).map(transformSkillCategory) // Real API uses 'skillCategories'
  const recentAssessments = (dto.recentAssessments || []).map(
    transformRecentAssessment
  ) // Real API uses 'recentAssessments'
  const statistics = dto.statistics || {} // Real API uses 'statistics' instead of 'summary'

  return {
    summary: {
      totalSkills: statistics.totalSkills || 0, // Real API uses camelCase, not snake_case
      assessedSkills: statistics.assessedSkills || 0,
      averageLevel: statistics.averageLevel || 0,
      assessmentProgress: statistics.assessmentProgress || 0,
    },
    categories,
    recentAssessments,
    // Computed UI properties
    skillGrowthRate: (statistics.assessmentProgress || 0) / 100, // Convert percentage to ratio
    topSkillCategories: categories
      .sort(
        (a: SkillCategory, b: SkillCategory) => b.averageLevel - a.averageLevel
      )
      .slice(0, 3)
      .map((cat: SkillCategory) => cat.name),
    improvementAreas: categories
      .filter((cat: SkillCategory) => cat.averageLevel < 2.5)
      .map((cat: SkillCategory) => cat.name),
  }
}
