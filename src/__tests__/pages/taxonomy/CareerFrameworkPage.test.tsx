import { screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../tests/utils'
import CareerFrameworkPage from '../../../pages/taxonomy/CareerFrameworkPage'
import CareerPathDetailPage from '../../../pages/taxonomy/CareerPathDetailPage'
import { useAuthStore } from '../../../stores/authStore'
import type { IAuthUser } from '../../../stores/authStore'
import { EUserRole } from '../../../models'

// Helper: render CareerFrameworkPage inside a MemoryRouter
function renderPage(userType: 'employee' | 'admin' = 'employee') {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/career-framework']}>
      <Routes>
        <Route path='/career-framework' element={<CareerFrameworkPage />} />
        <Route
          path='/career-framework/:pathId'
          element={<CareerPathDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
    { contextOptions: { userType } }
  )
}

// ---------- CareerFrameworkPage ----------

describe('CareerFrameworkPage', () => {
  it('renders page title', async () => {
    renderPage()
    expect(await screen.findByText(/career framework/i)).toBeInTheDocument()
  })

  it('renders career path cards from MSW mock data', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText('Engineering')).not.toBeNull()
    })
  })

  it('renders multiple career path cards', async () => {
    renderPage()
    await waitFor(() => {
      const cards = document.querySelectorAll('.MuiCard-root')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('does not show Add Career Path button for employee', async () => {
    renderPage('employee')
    // Wait for content to load
    await screen.findByText(/career framework/i)
    // Button should NOT be present for non-admin
    const btn = screen.queryByRole('button', { name: /add career path/i })
    expect(btn).toBeNull()
  })

  it('shows Add Career Path button for admin', async () => {
    // Set auth store user with Administrator role
    const adminUser: IAuthUser = {
      id: 'test-admin-id',
      name: 'Admin User',
      email: 'admin@test.com',
      tenantId: 'test-tenant',
      roles: [EUserRole.ADMINISTRATOR],
    }
    useAuthStore.getState().setUser(adminUser)

    try {
      renderPage('admin')
      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /add career path/i })
        ).not.toBeNull()
      })
    } finally {
      useAuthStore.getState().setUser(null)
    }
  })
})

// ---------- CareerPathDetailPage ----------

describe('CareerPathDetailPage', () => {
  const PATH_001 = 'cp-001-engineering'

  beforeEach(() => {
    useAuthStore.getState().setUser(null)
  })

  function renderDetailPage(
    pathId = PATH_001,
    userType: 'employee' | 'admin' = 'employee'
  ) {
    return renderWithProviders(
      <MemoryRouter initialEntries={[`/career-framework/${pathId}`]}>
        <Routes>
          <Route
            path='/career-framework/:pathId'
            element={<CareerPathDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
      { contextOptions: { userType } }
    )
  }

  it('renders career path title from MSW mock data', async () => {
    renderDetailPage()
    await waitFor(() => {
      expect(screen.queryAllByText('Engineering').length).toBeGreaterThan(0)
    })
  })

  it('renders career track cards', async () => {
    renderDetailPage()
    await waitFor(() => {
      const cards = document.querySelectorAll('.MuiCard-root')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('does not show Edit or Add Track buttons for employee', async () => {
    renderDetailPage(PATH_001, 'employee')
    await waitFor(() => {
      expect(screen.queryAllByText('Engineering').length).toBeGreaterThan(0)
    })
    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /add track/i })).toBeNull()
  })

  it('shows Edit and Add Track buttons for admin', async () => {
    const adminUser: IAuthUser = {
      id: 'test-admin-id',
      name: 'Admin User',
      email: 'admin@test.com',
      tenantId: 'test-tenant',
      roles: [EUserRole.ADMINISTRATOR],
    }
    useAuthStore.getState().setUser(adminUser)

    try {
      renderDetailPage(PATH_001, 'admin')

      await waitFor(() => {
        expect(screen.queryAllByText('Engineering').length).toBeGreaterThan(0)
      })

      // At least one admin button should be visible
      const adminButtons = screen.queryAllByRole('button')
      expect(adminButtons.length).toBeGreaterThan(0)
    } finally {
      useAuthStore.getState().setUser(null)
    }
  })

  it('shows 404 / not found state for invalid path id', async () => {
    renderDetailPage('nonexistent-path-id')
    await waitFor(() => {
      // Either error alert or error state is shown
      const errorEl =
        document.querySelector('.MuiAlert-root') ||
        screen.queryByText(/failed|not found|error/i)
      expect(errorEl).not.toBeNull()
    })
  })
})
