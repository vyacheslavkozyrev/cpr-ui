import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../tests/utils'
import SkillRadarChart from '../../../components/taxonomy/SkillRadarChart'
import type { IPositionSkillRequirement } from '../../../types/taxonomy.types'

// Mock recharts — jsdom has no SVG/canvas rendering; use identifiable div wrappers
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  RadarChart: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid='radar-chart'>{children}</div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children?: React.ReactNode
    data?: Array<{ skill: string; level: number }>
  }) => (
    <div data-testid='bar-chart'>
      {data?.map(d => (
        <span key={d.skill}>{d.skill}</span>
      ))}
      {children}
    </div>
  ),
  PolarGrid: () => <div data-testid='polar-grid' />,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Radar: ({
    name,
    strokeDasharray,
  }: {
    name?: string
    strokeDasharray?: string
  }) => (
    <div
      data-testid={`radar-segment-${name ?? 'unknown'}`}
      data-stroke-dasharray={strokeDasharray ?? 'solid'}
    />
  ),
  Bar: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Cell: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Legend: () => null,
  Tooltip: () => null,
}))

// --- Test fixtures ---

const makeSkill = (
  id: string,
  title: string,
  levelValue: number,
  isMandatory = true,
  categoryId = 'cat-001',
  categoryTitle = 'Technical'
): IPositionSkillRequirement => ({
  id,
  skill_id: `skill-${id}`,
  skill_title: title,
  category_id: categoryId,
  category_title: categoryTitle,
  skill_level_id: `lvl-${id}-${levelValue}`,
  skill_level_title: `Level ${levelValue}`,
  skill_level_value: levelValue,
  is_mandatory: isMandatory,
  rationale: null,
})

const twoSkills: IPositionSkillRequirement[] = [
  makeSkill('1', 'TypeScript', 3),
  makeSkill('2', 'SQL', 2),
]

const threeSkills: IPositionSkillRequirement[] = [
  makeSkill('1', 'TypeScript', 3),
  makeSkill('2', 'SQL', 2),
  makeSkill('3', 'System Design', 4),
]

const fourSkillsMixedCategories: IPositionSkillRequirement[] = [
  makeSkill('1', 'TypeScript', 3, true, 'cat-001', 'Technical'),
  makeSkill('2', '.NET', 2, true, 'cat-001', 'Technical'),
  makeSkill('3', 'System Design', 4, false, 'cat-001', 'Technical'),
  makeSkill('4', 'Communication', 2, false, 'cat-002', 'Soft Skills'),
]

describe('SkillRadarChart', () => {
  it('renders empty state when no skills provided', () => {
    renderWithProviders(<SkillRadarChart skills={[]} />)
    expect(
      screen.getByText(/no skill requirements defined/i)
    ).toBeInTheDocument()
  })

  it('renders BarChart for fewer than 3 skills', () => {
    renderWithProviders(<SkillRadarChart skills={twoSkills} />)
    expect(screen.queryByTestId('bar-chart')).not.toBeNull()
    expect(screen.queryByTestId('radar-chart')).toBeNull()
    expect(screen.queryByTestId('polar-grid')).toBeNull()
  })

  it('renders RadarChart for 3+ skills', () => {
    renderWithProviders(<SkillRadarChart skills={threeSkills} />)
    expect(screen.queryByTestId('radar-chart')).not.toBeNull()
    expect(screen.queryByTestId('bar-chart')).toBeNull()
    expect(screen.queryByTestId('polar-grid')).not.toBeNull()
  })

  it('renders RadarChart for 4 skills across multiple categories', () => {
    renderWithProviders(<SkillRadarChart skills={fourSkillsMixedCategories} />)
    expect(screen.queryByTestId('radar-chart')).not.toBeNull()
    expect(screen.queryByTestId('polar-grid')).not.toBeNull()
  })

  it('renders skill labels for BarChart fallback', () => {
    renderWithProviders(<SkillRadarChart skills={twoSkills} />)
    // Mock BarChart renders skill names as spans
    expect(screen.queryByText('TypeScript')).not.toBeNull()
    expect(screen.queryByText('SQL')).not.toBeNull()
  })

  it('single skill falls back to BarChart', () => {
    const oneSkill = [makeSkill('1', 'TypeScript', 3)]
    renderWithProviders(<SkillRadarChart skills={oneSkill} />)
    expect(screen.queryByTestId('bar-chart')).not.toBeNull()
    expect(screen.queryByTestId('radar-chart')).toBeNull()
    expect(screen.queryByTestId('polar-grid')).toBeNull()
  })

  it('exactly 3 skills renders RadarChart not BarChart', () => {
    renderWithProviders(<SkillRadarChart skills={threeSkills} />)
    expect(screen.queryByTestId('radar-chart')).not.toBeNull()
    expect(screen.queryByTestId('bar-chart')).toBeNull()
    expect(screen.queryByTestId('polar-grid')).not.toBeNull()
  })

  // AC-016: Radar chart renders a single dataset for all skills (no per-category split)
  it('AC-016 — radar chart renders with a single skill-level dataset', () => {
    const mixedMandatory: IPositionSkillRequirement[] = [
      makeSkill('1', 'TypeScript', 3, true, 'cat-001', 'Technical'),
      makeSkill('2', '.NET', 2, true, 'cat-001', 'Technical'),
      makeSkill('3', 'Communication', 2, false, 'cat-002', 'SoftSkills'),
    ]
    renderWithProviders(<SkillRadarChart skills={mixedMandatory} />)

    // Radar chart should be used (3+ skills)
    expect(screen.queryByTestId('radar-chart')).not.toBeNull()
    // A single Radar segment is rendered for all skills
    expect(
      document.querySelectorAll('[data-testid^="radar-segment-"]').length
    ).toBeGreaterThan(0)
  })
})
