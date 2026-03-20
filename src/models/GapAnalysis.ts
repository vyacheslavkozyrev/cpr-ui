/**
 * GapAnalysis Models — Presentation Layer
 * Camelcase, UI-friendly types independent of API wire format.
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

/** Career track summary. */
export interface IGapCareerTrack {
  id: string
  title: string
}

/** Current position summary. */
export interface IGapCurrentPosition {
  id: string
  title: string
  sortOrder: number
  careerTrack: IGapCareerTrack
}

/** Next-level position summary. Null when already at highest level. */
export interface IGapNextPosition {
  id: string
  title: string
  sortOrder: number
}

/** Skill category. */
export interface IGapSkillCategory {
  id: string
  title: string
}

/** Skill. */
export interface IGapSkill {
  id: string
  title: string
  category: IGapSkillCategory
}

/** Skill level. */
export interface IGapSkillLevel {
  id: string
  title: string
  value: number
}

/** A non-completed goal targeting the same skill. */
export interface ILinkedGoal {
  id: string
  title: string
  progressPercentage: number
  status: string
}

/** A single skill gap entry. */
export interface ISkillGap {
  skill: IGapSkill
  requiredLevel: IGapSkillLevel
  actualLevel: IGapSkillLevel
  /** Integer: required − actual. ≤ 0 means requirement is met. */
  gap: number
  isMandatory: boolean
  /** "manager" when manager_assessment_value was used; "default" when fallback minimum was used. */
  assessmentSource: 'manager' | 'default'
  linkedGoals: ILinkedGoal[]
}

/** Aggregate counts. */
export interface IGapSummary {
  totalSkills: number
  skillsMet: number
  skillsWithGap: number
  mandatoryGaps: number
}

/** Full gap analysis domain model. */
export interface IGapAnalysis {
  currentPosition: IGapCurrentPosition
  nextPosition: IGapNextPosition | null
  skillGaps: ISkillGap[]
  summary: IGapSummary
}
