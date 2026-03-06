/**
 * Component tests for AssessmentSkillRow
 *
 * Covers:
 * AC-003 — Skill row displays title, required level, assessed/target level
 * AC-005 — Level selector lists skill_levels (current)
 * AC-010 — Level selector for target level
 * AC-013 — "Clear target" action available when target is set
 * AC-018 — "Link feedback" opens EvidenceModal dialog
 * AC-021 — Evidence items displayed below skill row
 * AC-022 — "Remove" evidence action visible / hidden in read-only
 */

import { Table, TableBody } from '@mui/material'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AssessmentSkillRow from '../../../components/skillAssessment/AssessmentSkillRow'
import {
  mockSkillAssessmentResponse,
  mockSkillLevels,
} from '../../../mocks/data/skillAssessmentMockData'
import { renderWithProviders } from '../../../tests/utils'

// TypeScript: assessed=Intermediate, target=Advanced, has one evidence item
const SKILL_ASSESSED = mockSkillAssessmentResponse.skill_categories[0].skills[0]
// System Design: no assessment, no target, no evidence
const SKILL_UNASSESSED =
  mockSkillAssessmentResponse.skill_categories[0].skills[1]

function renderRow(skill = SKILL_ASSESSED, readOnly = false) {
  return renderWithProviders(
    <MemoryRouter>
      <Table>
        <TableBody>
          <AssessmentSkillRow
            skill={skill}
            availableLevels={mockSkillLevels}
            readOnly={readOnly}
          />
        </TableBody>
      </Table>
    </MemoryRouter>
  )
}

// ── AC-003: Skill row displays title, required level, assessed/target ─────────

describe('AssessmentSkillRow — AC-003: skill row content', () => {
  it('renders skill title', () => {
    renderRow()
    expect(screen.queryByText('TypeScript')).not.toBeNull()
  })

  it('renders required level badge chip', () => {
    renderRow()
    // required_level.title = 'Advanced' for the TypeScript skill
    // Note: 'Advanced' may appear in multiple places (chip + target dropdown)
    expect(screen.getAllByText('Advanced').length).toBeGreaterThan(0)
  })

  it('shows assessed level text in read-only mode', () => {
    renderRow(SKILL_ASSESSED, true)
    // assessed.skill_level_title = 'Intermediate'
    expect(screen.queryByText('Intermediate')).not.toBeNull()
  })

  it('shows "Not assessed" placeholder in read-only mode when unassessed', () => {
    renderRow(SKILL_UNASSESSED, true)
    expect(screen.queryByText(/not assessed/i)).not.toBeNull()
  })

  it('shows "No target set" placeholder in read-only mode when no target', () => {
    renderRow(SKILL_UNASSESSED, true)
    expect(screen.queryByText(/no target set/i)).not.toBeNull()
  })
})

// ── AC-005 / AC-010: Level selectors ─────────────────────────────────────────

describe('AssessmentSkillRow — AC-005 / AC-010: Level selectors', () => {
  it('renders Select dropdowns for current and target level in edit mode', () => {
    renderRow()
    const selects = document.querySelectorAll('[role="combobox"]')
    // At least current level + target level selects
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('does not render Select dropdowns in read-only mode', () => {
    renderRow(SKILL_ASSESSED, true)
    const selects = document.querySelectorAll('[role="combobox"]')
    expect(selects.length).toBe(0)
  })
})

// ── AC-013: "Clear target" action ────────────────────────────────────────────

describe('AssessmentSkillRow — AC-013: Clear target', () => {
  it('includes "Clear target" option in the target dropdown when skill has a target', async () => {
    renderRow(SKILL_ASSESSED)
    // MUI Select renders MenuItems via Portal only when the dropdown is open
    const comboboxes = document.querySelectorAll('[role="combobox"]')
    // Target level select is the second combobox
    const targetSelect = comboboxes[1] as HTMLElement
    await act(async () => {
      fireEvent.mouseDown(targetSelect)
    })
    await waitFor(() => {
      expect(screen.queryAllByText(/clear target/i).length).toBeGreaterThan(0)
    })
  })

  it('does not include "Clear target" when skill has no target', async () => {
    renderRow(SKILL_UNASSESSED)
    // Open the target level dropdown
    const comboboxes = document.querySelectorAll('[role="combobox"]')
    const targetSelect = comboboxes[1] as HTMLElement
    await act(async () => {
      fireEvent.mouseDown(targetSelect)
    })
    await waitFor(() => {
      expect(screen.queryAllByText(/clear target/i).length).toBe(0)
    })
  })
})

// ── AC-018: "Link feedback" opens EvidenceModal ───────────────────────────────

describe('AssessmentSkillRow — AC-018: Link feedback modal', () => {
  it('renders "Link feedback" button in edit mode', () => {
    renderRow()
    expect(screen.queryByText(/link feedback/i)).not.toBeNull()
  })

  it('does not render "Link feedback" button in read-only mode', () => {
    renderRow(SKILL_ASSESSED, true)
    expect(screen.queryByText(/link feedback/i)).toBeNull()
  })

  it('opens EvidenceModal dialog when "Link feedback" is clicked', async () => {
    renderRow()
    const linkBtn = screen.getByText(/link feedback/i)
    fireEvent.click(linkBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeNull()
    })
  })

  it('shows "Link Evidence" title in the opened modal', async () => {
    renderRow()
    fireEvent.click(screen.getByText(/link feedback/i))
    await waitFor(() => {
      expect(screen.queryByText(/link evidence/i)).not.toBeNull()
    })
  })
})

// ── AC-021: Evidence items displayed below skill row ──────────────────────────

describe('AssessmentSkillRow — AC-021: Evidence items', () => {
  it('renders the sender display name of linked feedback', () => {
    renderRow()
    // SKILL_ASSESSED has evidence from Alice Johnson
    expect(screen.queryByText('Alice Johnson')).not.toBeNull()
  })

  it('renders a content excerpt of linked feedback', () => {
    renderRow()
    expect(
      screen.queryByText(/Great job leading the API review/)
    ).not.toBeNull()
  })
})

// ── AC-022: "Remove" evidence action ─────────────────────────────────────────

describe('AssessmentSkillRow — AC-022: Remove evidence', () => {
  it('renders a Remove evidence button in edit mode', () => {
    renderRow()
    expect(
      screen.queryByRole('button', { name: /remove evidence/i })
    ).not.toBeNull()
  })

  it('does not render Remove evidence button in read-only mode', () => {
    renderRow(SKILL_ASSESSED, true)
    expect(
      screen.queryByRole('button', { name: /remove evidence/i })
    ).toBeNull()
  })
})
