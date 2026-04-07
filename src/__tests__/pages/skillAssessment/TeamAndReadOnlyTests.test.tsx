import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../../../mocks/server'
import TeamSkillOverviewPage from '../../../pages/skillAssessment/TeamSkillOverviewPage'
import EmployeeAssessmentPage from '../../../pages/skillAssessment/EmployeeAssessmentPage'
import { renderWithProviders } from '../../../tests/utils'
import { useAuthStore } from '../../../stores/authStore'

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

// ── AC-030/AC-031/AC-032/AC-033: Manager Assessment column ───────────────────

describe('EmployeeAssessmentPage (manager role)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    useAuthStore.getState().setUser(null)
  })
  afterAll(() => server.close())

  function renderAsManager(employeeId = 'emp-002') {
    // Set the auth user with People Manager role so isManager = true
    useAuthStore.getState().setUser({
      id: 'mgr-001',
      name: 'Peter Manager',
      email: 'peter@company.com',
      tenantId: 'test-tenant',
      roles: ['People Manager'],
    })
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

  // AC-030: Manager Assessment column visible with numeric input for manager role
  it('renders Manager Assessment column header for manager', async () => {
    renderAsManager()
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    expect(screen.queryAllByText(/manager assessment/i).length).toBeGreaterThan(
      0
    )
  })

  // AC-031: PeopleManager can type and save on blur
  it('renders a numeric input for manager assessment value', async () => {
    renderAsManager()
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    // At least one number input should be visible (manager assessment field)
    const numericInputs = document.querySelectorAll('input[type="number"]')
    expect(numericInputs.length).toBeGreaterThan(0)
  })

  // AC-033: "Saved ✓" indicator after successful manager assessment save
  it('shows Saved indicator after manager assessment blur', async () => {
    renderAsManager()
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    const numericInputs = document.querySelectorAll('input[type="number"]')
    expect(numericInputs.length).toBeGreaterThan(0)
    const managerInput = numericInputs[
      numericInputs.length - 1
    ] as HTMLInputElement
    fireEvent.change(managerInput, { target: { value: '4' } })
    fireEvent.blur(managerInput)
    await waitFor(() => {
      expect(screen.queryByText(/saved/i)).not.toBeNull()
    })
  })

  // AC-032: Employee role sees manager_assessment_value as read-only text (no input)
  it('does not render manager input for employee role', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/skills/employees/emp-002/assessment']}>
        <Routes>
          <Route
            path='/skills/employees/:employeeId/assessment'
            element={<EmployeeAssessmentPage />}
          />
        </Routes>
      </MemoryRouter>,
      { contextOptions: { userType: 'employee' } }
    )
    await waitFor(() => {
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
    // No numeric inputs should appear when employee (isManager=false)
    const numericInputs = document.querySelectorAll('input[type="number"]')
    expect(numericInputs.length).toBe(0)
  })
})
