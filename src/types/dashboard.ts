/**
 * Dashboard API Types
 * TypeScript interfaces for dashboard data structures
 */

// Dashboard Summary Response
export interface IDashboardSummary {
  goals: {
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number
  }
  feedback: {
    totalReceived: number
    pendingRequests: number
    averageRating: number
    recentCount: number
  }
  skills: {
    totalSkills: number
    assessedSkills: number
    assessmentProgress: number
    averageLevel: number
  }
  activity: {
    totalActivities: number
    recentActivities: number
  }
}

// Activity Feed Types
export type ActivityType =
  | 'goal_created'
  | 'goal_completed'
  | 'goal_updated'
  | 'feedback_received'
  | 'feedback_requested'
  | 'skill_assessed'
  | 'skill_updated'

export interface IActivityItem {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  metadata?: {
    goalId?: string
    feedbackId?: string
    skillId?: string
    fromUserId?: string
    rating?: number
  }
}

export interface IActivityFeed {
  items: IActivityItem[]
  total: number
  page: number
  per_page: number
}

// Goals Summary Types
export interface IGoalSummary {
  id: string
  title: string
  status: 'open' | 'in_progress' | 'completed'
  progress: number
  deadline?: string
  isOverdue: boolean
  createdAt: string
}

export interface IGoalTrendData {
  period: string
  completed: number
  created: number
}

export interface IGoalsSummary {
  statistics: {
    total: number
    active: number
    completed: number
    overdue: number
    completionRate: number
    averageProgress: number
  }
  recentGoals: IGoalSummary[]
  progressTrend: IGoalTrendData[]
}

// Feedback Summary Types
export interface IRecentFeedback {
  id: string
  fromEmployeeId: string
  fromEmployeeName: string
  goalTitle: string
  rating: number
  createdAt: string
}

export interface IFeedbackTrendData {
  period: string
  averageRating: number
  count: number
}

export interface IFeedbackSummary {
  statistics: {
    totalReceived: number
    pendingRequests: number
    averageRating: number
    ratingDistribution: Record<string, number>
  }
  recentFeedback: IRecentFeedback[]
  ratingTrend: IFeedbackTrendData[]
}

// Skills Summary Types
export interface ISkillCategory {
  categoryId: string
  categoryName: string
  totalSkills: number
  assessedSkills: number
  averageLevel: number
}

export interface IRecentAssessment {
  skillId: string
  skillName: string
  level: number
  assessedAt: string
}

export interface ISkillsSummary {
  statistics: {
    totalSkills: number
    assessedSkills: number
    assessmentProgress: number
    averageLevel: number
    skillGaps: number
  }
  skillCategories: ISkillCategory[]
  recentAssessments: IRecentAssessment[]
}

// Query Parameters
export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year'

export interface IDashboardSummaryParams {
  period?: DashboardPeriod
}

export interface IActivityFeedParams {
  days?: number
  page?: number
  per_page?: number
}

export interface IGoalsSummaryParams {
  period?: DashboardPeriod
}

export interface IFeedbackSummaryParams {
  period?: DashboardPeriod
}
