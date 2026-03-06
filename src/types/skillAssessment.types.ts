/**
 * Skill Assessment Types — Skills Self-Assessment Feature (0007)
 * Field names match wire format (snake_case) from the API.
 */

export interface ISkillLevelBrief {
  id: string
  title: string
  value: number
}

export interface IPositionBrief {
  id: string
  title: string
  career_track?: ICareerTrackBrief
  career_path?: ICareerPathBrief
}

export interface ICareerTrackBrief {
  id: string
  title: string
}

export interface ICareerPathBrief {
  id: string
  title: string
}

export interface INextPosition {
  id: string
  title: string
}

export interface IEvidenceItem {
  id: string
  feedback_id: string
  sender_display_name: string
  rating: number | null
  content_excerpt: string
}

export interface IAssessedLevel {
  id: string
  skill_id: string
  skill_level_id: string
  skill_level_title: string
  skill_level_value: number
  notes: string | null
}

export interface ITargetLevel {
  id: string
  skill_id: string
  skill_level_id: string
  skill_level_title: string
  skill_level_value: number
}

export interface ISkillItem {
  skill_id: string
  skill_title: string
  skill_description: string | null
  required_level: ISkillLevelBrief
  next_position_required_level: ISkillLevelBrief | null
  assessed: IAssessedLevel | null
  target: ITargetLevel | null
  evidence: IEvidenceItem[]
}

export interface ISkillCategoryGroup {
  id: string
  title: string
  skills: ISkillItem[]
}

export interface ISkillAssessmentResponse {
  position: IPositionBrief | null
  next_position: INextPosition | null
  skill_categories: ISkillCategoryGroup[]
}

export interface IEmployeeBrief {
  id: string
  display_name: string
}

export interface IEmployeeSkillAssessmentResponse
  extends ISkillAssessmentResponse {
  employee: IEmployeeBrief
}

export interface ITeamMemberSummary {
  employee_id: string
  display_name: string
  position_title: string | null
  total_required_skills: number
  assessed_skill_count: number
  skills_meeting_requirement_count: number
}

export interface ITeamSkillSummaryResponse {
  team: ITeamMemberSummary[]
}

// Request interfaces

export interface IUpsertSkillAssessmentRequest {
  skill_level_id: string
  notes?: string | null
}

export interface IUpsertSkillTargetRequest {
  skill_level_id: string
}

export interface ILinkEvidenceRequest {
  feedback_id: string
}
