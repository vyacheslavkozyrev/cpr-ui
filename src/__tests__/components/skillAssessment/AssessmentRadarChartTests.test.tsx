/**
 * Component tests for AssessmentRadarChart
 *
 * Covers:
 * AC-014 — Radar chart renders with three labelled datasets
 * AC-015 — "Highest position" banner shown when nextPositionNull=true; Dataset 3 omitted
 * AC-016 — Chart axes correspond to current-position skill titles
 *
 * react-chartjs-2 is mocked to capture props and avoid canvas dependency.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Radar } from 'react-chartjs-2'
import AssessmentRadarChart from '../../../components/skillAssessment/AssessmentRadarChart'
import { mockSkillAssessmentResponse } from '../../../mocks/data/skillAssessmentMockData'

// Mock react-chartjs-2: capture data prop for assertion; render nothing
vi.mock('react-chartjs-2', () => ({
  Radar: vi.fn().mockReturnValue(null),
}))

const { skill_categories } = mockSkillAssessmentResponse

// Helper to get the most-recent Radar call args
function getLastRadarData(): {
  labels: string[]
  datasets: { label: string; data: number[] }[]
} {
  const calls = vi.mocked(Radar).mock.calls
  if (calls.length === 0) throw new Error('Radar was never called')
  return (calls[calls.length - 1] as [{ data: unknown }])[0].data as {
    labels: string[]
    datasets: { label: string; data: number[] }[]
  }
}

// ── AC-014: Chart renders ─────────────────────────────────────────────────────

describe('AssessmentRadarChart — AC-014: chart renders with datasets', () => {
  it('calls Radar with Position Required dataset', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.some(d => d.label === 'Position Required')).toBe(true)
  })

  it('calls Radar with Self-Assessed dataset', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.some(d => d.label === 'Self-Assessed')).toBe(true)
  })

  it('calls Radar with Next Position Required dataset when nextPositionNull=false', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.some(d => d.label === 'Next Position Required')).toBe(
      true
    )
  })

  it('renders exactly three datasets when next position exists', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.length).toBe(3)
  })
})

// ── AC-015: Highest position banner ──────────────────────────────────────────

describe('AssessmentRadarChart — AC-015: highest position banner', () => {
  it('shows "highest position in your career track" text when nextPositionNull=true', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={true}
      />
    )
    expect(
      screen.queryByText(/highest position in your career track/i)
    ).not.toBeNull()
  })

  it('omits Next Position Required dataset when nextPositionNull=true', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={true}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.some(d => d.label === 'Next Position Required')).toBe(
      false
    )
  })

  it('renders only two datasets when nextPositionNull=true', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={true}
      />
    )
    const data = getLastRadarData()
    expect(data.datasets.length).toBe(2)
  })

  it('does not show banner when nextPositionNull=false', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    expect(
      screen.queryByText(/highest position in your career track/i)
    ).toBeNull()
  })
})

// ── AC-016: Chart axes = skill titles ────────────────────────────────────────

describe('AssessmentRadarChart — AC-016: chart axes use skill titles', () => {
  it('uses current-position skill titles as chart axis labels', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    // All skills from both categories should appear as chart labels
    expect(data.labels).toContain('TypeScript')
    expect(data.labels).toContain('System Design')
    expect(data.labels).toContain('.NET / C#')
    expect(data.labels).toContain('Team Collaboration')
    expect(data.labels).toContain('Technical Writing')
  })

  it('uses 0 for unassessed skills in the Self-Assessed dataset', () => {
    render(
      <AssessmentRadarChart
        skillCategories={skill_categories}
        nextPositionNull={false}
      />
    )
    const data = getLastRadarData()
    const selfAssessedDataset = data.datasets.find(
      d => d.label === 'Self-Assessed'
    )
    // System Design is unassessed (index 1) — should be 0
    expect(selfAssessedDataset?.data[1]).toBe(0)
  })
})
