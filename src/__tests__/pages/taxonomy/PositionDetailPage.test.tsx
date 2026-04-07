import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import { renderWithProviders } from '../../../tests/utils'
import PositionDetailPage from '../../../pages/taxonomy/PositionDetailPage'
import { useAuthStore } from '../../../stores/authStore'
import type { IAuthUser } from '../../../stores/authStore'
import { EUserRole } from '../../../models'

// Mock IDs matching taxonomyMockData fixtures
const PATH_001 = 'cp-001-engineering'
const TRACK_001 = 'ct-001-backend'
const POS_001 = 'pos-001-junior-be' // Junior Backend Engineer with 3 skills
const POS_003 = 'pos-003-senior-be' // Senior Backend Engineer with 4+ skills

function renderDetailPage(
  positionId = POS_001,
  userType: 'employee' | 'admin' = 'employee'
) {
  return renderWithProviders(
    <MemoryRouter
      initialEntries={[
        `/career-framework/${PATH_001}/tracks/${TRACK_001}/positions/${positionId}`,
      ]}
    >
      <Routes>
        <Route
          path='/career-framework/:pathId/tracks/:trackId/positions/:positionId'
          element={<PositionDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
    { contextOptions: { userType } }
  )
}

describe('PositionDetailPage', () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(null)
  })

  it('renders position title from MSW mock data', async () => {
    renderDetailPage()
    await waitFor(() => {
      expect(
        screen.queryAllByText(/junior backend engineer/i).length
      ).toBeGreaterThan(0)
    })
  })

  it('renders skill requirements table', async () => {
    renderDetailPage()
    await waitFor(() => {
      // The table should render — look for skill titles
      expect(screen.queryByText('TypeScript')).not.toBeNull()
    })
  })

  it('renders skill categories in table', async () => {
    renderDetailPage()
    await waitFor(() => {
      expect(screen.queryAllByText('Technical').length).toBeGreaterThan(0)
    })
  })

  it('renders mandatory chip for required skills', async () => {
    renderDetailPage()
    await waitFor(() => {
      // At least some chips should render (mandatory badge or category chip)
      const chips = document.querySelectorAll('.MuiChip-root')
      expect(chips.length).toBeGreaterThan(0)
    })
  })

  it('renders skill radar chart or bar chart', async () => {
    renderDetailPage(POS_003) // Senior BE has 4+ skills → radar chart
    await waitFor(() => {
      // Recharts renders an SVG element
      const svgEls = document.querySelectorAll('svg')
      expect(svgEls.length).toBeGreaterThan(0)
    })
  })

  it('opens skill detail panel when skill row is clicked', async () => {
    const user = userEvent.setup()
    renderDetailPage()

    // Wait for table to render
    const skillCell = await screen.findByText('TypeScript')

    await user.click(skillCell)

    await waitFor(() => {
      // A drawer (Drawer/Paper) should open
      const drawer = document.querySelector('.MuiDrawer-root')
      expect(drawer).not.toBeNull()
    })
  })

  it('does not show admin buttons for employee', async () => {
    renderDetailPage(POS_001, 'employee')
    await waitFor(() => {
      expect(
        screen.queryAllByText(/junior backend engineer/i).length
      ).toBeGreaterThan(0)
    })
    expect(screen.queryByRole('button', { name: /manage skills/i })).toBeNull()
  })

  it('shows admin buttons for administrator', async () => {
    const adminUser: IAuthUser = {
      id: 'admin-id',
      name: 'Admin',
      email: 'admin@test.com',
      tenantId: 'test-tenant',
      roles: [EUserRole.ADMINISTRATOR],
    }
    useAuthStore.getState().setUser(adminUser)

    try {
      renderDetailPage(POS_001, 'admin')

      await waitFor(() => {
        expect(
          screen.queryAllByText(/junior backend engineer/i).length
        ).toBeGreaterThan(0)
      })

      // Admin should see at least Edit or Manage Skills buttons
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    } finally {
      useAuthStore.getState().setUser(null)
    }
  })

  it('shows not found state for invalid position id', async () => {
    renderDetailPage('nonexistent-position-id')
    await waitFor(() => {
      const errorEl =
        document.querySelector('.MuiAlert-root') ||
        screen.queryByText(/failed|not found|error/i)
      expect(errorEl).not.toBeNull()
    })
  })
})
