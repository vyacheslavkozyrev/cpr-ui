/**
 * Taxonomy Types — Skills Taxonomy & Career Framework Feature (0008)
 * Field names match wire format (snake_case) from the API.
 */

// --- Read response shapes (matching API wire format) ---

export interface ICareerPathSummary {
  id: string
  title: string
  description: string | null
}

export interface ICareerPathDetail {
  id: string
  title: string
  description: string | null
  tracks: ICareerTrackInPath[]
}

export interface ICareerTrackInPath {
  id: string
  title: string
  description: string | null
}

export interface ICareerTrackSummary {
  id: string
  title: string
  description: string | null
  career_path_id: string
  career_path_title: string
}

export interface ICareerTrackDetail {
  id: string
  title: string
  description: string | null
  career_path_id: string
  career_path_title: string
  positions: IPositionInTrack[]
}

export interface IPositionInTrack {
  id: string
  title: string
  description: string | null
  expectations: string | null
  sort_order: number
}

export interface IPositionSummary {
  id: string
  title: string
  description: string | null
  expectations: string | null
  sort_order: number
  career_track_id: string
  career_track_title: string
}

export interface IPositionDetail {
  id: string
  title: string
  description: string | null
  expectations: string | null
  career_track_id: string
  career_track_title: string
  career_path_id: string
  career_path_title: string
  sort_order: number
  skills: IPositionSkillRequirement[]
}

export interface IPositionSkillRequirement {
  id: string
  skill_id: string
  skill_title: string
  category_id: string
  category_title: string
  skill_level_id: string
  skill_level_title: string
  skill_level_value: number
  is_mandatory: boolean
  weight: number | null
  rationale: string | null
}

export interface ISkillCategory {
  id: string
  title: string
  description: string | null
}

export interface ISkillSummary {
  id: string
  title: string
  description: string | null
  category_id: string
  category_title: string
}

export interface ISkillDetail {
  id: string
  title: string
  description: string | null
  category_id: string
  category_title: string
  levels: ISkillLevelSummary[]
}

export interface ISkillLevelSummary {
  id: string
  title: string
  description: string | null
  value: number
}

// --- Pagination envelope ---

export interface IPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
  }
}

// --- Admin request interfaces (snake_case) ---

export interface ICreateCareerPathDto {
  title: string
  description?: string | null
}

export interface IUpdateCareerPathDto {
  title?: string
  description?: string | null
}

export interface ICreateCareerTrackDto {
  title: string
  description?: string | null
  career_path_id: string
}

export interface IUpdateCareerTrackDto {
  title?: string
  description?: string | null
  career_path_id?: string
}

export interface ICreatePositionDto {
  title: string
  description?: string | null
  expectations?: string | null
  sort_order?: number
  career_track_id: string
}

export interface IUpdatePositionDto {
  title?: string
  description?: string | null
  expectations?: string | null
  sort_order?: number
  career_track_id?: string
}

export interface ICreateSkillCategoryDto {
  title: string
  description?: string | null
}

export interface IUpdateSkillCategoryDto {
  title?: string
  description?: string | null
}

export interface ICreateSkillDto {
  title: string
  description?: string | null
  category_id: string
  levels?: IAddSkillLevelDto[]
}

export interface IUpdateSkillDto {
  title?: string
  description?: string | null
  category_id?: string
}

export interface IAddSkillLevelDto {
  title: string
  description?: string | null
  value: number
}

export interface IUpdateSkillLevelDto {
  title?: string
  description?: string | null
  value?: number
}

export interface IAddPositionSkillDto {
  skill_id: string
  skill_level_id: string
  is_mandatory: boolean
  weight?: number | null
  rationale?: string | null
}

export interface IUpdatePositionSkillDto {
  skill_level_id?: string
  is_mandatory?: boolean
  weight?: number | null
  rationale?: string | null
}
