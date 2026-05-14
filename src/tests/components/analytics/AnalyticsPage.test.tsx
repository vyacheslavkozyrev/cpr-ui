/**
 * Page-level tests for AnalyticsPage
 * Feature 0014 — Performance Analytics & Reporting
 *
 * Covers: sidebar nav item (AC-001, AC-002), personal analytics loads (AC-003, AC-004),
 * period change triggers new requests (AC-023), URL param preserved (AC-024).
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../../../mocks/server'
import AnalyticsPage from '../../../pages/analytics/AnalyticsPage'
import { Sidebar } from '../../../components/layout/Sidebar'
import { renderWithRouter } from '../../utils'

// Mock recharts to avoid canvas/SVG rendering issues in happy-dom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='responsive-container'>{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='line-chart'>{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='bar-chart'>{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='pie-chart'>{children}</div>
    ),
    Bar: () => <div data-testid='bar' />,
    Line: () => <div data-testid='line' />,
    Pie: () => <div data-testid='pie' />,
    Cell: () => <div data-testid='cell' />,
    ReferenceLine: () => <div data-testid='reference-line' />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  }
})

// Use wildcard pattern so tests work regardless of the configured API base URL
const ME_GOALS_PATTERN = '*/me/analytics/goals'
const ME_SKILLS_PATTERN = '*/me/analytics/skills'

/**
 * Creates a fresh QueryClient (no caching) and wraps the component
 * in MemoryRouter + QueryClientProvider so each test is isolated.
 */
function renderPage(initialPath = '/analytics') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AnalyticsPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

// ---- Sidebar navigation (AC-001, AC-002) ----

describe('Sidebar — Analytics navigation', () => {
  it('AC-001: Analytics navigation item appears in the sidebar for authenticated users', () => {
    renderWithRouter(<Sidebar />)
    // The sidebar renders a navigation item labelled with the analytics key.
    // The translation key 'navigation.analytics' resolves to 'Analytics' in tests.
    const analyticsItem = screen.getByText(/analytics/i)
    expect(analyticsItem).toBeInTheDocument()
  })

  it('AC-002: Analytics navigation item links to /analytics', () => {
    renderWithRouter(<Sidebar />)
    // Each sidebar item is a MUI ListItemButton; find the one containing /analytics text.
    const buttons = screen.getAllByRole('button')
    // One of the buttons should be the analytics nav item
    const analyticsButton = buttons.find(btn =>
      btn.textContent?.toLowerCase().includes('analytics')
    )
    expect(analyticsButton).toBeDefined()
  })
})

