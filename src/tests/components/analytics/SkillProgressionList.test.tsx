/**
 * Component tests for SkillProgressionList
 * Feature 0014 — Performance Analytics & Reporting
 *
 * Covers: populated rows (AC-010), empty state message (AC-014), gap colour coding (AC-010).
 */

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SkillProgressionList } from '../../../components/analytics/SkillProgressionList'
import type { ISkillRow } from '../../../models/analytics.models'
import { renderWithProviders } from '../../utils'

// Mock recharts to avoid canvas/SVG issues in happy-dom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='responsive-container'>{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='line-chart'>{children}</div>
    ),
    Line: () => <div data-testid='line' />,
    ReferenceLine: () => <div data-testid='reference-line' />,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  }
})

const makeSkillRow = (overrides: Partial<ISkillRow> = {}): ISkillRow => ({
  skillId: 'skill-001',
  skillTitle: 'TypeScript',
  categoryTitle: 'Frontend',
  currentSelfAssessment: 4.0,
  currentManagerAssessment: 3.5,
  requiredLevel: 4.0,
  gap: 0.0,
  gapColor: 'success',
  history: [],
  ...overrides,
})

describe('SkillProgressionList', () => {
  // ---- Loading state ----

  it('renders loading skeletons when isLoading is true', () => {
    renderWithProviders(<SkillProgressionList skills={[]} isLoading={true} />)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('does not render a table when isLoading is true', () => {
    renderWithProviders(<SkillProgressionList skills={[]} isLoading={true} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  // ---- Empty state (AC-014) ----

  it('renders empty-state message when skills array is empty and not loading', () => {
    renderWithProviders(<SkillProgressionList skills={[]} isLoading={false} />)
    expect(
      screen.getByText(/No skill assessment data available/i)
    ).toBeInTheDocument()
  })

  it('does not render a table for empty skills', () => {
    renderWithProviders(<SkillProgressionList skills={[]} isLoading={false} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  // ---- Populated rows (AC-010) ----

  it('renders a table row for each skill', () => {
    const skills = [
      makeSkillRow(),
      makeSkillRow({ skillId: 'skill-002', skillTitle: 'React' }),
    ]
    renderWithProviders(
      <SkillProgressionList skills={skills} isLoading={false} />
    )
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('renders skill category column', () => {
    renderWithProviders(
      <SkillProgressionList skills={[makeSkillRow()]} isLoading={false} />
    )
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })

  it('renders self-assessment value formatted to 1 decimal', () => {
    // Use a self value that differs from the default manager assessment (3.5 vs 4.0)
    // to avoid multiple match errors
    renderWithProviders(
      <SkillProgressionList
        skills={[
          makeSkillRow({
            currentSelfAssessment: 2.5,
            currentManagerAssessment: 4.0,
          }),
        ]}
        isLoading={false}
      />
    )
    expect(screen.getByText('2.5')).toBeInTheDocument()
  })

  it('renders manager assessment value formatted to 1 decimal', () => {
    // Give distinct values to self (2.0) and manager (3.5) to avoid ambiguity
    renderWithProviders(
      <SkillProgressionList
        skills={[
          makeSkillRow({
            currentSelfAssessment: 2.0,
            currentManagerAssessment: 3.5,
          }),
        ]}
        isLoading={false}
      />
    )
    expect(screen.getByText('3.5')).toBeInTheDocument()
  })

  it('renders "—" when manager assessment is null', () => {
    renderWithProviders(
      <SkillProgressionList
        skills={[makeSkillRow({ currentManagerAssessment: null })]}
        isLoading={false}
      />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders "—" when required level is null', () => {
    renderWithProviders(
      <SkillProgressionList
        skills={[
          makeSkillRow({ requiredLevel: null, gap: null, gapColor: 'default' }),
        ]}
        isLoading={false}
      />
    )
    const dashes = screen.getAllByText('—')
    // Both required level and gap columns should show "—"
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  // ---- Gap colour coding (AC-010) ----

  it('renders a success chip for gap = 0 (met)', () => {
    renderWithProviders(
      <SkillProgressionList
        skills={[makeSkillRow({ gap: 0, gapColor: 'success' })]}
        isLoading={false}
      />
    )
    // Gap met is shown as a checkmark chip
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('renders a positive gap label for gap > 0', () => {
    renderWithProviders(
      <SkillProgressionList
        skills={[makeSkillRow({ gap: 0.5, gapColor: 'warning' })]}
        isLoading={false}
      />
    )
    expect(screen.getByText('+0.5')).toBeInTheDocument()
  })

  it('renders a "—" for null gap', () => {
    renderWithProviders(
      <SkillProgressionList
        skills={[
          makeSkillRow({ gap: null, gapColor: 'default', requiredLevel: null }),
        ]}
        isLoading={false}
      />
    )
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  // ---- Table headers ----

  it('renders column headers', () => {
    renderWithProviders(
      <SkillProgressionList skills={[makeSkillRow()]} isLoading={false} />
    )
    expect(screen.getByText(/Skill/i)).toBeInTheDocument()
    expect(screen.getByText(/Category/i)).toBeInTheDocument()
  })

  // ---- Multiple skills ----

  it('renders the correct number of table rows', () => {
    const skills = [
      makeSkillRow({ skillId: 'a', skillTitle: 'SkillA' }),
      makeSkillRow({ skillId: 'b', skillTitle: 'SkillB' }),
      makeSkillRow({ skillId: 'c', skillTitle: 'SkillC' }),
    ]
    renderWithProviders(
      <SkillProgressionList skills={skills} isLoading={false} />
    )
    // 1 header row + 3 data rows
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(4)
  })
})
