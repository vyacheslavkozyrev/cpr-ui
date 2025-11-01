/**
 * Dashboard Models - Presentation Layer
 * These types represent how dashboard data is used in the UI components
 * Independent of API response structure
 * Phase 4.1 - Dashboard Management System
 */

// Type aliases for activity types and dashboard periods
export type ActivityType =
  | 'goal_created'
  | 'goal_completed'
  | 'goal_updated'
  | 'feedback_received'
  | 'feedback_requested'
  | 'skill_assessed'
  | 'skill_updated'

export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year'

/**
 * Dashboard Summary Model (Client-side)
 * Extends API DTO with computed properties for UI
 */
export interface DashboardSummary {
  goals: {
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number // Converted from completion_rate
  }
  feedback: {
    totalReceived: number // Converted from total_received
    pendingRequests: number // Converted from pending_requests
    averageRating: number // Converted from average_rating
    recentCount: number // Converted from recent_count
  }
  skills: {
    totalSkills: number // Converted from total_skills
    assessedSkills: number // Converted from assessed_skills
    assessmentProgress: number // Converted from assessment_progress
    averageLevel: number // Converted from average_level
  }
  activity: {
    totalActivities: number // Converted from total_activities
    recentActivities: number // Converted from recent_activities
  }
  // Computed properties for UI
  totalMetrics: {
    goalsProgress: number // Goals completion percentage (0-1)
    feedbackEffectiveness: number // Feedback quality score (0-1)
    skillsGrowth: number // Skills development rate (0-1)
    overallScore: number // Overall performance score (0-1)
  }
}

/**
 * Activity Item Model (Client-side)
 * Extends API DTO with computed properties for UI
 */
export interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  metadata?: {
    goalId?: string // Converted from goal_id
    feedbackId?: string // Converted from feedback_id
    skillId?: string // Converted from skill_id
    fromUserId?: string // Converted from from_user_id
    rating?: number
  }
  // Computed properties for UI
  timeAgo: string // Human-readable time (e.g., "2h ago", "3d ago")
  isRecent: boolean // Activity within last 24 hours
  categoryLabel: string // Human-readable activity category
  priorityLevel: 'low' | 'medium' | 'high' // Priority based on activity type
}

/**
 * Activity Feed Model (Client-side)
 * Extends API DTO with computed properties for UI
 */
export interface ActivityFeed {
  items: ActivityItem[]
  total: number
  page: number
  perPage: number // Converted from per_page
  // Computed properties for UI
  hasMore: boolean // Whether there are more items to load
  isEmpty: boolean // Whether feed is empty
  completionStats: {
    completedCount: number // Count of completed activities
    createdCount: number // Count of created activities
    updatedCount: number // Count of updated activities
  }
}

/**
 * Goal Summary Model (Client-side)
 */
export interface GoalSummary {
  id: string
  title: string
  status: 'active' | 'completed' | 'on_hold'
  progress: number
  dueDate?: string // Converted from due_date
  createdDate?: string // Converted from created_date
  category: string
  // Computed properties for UI
  isOverdue?: boolean
  daysUntilDeadline?: number
}

/**
 * Goal Trend Data Model (Client-side)
 */
export interface GoalTrendData {
  period: string
  created: number
  completed: number
}

/**
 * Goals Summary Model (Client-side)
 */
export interface GoalsSummary {
  summary: {
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number // Converted from completion_rate
  }
  recentGoals: GoalSummary[] // Converted from recent_goals
  trendData: GoalTrendData[] // Converted from trend_data
  // Computed properties for UI
  progressTrend: 'up' | 'down' | 'stable'
  completionVelocity: number // Goals completed per week
}

/**
 * Recent Feedback Model (Client-side)
 */
export interface RecentFeedback {
  id: string
  fromUser: {
    // Converted from from_user
    id: string
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  createdAt: string // Converted from created_at
  // Computed properties for UI
  timeAgo: string
  isPositive: boolean
}

/**
 * Feedback Trend Data Model (Client-side)
 */
export interface FeedbackTrendData {
  period: string
  averageRating: number // Converted from average_rating
  count: number
}

/**
 * Feedback Summary Model (Client-side)
 */
export interface FeedbackSummary {
  summary: {
    totalReceived: number // Converted from total_received
    pendingRequests: number // Converted from pending_requests
    averageRating: number // Converted from average_rating
    responseRate: number // Converted from response_rate
  }
  recentFeedback: RecentFeedback[] // Converted from recent_feedback
  ratingTrend: FeedbackTrendData[] // Converted from rating_trend
  // Computed properties for UI
  overallTrend: 'up' | 'down' | 'stable'
  qualityScore: number // Overall feedback quality (0-1)
}

/**
 * Skill Category Model (Client-side)
 */
export interface SkillCategory {
  id: string
  name: string
  skillCount: number // Converted from skill_count
  averageLevel: number // Converted from average_level
  color: string
  // Computed properties for UI
  proficiencyLabel: string
  growthRate: number
}

/**
 * Recent Assessment Model (Client-side)
 */
export interface RecentAssessment {
  id: string
  skillName: string // Converted from skill_name
  level: number
  assessedAt: string // Converted from assessed_at
  assessorName: string // Converted from assessor_name
  // Computed properties for UI
  timeAgo: string
  levelLabel: string
}

/**
 * Skills Summary Model (Client-side)
 */
export interface SkillsSummary {
  summary: {
    totalSkills: number // Converted from total_skills
    assessedSkills: number // Converted from assessed_skills
    averageLevel: number // Converted from average_level
    assessmentProgress: number // Converted from assessment_progress
  }
  categories: SkillCategory[]
  recentAssessments: RecentAssessment[] // Converted from recent_assessments
  // Computed properties for UI
  skillGrowthRate: number // Skills growth rate (0-1)
  topSkillCategories: string[] // Top 3 skill categories by level
  improvementAreas: string[] // Skills needing improvement
}

/**
 * Widget Configuration Model (Client-side)
 */
export interface WidgetConfig {
  id: string
  name: string
  visible: boolean
  order: number
  // Computed properties for UI
  isCustomizable: boolean // Whether widget can be hidden/shown
  hasSettings: boolean // Whether widget has configuration options
}

/**
 * Dashboard Statistics Model (Client-side)
 * Statistical data about dashboard for UI display
 */
export interface DashboardStatistics {
  totalWidgets: number // Total available widgets
  visibleWidgets: number // Currently visible widgets
  lastUpdated: string // ISO timestamp of last data update
  // Additional computed statistics for UI
  dataFreshness: 'fresh' | 'stale' | 'expired' // Data freshness indicator
  updateFrequency: number // Update frequency in minutes
}

// Query Parameters
export interface DashboardSummaryParams {
  period?: DashboardPeriod
}

export interface ActivityFeedParams {
  days?: number
  page?: number
  perPage?: number // Converted from per_page
}

export interface GoalsSummaryParams {
  period?: DashboardPeriod
}

export interface FeedbackSummaryParams {
  period?: DashboardPeriod
}
