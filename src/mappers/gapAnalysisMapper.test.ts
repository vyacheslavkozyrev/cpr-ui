/**
 * Unit tests for gapAnalysisMapper
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { describe, expect, it } from 'vitest'
import type {
  TGapAnalysisDto,
  TLinkedGoalDto,
  TSkillGapDto,
} from '../dtos/GapAnalysisDto'
import { mapGapAnalysis, mapLinkedGoal, mapSkillGap } from './gapAnalysisMapper'

// ── Fixtures ────────────────────────────────────────────────────────────────

const linkedGoalDto: TLinkedGoalDto = {
  id: 'goal-1',
  title: 'Improve Python skills',
  progress_percentage: 40,
  status: 'in_progress',
}

const skillGapDtoWithManager: TSkillGapDto = {
  skill: {
    id: 'skill-1',
    title: 'Python',
    category: { id: 'cat-1', title: 'Engineering' },
  },
  required_level: { id: 'lvl-3', title: 'Advanced', value: 3 },
  actual_level: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  gap: 1,
  is_mandatory: true,
  assessment_source: 'manager',
  linked_goals: [linkedGoalDto],
}

const skillGapDtoWithDefault: TSkillGapDto = {
  skill: {
    id: 'skill-2',
    title: 'Communication',
    category: { id: 'cat-2', title: 'Soft Skills' },
  },
  required_level: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  actual_level: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  gap: 0,
  is_mandatory: false,
  assessment_source: 'default',
  linked_goals: [],
}

const gapAnalysisDto: TGapAnalysisDto = {
  current_position: {
    id: 'pos-1',
    title: 'Junior Developer',
    sort_order: 1,
    career_track: { id: 'track-1', title: 'Engineering' },
  },
  next_position: {
    id: 'pos-2',
    title: 'Mid Developer',
    sort_order: 2,
  },
  skill_gaps: [skillGapDtoWithManager, skillGapDtoWithDefault],
  summary: {
    total_skills: 2,
    skills_met: 1,
    skills_with_gap: 1,
    mandatory_gaps: 1,
  },
}

// ── mapLinkedGoal ────────────────────────────────────────────────────────────

describe('mapLinkedGoal', () => {
  it('maps all fields from DTO to domain model', () => {
    const result = mapLinkedGoal(linkedGoalDto)

    expect(result.id).toBe('goal-1')
    expect(result.title).toBe('Improve Python skills')
    expect(result.progressPercentage).toBe(40)
    expect(result.status).toBe('in_progress')
  })

  it('converts snake_case progress_percentage to camelCase progressPercentage', () => {
    const dto: TLinkedGoalDto = {
      id: 'g2',
      title: 'Test goal',
      progress_percentage: 75,
      status: 'active',
    }
    const result = mapLinkedGoal(dto)
    expect(result.progressPercentage).toBe(75)
  })
})

// ── mapSkillGap ──────────────────────────────────────────────────────────────

describe('mapSkillGap', () => {
  it('maps skill identity fields', () => {
    const result = mapSkillGap(skillGapDtoWithManager)

    expect(result.skill.id).toBe('skill-1')
    expect(result.skill.title).toBe('Python')
    expect(result.skill.category.id).toBe('cat-1')
    expect(result.skill.category.title).toBe('Engineering')
  })

  it('maps required and actual levels', () => {
    const result = mapSkillGap(skillGapDtoWithManager)

    expect(result.requiredLevel.id).toBe('lvl-3')
    expect(result.requiredLevel.title).toBe('Advanced')
    expect(result.requiredLevel.value).toBe(3)
    expect(result.actualLevel.id).toBe('lvl-2')
    expect(result.actualLevel.value).toBe(2)
  })

  it('maps gap, isMandatory, assessmentSource correctly', () => {
    const result = mapSkillGap(skillGapDtoWithManager)

    expect(result.gap).toBe(1)
    expect(result.isMandatory).toBe(true)
    expect(result.assessmentSource).toBe('manager')
  })

  it('maps assessment_source "default" when fallback minimum level was used', () => {
    const result = mapSkillGap(skillGapDtoWithDefault)

    expect(result.assessmentSource).toBe('default')
  })

  it('maps linked goals array', () => {
    const result = mapSkillGap(skillGapDtoWithManager)

    expect(result.linkedGoals).toHaveLength(1)
    expect(result.linkedGoals[0].id).toBe('goal-1')
    expect(result.linkedGoals[0].progressPercentage).toBe(40)
  })

  it('maps empty linked_goals array to empty linkedGoals', () => {
    const result = mapSkillGap(skillGapDtoWithDefault)

    expect(result.linkedGoals).toHaveLength(0)
  })

  it('maps snake_case is_mandatory to camelCase isMandatory', () => {
    const result = mapSkillGap(skillGapDtoWithDefault)
    expect(result.isMandatory).toBe(false)
  })
})

// ── mapGapAnalysis ───────────────────────────────────────────────────────────

describe('mapGapAnalysis', () => {
  it('maps currentPosition including nested careerTrack', () => {
    const result = mapGapAnalysis(gapAnalysisDto)

    expect(result.currentPosition.id).toBe('pos-1')
    expect(result.currentPosition.title).toBe('Junior Developer')
    expect(result.currentPosition.sortOrder).toBe(1)
    expect(result.currentPosition.careerTrack.id).toBe('track-1')
    expect(result.currentPosition.careerTrack.title).toBe('Engineering')
  })

  it('maps nextPosition when present', () => {
    const result = mapGapAnalysis(gapAnalysisDto)

    expect(result.nextPosition).not.toBeNull()
    expect(result.nextPosition?.id).toBe('pos-2')
    expect(result.nextPosition?.title).toBe('Mid Developer')
    expect(result.nextPosition?.sortOrder).toBe(2)
  })

  it('maps nextPosition to null when employee is at the highest level', () => {
    const atHighestLevel: TGapAnalysisDto = {
      ...gapAnalysisDto,
      next_position: null,
    }
    const result = mapGapAnalysis(atHighestLevel)

    expect(result.nextPosition).toBeNull()
  })

  it('maps all skill gaps', () => {
    const result = mapGapAnalysis(gapAnalysisDto)

    expect(result.skillGaps).toHaveLength(2)
  })

  it('maps summary fields from snake_case to camelCase', () => {
    const result = mapGapAnalysis(gapAnalysisDto)

    expect(result.summary.totalSkills).toBe(2)
    expect(result.summary.skillsMet).toBe(1)
    expect(result.summary.skillsWithGap).toBe(1)
    expect(result.summary.mandatoryGaps).toBe(1)
  })

  it('maps empty skill_gaps array', () => {
    const dto: TGapAnalysisDto = { ...gapAnalysisDto, skill_gaps: [] }
    const result = mapGapAnalysis(dto)

    expect(result.skillGaps).toHaveLength(0)
  })
})
