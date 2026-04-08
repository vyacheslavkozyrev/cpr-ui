/**
 * Unit tests for GapRadarChart
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ISkillGap } from '@/models/GapAnalysis'
import { renderWithProviders } from '@/tests/utils'
import GapRadarChart from './GapRadarChart'

// ── Fixtures ────────────────────────────────────────────────────────────────

const makeSkillGap = (
  id: string,
  title: string,
  required: number,
  actual: number
): ISkillGap => ({
  skill: {
    id,
    title,
    category: { id: 'cat-1', title: 'Engineering' },
  },
  requiredLevel: { id: `lvl-r-${id}`, title: 'Required', value: required },
  actualLevel: { id: `lvl-a-${id}`, title: 'Actual', value: actual },
  gap: Math.max(0, required - actual),
  isMandatory: true,
  assessmentSource: 'manager',
  linkedGoals: [],
})

const threeSkillGaps: ISkillGap[] = [
  makeSkillGap('s1', 'Python', 3, 2),
  makeSkillGap('s2', 'TypeScript', 4, 3),
  makeSkillGap('s3', 'Communication', 2, 2),
]

const twoSkillGaps: ISkillGap[] = [
  makeSkillGap('s1', 'Python', 3, 2),
  makeSkillGap('s2', 'TypeScript', 4, 3),
]

const oneSkillGap: ISkillGap[] = [makeSkillGap('s1', 'Python', 3, 1)]

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GapRadarChart', () => {
  describe('empty state (no skills)', () => {
    it('renders the no-skills message when skillGaps is empty', () => {
      renderWithProviders(<GapRadarChart skillGaps={[]} />)
      expect(screen.getByText(/no skills to display/i)).toBeInTheDocument()
    })

    it('does not render a chart container in empty state', () => {
      renderWithProviders(<GapRadarChart skillGaps={[]} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('bar chart branch (fewer than 3 skills)', () => {
    it('renders the bar chart container with correct aria-label for 1 skill', () => {
      renderWithProviders(<GapRadarChart skillGaps={oneSkillGap} />)
      const chart = screen.getByRole('img')
      expect(chart).toBeInTheDocument()
      // aria-label should reference bar chart title, not radar chart title
      expect(chart.getAttribute('aria-label')).toMatch(/bar/i)
    })

    it('renders the bar chart container for 2 skills', () => {
      renderWithProviders(<GapRadarChart skillGaps={twoSkillGaps} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })

  describe('radar chart branch (3 or more skills)', () => {
    it('renders the radar chart container with correct aria-label for 3 skills', () => {
      renderWithProviders(<GapRadarChart skillGaps={threeSkillGaps} />)
      const chart = screen.getByRole('img')
      expect(chart).toBeInTheDocument()
      // aria-label uses translation key gap_analysis.radar_chart_title ("Skills Overview")
      expect(chart.getAttribute('aria-label')).not.toMatch(/bar/i)
      expect(chart.getAttribute('aria-label')).toBeTruthy()
    })

    it('renders exactly one chart container for 3 skills', () => {
      renderWithProviders(<GapRadarChart skillGaps={threeSkillGaps} />)
      expect(screen.getAllByRole('img')).toHaveLength(1)
    })
  })

  describe('aria-label differentiation', () => {
    it('bar chart aria-label differs from radar chart aria-label', () => {
      const { unmount } = renderWithProviders(
        <GapRadarChart skillGaps={twoSkillGaps} />
      )
      const barLabel = screen.getByRole('img').getAttribute('aria-label')
      unmount()

      renderWithProviders(<GapRadarChart skillGaps={threeSkillGaps} />)
      const radarLabel = screen.getByRole('img').getAttribute('aria-label')

      expect(barLabel).not.toBe(radarLabel)
    })
  })
})
