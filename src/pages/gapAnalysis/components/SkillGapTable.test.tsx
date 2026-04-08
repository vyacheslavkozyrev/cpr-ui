/**
 * Unit tests for SkillGapTable (and SkillGapRow via integration)
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ISkillGap } from '@/models/GapAnalysis'
import { renderWithProviders } from '@/tests/utils'
import SkillGapTable from './SkillGapTable'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeSkillGap = (overrides: Partial<ISkillGap> = {}): ISkillGap => ({
  skill: {
    id: 'skill-1',
    title: 'Python',
    category: { id: 'cat-1', title: 'Engineering' },
  },
  requiredLevel: { id: 'lvl-3', title: 'Advanced', value: 3 },
  actualLevel: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  gap: 1,
  isMandatory: true,
  assessmentSource: 'manager',
  linkedGoals: [],
  ...overrides,
})

const gapMet: ISkillGap = makeSkillGap({
  skill: {
    id: 'skill-2',
    title: 'Communication',
    category: { id: 'cat-2', title: 'Soft Skills' },
  },
  requiredLevel: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  actualLevel: { id: 'lvl-2', title: 'Intermediate', value: 2 },
  gap: 0,
  isMandatory: false,
})

const gapWithDefault: ISkillGap = makeSkillGap({
  skill: {
    id: 'skill-3',
    title: 'TypeScript',
    category: { id: 'cat-1', title: 'Engineering' },
  },
  assessmentSource: 'default',
  actualLevel: { id: 'lvl-1', title: 'Beginner', value: 1 },
  gap: 2,
})

const gapWithLinkedGoals: ISkillGap = makeSkillGap({
  skill: {
    id: 'skill-4',
    title: 'Leadership',
    category: { id: 'cat-3', title: 'Management' },
  },
  gap: 1,
  linkedGoals: [
    {
      id: 'goal-1',
      title: 'Read management books',
      progressPercentage: 50,
      status: 'in_progress',
    },
  ],
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SkillGapTable', () => {
  describe('empty state', () => {
    it('renders no-skills message when skillGaps is empty', () => {
      renderWithProviders(<SkillGapTable skillGaps={[]} />)
      expect(screen.getByText(/no skills to display/i)).toBeInTheDocument()
    })

    it('does not render table when skillGaps is empty', () => {
      renderWithProviders(<SkillGapTable skillGaps={[]} />)
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('table structure', () => {
    it('renders a table with aria-label', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('renders all 6 column headers', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByText(/skill/i)).toBeInTheDocument()
      expect(screen.getByText(/required/i)).toBeInTheDocument()
      expect(screen.getByText(/actual/i)).toBeInTheDocument()
      expect(screen.getByText(/gap/i)).toBeInTheDocument()
      expect(screen.getByText(/mandatory/i)).toBeInTheDocument()
      expect(screen.getByText(/goals/i)).toBeInTheDocument()
    })
  })

  describe('category grouping', () => {
    it('renders a category header row for each distinct category', () => {
      const gaps = [
        makeSkillGap(), // Engineering
        gapMet, // Soft Skills
      ]
      renderWithProviders(<SkillGapTable skillGaps={gaps} />)
      // Category header spans 6 columns; category chip in row also shows the title
      // Use querySelectorAll to find only the header cells (colspan=6)
      const headerCells = document.querySelectorAll('td[colspan="6"]')
      const categoryTitles = Array.from(headerCells).map(td =>
        td.textContent?.trim()
      )
      expect(categoryTitles).toContain('Engineering')
      expect(categoryTitles).toContain('Soft Skills')
    })

    it('groups multiple skills under the same category header', () => {
      const gaps = [
        makeSkillGap(), // Engineering
        gapWithDefault, // Engineering (same category)
      ]
      renderWithProviders(<SkillGapTable skillGaps={gaps} />)
      // Only one category header cell (colspan=6) for Engineering
      const headerCells = document.querySelectorAll('td[colspan="6"]')
      const engineeringHeaders = Array.from(headerCells).filter(
        td => td.textContent?.trim() === 'Engineering'
      )
      expect(engineeringHeaders).toHaveLength(1)
      // Both skills appear
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  describe('skill rows', () => {
    it('displays skill name', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('displays required level', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByText('Advanced')).toBeInTheDocument()
    })

    it('displays "Met" for a skill with no gap', () => {
      renderWithProviders(<SkillGapTable skillGaps={[gapMet]} />)
      expect(screen.getByText(/met/i)).toBeInTheDocument()
    })

    it('displays numeric gap for a skill with a gap', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('annotates actual level with "(default)" when assessmentSource is "default"', () => {
      renderWithProviders(<SkillGapTable skillGaps={[gapWithDefault]} />)
      expect(screen.getByText(/default/i)).toBeInTheDocument()
    })

    it('does not annotate actual level when assessmentSource is "manager"', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      // Actual level chip should not contain "(default)"
      const actualChip = screen.getByText('Intermediate')
      expect(actualChip.textContent).not.toMatch(/\(default\)/i)
    })

    it('displays "Yes" for mandatory skill', () => {
      renderWithProviders(<SkillGapTable skillGaps={[makeSkillGap()]} />)
      expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('displays "No" for non-mandatory skill', () => {
      renderWithProviders(<SkillGapTable skillGaps={[gapMet]} />)
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })

  describe('Create Goal button visibility', () => {
    it('shows Create Goal button when canCreateGoal=true and gap > 0', () => {
      renderWithProviders(
        <SkillGapTable skillGaps={[makeSkillGap()]} canCreateGoal={true} />
      )
      expect(
        screen.getByRole('button', { name: /create goal/i })
      ).toBeInTheDocument()
    })

    it('does not show Create Goal button when canCreateGoal=false', () => {
      renderWithProviders(
        <SkillGapTable skillGaps={[makeSkillGap()]} canCreateGoal={false} />
      )
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
    })

    it('does not show Create Goal button when gap is 0', () => {
      renderWithProviders(
        <SkillGapTable skillGaps={[gapMet]} canCreateGoal={true} />
      )
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
    })

    it('calls onCreateGoal with the skill gap when Create Goal is clicked', async () => {
      const user = userEvent.setup()
      const onCreateGoal = vi.fn()
      const gap = makeSkillGap()

      renderWithProviders(
        <SkillGapTable
          skillGaps={[gap]}
          canCreateGoal={true}
          onCreateGoal={onCreateGoal}
        />
      )
      await user.click(screen.getByRole('button', { name: /create goal/i }))
      expect(onCreateGoal).toHaveBeenCalledWith(gap)
    })
  })

  describe('linked goals', () => {
    it('displays linked goal titles and progress when gap > 0', () => {
      renderWithProviders(<SkillGapTable skillGaps={[gapWithLinkedGoals]} />)
      expect(screen.getByText(/read management books/i)).toBeInTheDocument()
      expect(screen.getByText(/50%/)).toBeInTheDocument()
    })

    it('does not display linked goals list when gap is 0', () => {
      const metWithGoal: ISkillGap = {
        ...gapMet,
        linkedGoals: [
          {
            id: 'g1',
            title: 'Irrelevant goal',
            progressPercentage: 100,
            status: 'completed',
          },
        ],
      }
      renderWithProviders(<SkillGapTable skillGaps={[metWithGoal]} />)
      expect(screen.queryByText('Irrelevant goal')).not.toBeInTheDocument()
    })
  })
})
