/**
 * Component tests for AssessmentSkillRow
 *
 * Covers:
 * AC-003 — Skill row displays title, required level, and numeric self-assessment
 * AC-018 — "Link feedback" opens EvidenceModal dialog
 * AC-021 — Evidence items displayed below skill row
 * AC-022 — "Remove" evidence action visible / hidden in read-only
 */

import { Table, TableBody } from '@mui/material'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AssessmentSkillRow from '../../../components/skillAssessment/AssessmentSkillRow'
import { mockSkillAssessmentResponse } from '../../../mocks/data/skillAssessmentMockData'
import { renderWithProviders } from '../../../tests/utils'

// TypeScript: self_assessment_value=2, has one evidence item
const SKILL_ASSESSED = mockSkillAssessmentResponse.skill_categories[0].skills[0]
// System Design: no assessment, no evidence
const SKILL_UNASSESSED =
  mockSkillAssessmentResponse.skill_categories[0].skills[1]

function renderRow(skill = SKILL_ASSESSED, readOnly = false) {
  return renderWithProviders(
    <MemoryRouter>
      <Table>
        <TableBody>
          <AssessmentSkillRow skill={skill} readOnly={readOnly} />
        </TableBody>
      </Table>
    </MemoryRouter>
  )
}

// ── AC-003: Skill row displays title, required level, assessed value ───────────

describe('AssessmentSkillRow — AC-003: skill row content', () => {
  it('renders skill title', () => {
    renderRow()
    expect(screen.queryByText('TypeScript')).not.toBeNull()
  })

  it('renders required level badge chip', () => {
    renderRow()
    // required_level.title = 'Advanced' for the TypeScript skill
    expect(screen.getAllByText('Advanced').length).toBeGreaterThan(0)
  })

  it('shows assessed numeric value in read-only mode', () => {
    renderRow(SKILL_ASSESSED, true)
    // assessed.self_assessment_value = 2
    expect(screen.queryByText('2')).not.toBeNull()
  })

  it('renders numeric input in edit mode', () => {
    renderRow(SKILL_ASSESSED)
    const input = document.querySelector('input[type="number"]')
    expect(input).not.toBeNull()
    expect((input as HTMLInputElement).value).toBe('2')
  })

  it('shows "Not assessed" placeholder in read-only mode when unassessed', () => {
    renderRow(SKILL_UNASSESSED, true)
    expect(screen.queryByText(/not assessed/i)).not.toBeNull()
  })

  it('shows validation error when value is zero or negative', async () => {
    renderRow(SKILL_UNASSESSED)
    const input = document.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement
    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.blur(input)
    await waitFor(() => {
      expect(screen.queryByText(/must be greater than 0/i)).not.toBeNull()
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
