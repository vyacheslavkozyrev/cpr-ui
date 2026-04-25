/**
 * SkillsSectionManager Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-037: Skill name, self-rating, and manager rating are displayed
 * - AC-038: Unassessed skills show "—" placeholder
 * - AC-039: Gap analysis section is rendered when data is available
 */

import { screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { http, HttpResponse } from 'msw'
import { i18n } from '../../../config/i18n'
import { server } from '../../../mocks/server'
import { skillAssessmentHandlers } from '../../../mocks/handlers/skillAssessmentHandlers'
import { gapAnalysisHandlers } from '../../../mocks/handlers/gapAnalysisHandlers'
import { SkillsSectionManager } from './SkillsSectionManager'

const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.['VITE_API_BASE_URL']) ||
  'http://localhost:3000/api'

function renderComponent(employeeId = 'emp-002') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <SkillsSectionManager employeeId={employeeId} />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  server.use(...skillAssessmentHandlers, ...gapAnalysisHandlers)
})

describe('SkillsSectionManager — AC-037: Skill assessments table', () => {
  it('renders the Skills section title', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Skills')).toBeInTheDocument()
    })
  })

  it('renders skill name from skill_categories', async () => {
    renderComponent()
    // Mock data has skill_title: 'TypeScript' in skill_categories[0].skills[0]
    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('renders self-assessment column header', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Self')).toBeInTheDocument()
    })
  })

  it('renders manager-assessment column header', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })
  })

  it('renders self-assessment value when assessed', async () => {
    renderComponent()
    // mockEmployeeSkillAssessmentResponse has self_assessment_value: 2 for TypeScript
    // Multiple "2" elements may exist (table cells, etc.)
    await waitFor(() => {
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('SkillsSectionManager — AC-038: Unassessed skills show placeholder', () => {
  it('shows "—" placeholder when manager_assessment_value is null', async () => {
    renderComponent()
    // TypeScript skill has manager_assessment_value: null → renders "—"
    await waitFor(() => {
      // There may be multiple "—" (one per unassessed field)
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows "—" placeholder for skills with no assessment at all', async () => {
    // Override handler to return a skill with no assessed object
    server.use(
      http.get(`${API_BASE}/employees/:employeeId/skill-assessment`, () =>
        HttpResponse.json({
          employee: { id: 'emp-002', display_name: 'Jane Smith' },
          skill_categories: [
            {
              id: 'cat-x',
              title: 'Technical',
              skills: [
                {
                  skill_id: 'skill-x',
                  skill_title: 'Unassessed Skill',
                  assessed: null,
                },
              ],
            },
          ],
        })
      )
    )

    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Unassessed Skill')).toBeInTheDocument()
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBe(2) // both self and manager show "—"
    })
  })
})

describe('SkillsSectionManager — AC-039: Gap analysis section', () => {
  it('renders Gap Analysis section when data is available', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Gap Analysis')).toBeInTheDocument()
    })
  })

  it('renders gap analysis description text', async () => {
    renderComponent()
    await waitFor(() => {
      expect(
        screen.getByText(
          'Skills below the required level for the current or target position.'
        )
      ).toBeInTheDocument()
    })
  })
})
