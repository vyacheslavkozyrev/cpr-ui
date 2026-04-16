/**
 * Team Member DTOs - API Response Layer
 * Types matching GET /api/me/team response structure (Feature 0010a)
 */

export interface ITeamMemberDto {
  id: string
  full_name: string
  job_title: string
  position_id: string
  position_name: string
}

export interface ITeamListResponseDto {
  data: ITeamMemberDto[]
}

export interface IManagerViewFeedbackDto {
  id: string
  rating: number
  comment: string
  submitted_by_id: string
  submitted_by_name: string
  created_at: string
}

export interface IFeedbackListResponseDto {
  data: IManagerViewFeedbackDto[]
}

export interface ISuggestGoalDto {
  name: string
  description?: string
  skill_category_id?: string
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  due_date?: string
}
