/**
 * Dashboard DTOs - API Layer
 * Data Transfer Objects for dashboard API responses
 * These represent the exact structure received from the API
 * Phase 4.1 - Dashboard Management System
 */

/**
 * Dashboard Summary DTO (API Response)
 * Complete overview of all dashboard statistics
 * Updated to match exact API schema from Swagger
 */
export interface IDashboardSummaryDto {
  goals: {
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number // API uses camelCase
  }
  feedback: {
    totalReceived: number // API uses camelCase
    pendingRequests?: number // Optional - not all APIs provide this
    averageRating: number // API uses camelCase
    recentCount: number // API uses camelCase
  }
  skills: {
    totalSkills: number // API uses camelCase
    assessedSkills: number // API uses camelCase
    assessmentProgress: number // API uses camelCase
    averageLevel: number // API uses camelCase
  }
  activity: {
    totalActivities: number // API uses camelCase
    recentActivities: number // API uses camelCase
  }
}

/**
 * Activity Item DTO (API Response)
 * Individual activity record from API - Updated to match Swagger schema
 */
export interface IActivityItemDto {
  id: string
  type: string | null
  title: string | null
  description: string | null
  timestamp: string // API returns date-time format
  metadata: IActivityMetadataDto // API has required metadata object
}

/**
 * Activity Metadata DTO (API Response)
 * Metadata for activity items - Based on Swagger schema
 */
export interface IActivityMetadataDto {
  goalId?: string | null // API uses camelCase with UUID format
  feedbackId?: string | null
  skillId?: string | null
  fromUserId?: string | null
  rating?: number | null
}

/**
 * Activity Feed DTO (API Response)
 * Paginated collection of activity items - Updated to match Swagger schema
 */
export interface IActivityFeedDto {
  items: IActivityItemDto[] | null
  total: number
  page: number
  perPage: number // API uses camelCase
}

/**
 * Goal Summary DTO (API Response)
 * Individual goal information for dashboard
 */

/**
 * Goal Trend Data DTO (API Response)
 * Trend data point for goals over time
 */
export interface IGoalTrendDataDto {
  period: string
  created: number
  completed: number
}

/**
 * Goals Summary DTO (API Response)
 * Complete goals analytics for dashboard - Updated to match Swagger schema
 */
export interface IGoalsSummaryDto {
  statistics: {
    // API uses 'statistics', not 'summary'
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number // API uses camelCase
    averageProgress: number // Additional field from API
  }
  recentGoals: IRecentGoalDto[] // API uses 'recentGoals' and different DTO
  progressTrend: IProgressTrendDto[] // API uses 'progressTrend' and different DTO
} /**
 * Recent Goal DTO (API Response)
 * Individual goal item for dashboard - Based on Swagger schema
 */
export interface IRecentGoalDto {
  id: string
  title: string
  status: string
  progress: number
  deadline: string | null
  isOverdue: boolean
}

/**
 * Progress Trend DTO (API Response)
 * Progress trend data point - Based on Swagger schema
 */
export interface IProgressTrendDto {
  period: string
  completed: number
  created: number
}

/**
 * Recent Feedback DTO (API Response)
 * Individual feedback item for dashboard - Updated to match Swagger schema
 */
export interface IRecentFeedbackDto {
  id: string
  fromEmployeeId: string // API uses camelCase field names
  fromEmployeeName: string
  goalTitle: string | null
  rating: number | null
  createdAt: string // API uses camelCase
}

/**
 * Rating Trend DTO (API Response)
 * Rating trend data point - Based on Swagger schema
 */
export interface IRatingTrendDto {
  period: string
  averageRating: number // API uses camelCase
  count: number // API uses 'count', not 'feedback_count'
}

/**
 * Goal Trend Data DTO (API Response) - Legacy, keeping for backward compatibility
 * Trend data point for goals over time
 */
export interface IGoalTrendDataDto {
  period: string
  completed: number
  created: number
}

/**
 * Feedback Summary DTO (API Response)
 * Complete feedback analytics for dashboard - Updated to match Swagger schema
 */
export interface IFeedbackSummaryDto {
  statistics: {
    // API uses 'statistics', not 'summary'
    totalReceived: number // API uses camelCase
    pendingRequests?: number // Optional - not all APIs provide this
    averageRating: number // API uses camelCase
    ratingDistribution?: { [key: string]: number } | null // Additional field from API
  }
  recentFeedback: IRecentFeedbackDto[] // API uses camelCase
  ratingTrend: IRatingTrendDto[] // API uses different DTO name
}

/**
 * Skill Category DTO (API Response)
 * Skill category information for dashboard - Updated to match real API
 */
export interface ISkillCategoryDto {
  categoryId: string // Real API uses categoryId, not id
  categoryName: string // Real API uses categoryName, not name
  totalSkills: number // Real API uses totalSkills, not skill_count
  assessedSkills: number // Real API uses assessedSkills
  averageLevel: number // Real API uses averageLevel, not average_level
  color?: string // Optional as real API may not provide this
}

/**
 * Recent Assessment DTO (API Response)
 * Individual skill assessment for dashboard
 */
export interface IRecentAssessmentDto {
  skillId: string // Real API uses skillId, not id
  skillName: string // Real API uses skillName, not skill_name
  level: number
  assessedAt: string // Real API uses assessedAt, not assessed_at
  assessorName?: string // Real API doesn't always provide this, making it optional
  category?: string // Category name for display
  categoryId?: string // Category ID for reference
}

/**
 * Skills Summary DTO (API Response)
 * Complete skills analytics for dashboard - Updated to match real API
 */
export interface ISkillsSummaryDto {
  statistics: {
    // Real API uses 'statistics', not 'summary'
    totalSkills: number // Real API uses camelCase, not snake_case
    assessedSkills: number
    averageLevel: number
    assessmentProgress: number
    skillGaps?: number // Additional field in real API
  }
  skillCategories: ISkillCategoryDto[] // Real API uses 'skillCategories', not 'categories'
  recentAssessments: IRecentAssessmentDto[] // Real API uses 'recentAssessments', not 'recent_assessments'
}
