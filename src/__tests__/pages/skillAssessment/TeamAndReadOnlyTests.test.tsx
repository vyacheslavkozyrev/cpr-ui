import { screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../../../mocks/server'
import TeamSkillOverviewPage from '../../../pages/skillAssessment/TeamSkillOverviewPage'
import EmployeeAssessmentPage from '../../../pages/skillAssessment/EmployeeAssessmentPage'
import { renderWithProviders } from '../../../tests/utils'

function renderTeamPage() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/skills/team']}>
      <Routes>
        <Route path='/skills/team' element={<TeamSkillOverviewPage />} />
      </Routes>
    </MemoryRouter>,
    { contextOptions: { userType: 'manager' } }
  )
}

function renderEmployeeAssessmentPage(employeeId = 'emp-002') {
  return renderWithProviders(
    <MemoryRouter
      initialEntries={[`/skills/employees/${employeeId}/assessment`]}
    >
      <Routes>
        <Route
          path='/skills/employees/:employeeId/assessment'
          element={<EmployeeAssessmentPage />}
        />
      </Routes>
    </MemoryRouter>,
    { contextOptions: { userType: 'manager' } }
  )
}

describe('TeamSkillOverviewPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders the page title', async () => {
    renderTeamPage()
    await waitFor(() => {
      expect(screen.queryByText(/team skill overview/i)).not.toBeNull()
    })
  })

  it('renders all 3 team members from mock data', async () => {
    renderTeamPage()
    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeNull()
      expect(screen.queryByText('Bob Chen')).not.toBeNull()
      expect(screen.queryByText('Maria Garcia')).not.toBeNull()
    })
  })
})

describe('EmployeeAssessmentPage (read-only)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders the read-only banner with employee name', async () => {
    renderEmployeeAssessmentPage()
    await waitFor(() => {
      // The banner text includes the employee name inline: "Viewing assessment for: Jane Smith"
      expect(screen.queryByText(/viewing assessment for/i)).not.toBeNull()
      expect(screen.queryByText(/Jane Smith/i)).not.toBeNull()
    })
  })

  it('does not render Select dropdowns in read-only mode', async () => {
    renderEmployeeAssessmentPage()
    await waitFor(() => {
      // Wait for data to load — skill title should appear
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    // No MUI Select combobox should be rendered
    const selects = document.querySelectorAll('[role="combobox"]')
    expect(selects.length).toBe(0)
  })

  it('does not render Link feedback button in read-only mode', async () => {
    renderEmployeeAssessmentPage()
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    expect(screen.queryByText(/link feedback/i)).toBeNull()
  })

  it('shows 403 error alert for forbidden access', async () => {
    server.use(
      http.get('*/api/employees/:employeeId/skill-assessment', () =>
        HttpResponse.json(
          { error: { code: 'forbidden', message: 'Forbidden' } },
          { status: 403 }
        )
      )
    )
    renderEmployeeAssessmentPage()
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeNull()
    })
  })
})
