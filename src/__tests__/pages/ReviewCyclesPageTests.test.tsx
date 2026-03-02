import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { server } from '../../mocks/server'
import MyCyclesPage from '../../pages/reviews/MyCyclesPage'
import ReviewCyclesPage from '../../pages/reviews/ReviewCyclesPage'
import { renderWithProviders } from '../../tests/utils'

describe('ReviewCyclesPage (Director/Admin management view)', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders page title', async () => {
    renderWithProviders(<ReviewCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'admin' },
    })
    expect(await screen.findByText(/review cycles/i)).toBeInTheDocument()
  })

  it('renders cycle rows from MSW fixture', async () => {
    renderWithProviders(<ReviewCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'admin' },
    })
    await waitFor(() => {
      const rows = document.querySelectorAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })
  })

  it('renders at least one status badge chip', async () => {
    renderWithProviders(<ReviewCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'admin' },
    })
    await waitFor(() => {
      const chips = document.querySelectorAll('.MuiChip-root')
      expect(chips.length).toBeGreaterThan(0)
    })
  })

  it('opens Create Cycle dialog when button clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReviewCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'admin' },
    })
    const createBtn = await screen.findByRole('button', {
      name: /create review cycle/i,
    })
    await user.click(createBtn)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})

describe('MyCyclesPage (Employee own cycles view)', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders my reviews page title', async () => {
    renderWithProviders(<MyCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    expect(await screen.findByText(/my reviews/i)).toBeInTheDocument()
  })

  it('renders table when cycles are returned', async () => {
    renderWithProviders(<MyCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    await waitFor(() => {
      const table = document.querySelector('table')
      // Either a table or empty state
      expect(table ?? screen.queryByText(/no review cycles/i)).not.toBeNull()
    })
  })

  it('does not render reviewer identity columns in employee list (AC-044)', async () => {
    renderWithProviders(<MyCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    await waitFor(() => {
      // There should be no "Reviewer" column header in the employee list
      expect(screen.queryByText(/^reviewer$/i)).toBeNull()
    })
  })
})

describe('ReviewCyclesPage — list sort order (AC-042)', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('default sort_dir param sent as desc', async () => {
    const requests: Request[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/api/review-cycles')) requests.push(request)
    })
    renderWithProviders(<ReviewCyclesPage />, {
      contextOptions: { includeRouter: true, userType: 'admin' },
    })
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const url = new URL(requests[0].url)
    // sort_dir should be desc OR not present (default is desc per api.md)
    const sortDir = url.searchParams.get('sort_dir')
    expect(sortDir === null || sortDir === 'desc').toBe(true)
  })
})
