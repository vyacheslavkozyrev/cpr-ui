/**
 * Gap Analysis MSW Mock Data Fixtures
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import type { TGapAnalysisDto } from '../../dtos/GapAnalysisDto'

/** Own-profile gap analysis response (employee has a next-level position with gaps). */
export const mockOwnGapAnalysis: TGapAnalysisDto = {
  current_position: {
    id: 'pos-001',
    title: 'Junior Software Engineer',
    sort_order: 1,
    career_track: {
      id: 'track-001',
      title: 'Software Engineering',
    },
  },
  next_position: {
    id: 'pos-002',
    title: 'Software Engineer',
    sort_order: 2,
  },
  skill_gaps: [
    {
      skill: {
        id: 'skill-001',
        title: 'TypeScript',
        category: { id: 'cat-001', title: 'Frontend' },
      },
      required_level: { id: 'sl-003', title: 'Intermediate', value: 3 },
      actual_level: { id: 'sl-002', title: 'Basic', value: 2 },
      gap: 1,
      is_mandatory: true,
      assessment_source: 'manager',
      linked_goals: [
        {
          id: 'goal-001',
          title: 'Improve TypeScript to Intermediate',
          progress_percentage: 45.0,
          status: 'in_progress',
        },
      ],
    },
    {
      skill: {
        id: 'skill-002',
        title: 'React',
        category: { id: 'cat-001', title: 'Frontend' },
      },
      required_level: { id: 'sl-003', title: 'Intermediate', value: 3 },
      actual_level: { id: 'sl-003', title: 'Intermediate', value: 3 },
      gap: 0,
      is_mandatory: true,
      assessment_source: 'manager',
      linked_goals: [],
    },
    {
      skill: {
        id: 'skill-003',
        title: 'System Design',
        category: { id: 'cat-002', title: 'Architecture' },
      },
      required_level: { id: 'sl-002', title: 'Basic', value: 2 },
      actual_level: { id: 'sl-001', title: 'Awareness', value: 1 },
      gap: 1,
      is_mandatory: false,
      assessment_source: 'default',
      linked_goals: [],
    },
    {
      skill: {
        id: 'skill-004',
        title: 'Testing',
        category: { id: 'cat-001', title: 'Frontend' },
      },
      required_level: { id: 'sl-003', title: 'Intermediate', value: 3 },
      actual_level: { id: 'sl-004', title: 'Advanced', value: 4 },
      gap: -1,
      is_mandatory: false,
      assessment_source: 'manager',
      linked_goals: [],
    },
  ],
  summary: {
    total_skills: 4,
    skills_met: 2,
    skills_with_gap: 2,
    mandatory_gaps: 1,
  },
}

/** Employee gap analysis response (same shape; for manager/director view). */
export const mockEmployeeGapAnalysis: TGapAnalysisDto = {
  ...mockOwnGapAnalysis,
  current_position: {
    ...mockOwnGapAnalysis.current_position,
  },
}

/** Response for employee at the highest level (no next position). */
export const mockAtHighestLevelResponse: TGapAnalysisDto = {
  current_position: {
    id: 'pos-005',
    title: 'Principal Engineer',
    sort_order: 5,
    career_track: {
      id: 'track-001',
      title: 'Software Engineering',
    },
  },
  next_position: null,
  skill_gaps: [],
  summary: {
    total_skills: 0,
    skills_met: 0,
    skills_with_gap: 0,
    mandatory_gaps: 0,
  },
}
