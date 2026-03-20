/**
 * Gap Analysis Mappers
 * Transform API DTOs to domain models for the presentation layer.
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import type {
  TGapAnalysisDto,
  TSkillGapDto,
  TLinkedGoalDto,
} from '../dtos/GapAnalysisDto'
import type {
  IGapAnalysis,
  ISkillGap,
  ILinkedGoal,
} from '../models/GapAnalysis'

/** Map a linked goal DTO to domain model. */
export const mapLinkedGoal = (dto: TLinkedGoalDto): ILinkedGoal => ({
  id: dto.id,
  title: dto.title,
  progressPercentage: dto.progress_percentage,
  status: dto.status,
})

/** Map a single skill gap DTO to domain model. */
export const mapSkillGap = (dto: TSkillGapDto): ISkillGap => ({
  skill: {
    id: dto.skill.id,
    title: dto.skill.title,
    category: {
      id: dto.skill.category.id,
      title: dto.skill.category.title,
    },
  },
  requiredLevel: {
    id: dto.required_level.id,
    title: dto.required_level.title,
    value: dto.required_level.value,
  },
  actualLevel: {
    id: dto.actual_level.id,
    title: dto.actual_level.title,
    value: dto.actual_level.value,
  },
  gap: dto.gap,
  isMandatory: dto.is_mandatory,
  assessmentSource: dto.assessment_source,
  linkedGoals: dto.linked_goals.map(mapLinkedGoal),
})

/** Map a full gap analysis response DTO to domain model. */
export const mapGapAnalysis = (dto: TGapAnalysisDto): IGapAnalysis => ({
  currentPosition: {
    id: dto.current_position.id,
    title: dto.current_position.title,
    sortOrder: dto.current_position.sort_order,
    careerTrack: {
      id: dto.current_position.career_track.id,
      title: dto.current_position.career_track.title,
    },
  },
  nextPosition: dto.next_position
    ? {
        id: dto.next_position.id,
        title: dto.next_position.title,
        sortOrder: dto.next_position.sort_order,
      }
    : null,
  skillGaps: dto.skill_gaps.map(mapSkillGap),
  summary: {
    totalSkills: dto.summary.total_skills,
    skillsMet: dto.summary.skills_met,
    skillsWithGap: dto.summary.skills_with_gap,
    mandatoryGaps: dto.summary.mandatory_gaps,
  },
})
