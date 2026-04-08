/**
 * Unit tests for GapAnalysisPage
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { QueryClient } from '@tanstack/react-query'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { TCreateGoalDto } from '@/dtos/GoalDto'
import * as gapAnalysisQueryService from '@/services/gapAnalysisQueryService'
import { mockOwnGapAnalysis } from '@/mocks/data/gapAnalysisMockData'
import {
  clearOwnGapAnalysisScenario,
  setOwnGapAnalysisScenario,
} from '@/mocks/handlers/gapAnalysisHandlers'
import { server } from '@/mocks/server'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/tests/utils'
import GapAnalysisPage from './GapAnalysisPage'

// ── Mock setup ─────────────────────────────────────────────────────────────────
// Mock useMyGapAnalysis so error-state tests can inject controlled error returns
// without waiting through React Query retry backoffs.
const mockUseMyGapAnalysis = vi.hoisted(() => vi.fn())

vi.mock('@/services/gapAnalysisQueryService', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/services/gapAnalysisQueryService')>()
  return {
    ...actual,
    useMyGapAnalysis: mockUseMyGapAnalysis,
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'

const makeFreshQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

const renderPage = (userType: 'employee' | 'manager' | 'admin' = 'employee') =>
  renderWithProviders(<GapAnalysisPage />, {
    contextOptions: {
      userType,
      includeRouter: true,
      queryClient: makeFreshQueryClient(),
    },
  })

// ── Tests ─────────────────────────────────────────────────────────────────────

// Capture the real hook implementation so non-error tests go through MSW
let realUseMyGapAnalysis:
  | (() => ReturnType<typeof gapAnalysisQueryService.useMyGapAnalysis>)
  | null = null

beforeAll(async () => {
  const actual = await vi.importActual<
    typeof import('@/services/gapAnalysisQueryService')
  >('@/services/gapAnalysisQueryService')
  realUseMyGapAnalysis = actual.useMyGapAnalysis
  mockUseMyGapAnalysis.mockImplementation(realUseMyGapAnalysis!)
})

// After each test: clear scenario state and reset mock to real implementation
afterEach(() => {
  clearOwnGapAnalysisScenario()
  mockUseMyGapAnalysis.mockReset()
  if (realUseMyGapAnalysis) {
    mockUseMyGapAnalysis.mockImplementation(realUseMyGapAnalysis)
  }
})

describe('GapAnalysisPage', () => {
  describe('loading state', () => {
    it('renders loading skeletons while data is fetching', () => {
      // Delay the handler so the loading state is visible
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(mockOwnGapAnalysis)
        })
      )
      renderPage()
      // Skeleton elements render while loading
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('successful data load', () => {
    it('renders the page title after data loads', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
    })

    it('displays current and next position names in subtitle', async () => {
      renderPage()
      await waitFor(() => {
        // The subtitle renders "Current: Junior Software Engineer → Next: Software Engineer"
        // Use exact phrase to avoid matching the career track "Software Engineering"
        expect(
          screen.getByText(/Junior Software Engineer.*Next:/i)
        ).toBeInTheDocument()
      })
    })

    it('renders the skills table with skill rows', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
      })
    })

    it('renders the chart container', async () => {
      renderPage()
      await waitFor(() => {
        // Either radar or bar chart container should be present
        expect(screen.getByRole('img')).toBeInTheDocument()
      })
    })

    it('shows Create Goal button for employee role', async () => {
      renderPage('employee')
      await waitFor(() => {
        // At least one Create Goal button (for gaps > 0)
        expect(
          screen.getAllByRole('button', { name: /create goal/i }).length
        ).toBeGreaterThan(0)
      })
    })

    it('does not show Create Goal button for admin role', async () => {
      // Set Administrator role in auth store so hasAnyRole([ADMINISTRATOR]) returns true
      useAuthStore.setState(state => ({
        ...state,
        user: state.user
          ? { ...state.user, roles: ['Administrator'] }
          : ({ roles: ['Administrator'] } as never),
      }))
      renderPage('admin')
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
      // Reset auth store after test
      useAuthStore.setState(state => ({
        ...state,
        user: state.user ? { ...state.user, roles: [] } : null,
      }))
    })
  })

  describe('at highest level (null nextPosition)', () => {
    beforeEach(() => {
      setOwnGapAnalysisScenario('at-highest-level')
    })

    it('shows the at-highest-level info alert', async () => {
      renderPage()
      await waitFor(() => {
        expect(
          screen.getByText(/highest level in your career track/i)
        ).toBeInTheDocument()
      })
    })

    it('does not render the chart or table when at highest level', async () => {
      setOwnGapAnalysisScenario('at-highest-level')
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/highest level/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('goal creation inline update (AC-015)', () => {
    it('new goal appears inline in the skill row after creation without full page reload', async () => {
      const user = userEvent.setup()
      let goalCreated = false

      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, () => {
          if (goalCreated) {
            // Return data with new goal in System Design linked goals
            return HttpResponse.json({
              ...mockOwnGapAnalysis,
              skill_gaps: mockOwnGapAnalysis.skill_gaps.map(sg =>
                sg.skill.id === 'skill-003'
                  ? {
                      ...sg,
                      linked_goals: [
                        {
                          id: 'new-goal-015',
                          title: 'Improve System Design to Basic',
                          progress_percentage: 0,
                          status: 'open',
                        },
                      ],
                    }
                  : sg
              ),
            })
          }
          return HttpResponse.json(mockOwnGapAnalysis)
        }),
        http.post(`${API_BASE}/Goals`, async ({ request }) => {
          goalCreated = true
          const body = (await request.json()) as TCreateGoalDto
          return HttpResponse.json(
            {
              id: 'new-goal-015',
              employeeId: 'emp-own',
              title: body.title,
              status: 'open',
              isCompleted: false,
              progressPercent: 0,
              createdAt: new Date().toISOString(),
              tasks: [],
            },
            { status: 201 }
          )
        })
      )

      renderPage()
      await waitFor(() => {
        expect(screen.getByText('System Design')).toBeInTheDocument()
      })

      // Click Create Goal for System Design (Architecture category)
      const systemDesignCell = screen.getByText('System Design')
      const systemDesignRow = systemDesignCell.closest('tr')!
      const createGoalBtn = within(systemDesignRow).getByRole('button', {
        name: /create goal/i,
      })
      await user.click(createGoalBtn)

      await waitFor(() => {
        expect(screen.getByText(/create goal from gap/i)).toBeInTheDocument()
      })

      // Submit the pre-populated form
      await user.click(screen.getByRole('button', { name: /^create goal$/i }))

      // React Query invalidates the cache and refetches — new goal should appear inline
      await waitFor(
        () => {
          expect(
            screen.getByText(/Improve System Design to Basic/)
          ).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('error states', () => {
    const makeErrorReturn = (status: number) =>
      ({
        data: undefined,
        isLoading: false,
        isPending: false,
        isError: true,
        error: Object.assign(new Error('http error'), { status }),
        refetch: vi.fn(),
        isFetching: false,
        isSuccess: false,
        status: 'error' as const,
      }) as ReturnType<typeof gapAnalysisQueryService.useMyGapAnalysis>

    it('shows no-position-assigned warning for 422 error', async () => {
      mockUseMyGapAnalysis.mockReturnValue(makeErrorReturn(422))
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/no position.*assigned/i)).toBeInTheDocument()
      })
    })

    it('shows generic error alert and reload button for non-422, non-401 errors', async () => {
      mockUseMyGapAnalysis.mockReturnValue(makeErrorReturn(500))
      renderPage()
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load gap analysis/i)
        ).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument()
    })

    it('renders nothing for 401 error', async () => {
      mockUseMyGapAnalysis.mockReturnValue(makeErrorReturn(401))
      const { container } = renderPage()
      await waitFor(() => {
        expect(container.firstChild).toBeDefined()
      })
      expect(screen.queryByText(/skills gap analysis/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