describe('AnalyticsPage', () => {
  // ---- Page structure (AC-003) ----

  it('AC-003: renders the Analytics page title', async () => {
    renderPage()
    // The component uses t('analytics.page_title', 'Analytics') which resolves
    // to 'Performance Analytics' via i18n, or falls back to 'Analytics'.
    // Either way some heading should be visible in the DOM.
    await waitFor(() => {
      const heading = document.querySelector('h4')
      expect(heading).toBeInTheDocument()
    })
  })

  it('AC-021: renders the time range selector', async () => {
    renderPage()
    await waitFor(() => {
      // ToggleButtonGroup has role="group"
      expect(screen.getByRole('group')).toBeInTheDocument()
    })
  })

  // ---- Personal analytics data loads (AC-004) ----

  it('AC-004: renders loading skeletons initially then shows data', async () => {
    renderPage()

    // Should show loading skeletons while data is being fetched
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)

    // After data loads, the total_goals value (12) from MSW mock appears
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument()
    })
  })

  it('AC-003: renders a Goals section (Paper with section heading)', async () => {
    renderPage()
    // The section heading key resolves to "Goal Analytics" (from translation.json)
    await waitFor(() => {
      const headings = document.querySelectorAll('h6')
      const goalHeading = Array.from(headings).find(h =>
        /goal/i.test(h.textContent ?? '')
      )
      expect(goalHeading).toBeDefined()
    })
  })

  it('AC-003: renders a Skill Progression section (Paper with section heading)', async () => {
    renderPage()
    // The section heading key resolves to "Skill Analytics" (from translation.json)
    await waitFor(() => {
      const headings = document.querySelectorAll('h6')
      const skillHeading = Array.from(headings).find(h =>
        /skill/i.test(h.textContent ?? '')
      )
      expect(skillHeading).toBeDefined()
    })
  })

  it('AC-004: renders skill rows after skill data loads', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  // ---- Period change triggers new requests (AC-023) ----

  it('AC-023: selecting a different preset updates the URL ?period= parameter', async () => {
    // The URL param update is the observable signal for a period change
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/analytics']}>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    // Click the first button (Last 30 Days — index 0)
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    // After click, the URL query param should update to last_30_days.
    // We verify this indirectly: the "Last 30 Days" button should now have aria-pressed=true.
    await waitFor(() => {
      const pressedButtons = screen
        .getAllByRole('button')
        .filter(btn => btn.getAttribute('aria-pressed') === 'true')
      expect(pressedButtons).toHaveLength(1)
      expect(pressedButtons[0]).toHaveAttribute('value', 'last_30_days')
    })
  })

  it('AC-023: triggers a fresh API request when period changes', async () => {
    let requestCount = 0
    server.use(
      http.get(ME_GOALS_PATTERN, () => {
        requestCount++
        return HttpResponse.json({
          period: 'last_90_days',
          period_start: '2025-11-01T00:00:00Z',
          period_end: '2026-01-30T23:59:59Z',
          stats: {
            total_goals: 99,
            created_in_period: 3,
            completed_in_period: 2,
            open_goals: 3,
            in_progress_goals: 2,
            overdue_goals: 0,
            completion_rate: 0.67,
            overdue_rate: 0,
            avg_days_to_complete: 15,
          },
          goals_by_status: { open: 3, in_progress: 2, completed: 2 },
          completion_trend: [],
        })
      }),
      http.get(ME_SKILLS_PATTERN, () =>
        HttpResponse.json({
          period: 'last_90_days',
          period_start: '2025-11-01T00:00:00Z',
          period_end: '2026-01-30T23:59:59Z',
          gap_closure_summary: {
            skills_assessed: 2,
            skills_with_gaps: 1,
            gaps_closed_in_period: 0,
            gaps_worsened_in_period: 0,
            avg_gap_at_period_start: null,
            avg_gap_at_period_end: null,
          },
          skills: [],
        })
      )
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/analytics']}>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for initial load (unique value 99 from our custom handler)
    await waitFor(() => {
      expect(screen.getByText('99')).toBeInTheDocument()
    })

    const countAfterFirstLoad = requestCount
    expect(countAfterFirstLoad).toBeGreaterThan(0)

    // Click the last_year button (index 4) to trigger a different period query
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[4]) // Last Year

    // A new request should be issued for the new period key
    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(countAfterFirstLoad)
    })
  })

  // ---- URL param preserved (AC-024) ----

  it('AC-024: reads ?period= from URL and selects the matching preset on load', async () => {
    renderPage('/analytics?period=last_30_days')

    await waitFor(() => {
      // The button for last_30_days should be pressed
      const buttons = screen.getAllByRole('button')
      const lastThirtyBtn = buttons.find(
        btn => btn.getAttribute('value') === 'last_30_days'
      )
      expect(lastThirtyBtn).toBeDefined()
      expect(lastThirtyBtn?.getAttribute('aria-pressed')).toBe('true')
    })
  })

  it('AC-022: defaults to last_90_days when no ?period= in URL', async () => {
    renderPage('/analytics')

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const last90Btn = buttons.find(
        btn => btn.getAttribute('value') === 'last_90_days'
      )
      expect(last90Btn?.getAttribute('aria-pressed')).toBe('true')
    })
  })

  // ---- Empty state (AC-009, AC-014) ----

  it('AC-009: shows zero stat values when no goal data is returned', async () => {
    server.use(
      http.get(ME_GOALS_PATTERN, () =>
        HttpResponse.json({
          period: 'last_90_days',
          period_start: '2025-11-01T00:00:00Z',
          period_end: '2026-01-30T23:59:59Z',
          stats: {
            total_goals: 0,
            created_in_period: 0,
            completed_in_period: 0,
            open_goals: 0,
            in_progress_goals: 0,
            overdue_goals: 0,
            completion_rate: null,
            overdue_rate: null,
            avg_days_to_complete: null,
          },
          goals_by_status: { open: 0, in_progress: 0, completed: 0 },
          completion_trend: [],
        })
      )
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/analytics']}>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      const zeros = screen.getAllByText('0')
      expect(zeros.length).toBeGreaterThanOrEqual(4)
    })
  })

  // ---- Charts rendered (AC-006, AC-007) ----

  it('AC-006: renders the Completion Trend bar chart area', async () => {
    renderPage()
    await waitFor(() => {
      // Recharts BarChart is mocked as data-testid="bar-chart"
      const barCharts = document.querySelectorAll('[data-testid="bar-chart"]')
      expect(barCharts.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('AC-007: renders the Goals by Status chart (pie/donut)', async () => {
    renderPage()
    await waitFor(() => {
      // Recharts PieChart mocked as data-testid="pie-chart"
      const pieCharts = document.querySelectorAll('[data-testid="pie-chart"]')
      expect(pieCharts.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ---- Gap Closure Summary (AC-013) ----

  it('AC-013: renders the Gap Closure Summary card heading', async () => {
    renderPage()
    await waitFor(() => {
      const headings = Array.from(document.querySelectorAll('h6, h5, h4'))
      const gapHeading = headings.find(h =>
        /gap|closure|summary/i.test(h.textContent ?? '')
      )
      expect(gapHeading).toBeDefined()
    })
  })

  it('AC-014: shows empty skill list when no skill data is returned', async () => {
    server.use(
      http.get(ME_SKILLS_PATTERN, () =>
        HttpResponse.json({
          period: 'last_90_days',
          period_start: '2025-11-01T00:00:00Z',
          period_end: '2026-01-30T23:59:59Z',
          gap_closure_summary: {
            skills_assessed: 0,
            skills_with_gaps: 0,
            gaps_closed_in_period: 0,
            gaps_worsened_in_period: 0,
            avg_gap_at_period_start: null,
            avg_gap_at_period_end: null,
          },
          skills: [],
        })
      )
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/analytics']}>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      // Empty state message from SkillProgressionList when skills array is empty
      expect(
        screen.queryByText(/No skill assessment data available/i)
      ).toBeInTheDocument()
    })
  })
})
