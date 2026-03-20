/**
 * GapAnalysis DTOs — API Response Layer
 * Mirror the api.md wire format exactly (snake_case fields).
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

/** Career track summary nested in the current position. */
export interface TGapCareerTrackDto {
  id: string
  title: string
}

/** Current position summary returned by the gap analysis endpoint. */
export interface TGapCurrentPositionDto {
  id: string
  title: string
  sort_order: number
  career_track: TGapCareerTrackDto
}

/** Next-level position summary. Null when the employee is already at the highest level. */
export interface TGapNextPositionDto {
  id: string
  title: string
  sort_order: number
}

/** Skill category nested in a skill gap entry. */
export interface TGapSkillCategoryDto {
  id: string
  title: string
}

/** Skill nested in a skill gap entry. */
export interface TGapSkillDto {
  id: string
  title: string
  category: TGapSkillCategoryDto
}

/** Skill level nested in a skill gap entry. */
export interface TGapSkillLevelDto {
  id: string
  title: string
  value: number
}

/** A non-completed goal that targets the same skill. */
export interface TLinkedGoalDto {
  id: string
  title: string
  progress_percentage: number
  status: string
}

/** A single skill gap entry comparing required vs actual level. */
export interface TSkillGapDto {
  skill: TGapSkillDto
  required_level: TGapSkillLevelDto
  actual_level: TGapSkillLevelDto
  /** Integer: required_level.value − actual_level.value. ≤ 0 means the requirement is met. */
  gap: number
  is_mandatory: boolean
  /** "manager" when manager_assessment_value IS NOT NULL; "default" otherwise. */
  assessment_source: 'manager' | 'default'
  linked_goals: TLinkedGoalDto[]
}

/** Aggregate counts for the gap analysis result. */
export interface TGapSummaryDto {
  total_skills: number
  skills_met: number
  skills_with_gap: number
  mandatory_gaps: number
}

/**
 * Full gap analysis response returned by GET /api/me/gap-analysis
 * and GET /api/employees/{id}/gap-analysis.
 */
export interface TGapAnalysisDto {
  current_position: TGapCurrentPositionDto
  /** Null when the employee is already at the highest sort_order in their career track. */
  next_position: TGapNextPositionDto | null
  skill_gaps: TSkillGapDto[]
  summary: TGapSummaryDto
}
