/**
 * Unit tests for EmployeeGapAnalysisPage
 * Feature 0009 — Skills Gap Analysis & Development Planning
 * Covers: AC-019, AC-020, AC-021, AC-022, AC-023, AC-024, AC-025, AC-026, AC-027
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material'
import { I18nextProvider } from 'react-i18next'
import type { TCreateGoalDto } from '@/dtos/GoalDto'
import { mockEmployeeGapAnalysis } from '@/mocks/data/gapAnalysisMockData'
import { server } from '@/mocks/server'
import * as gapAnalysisQueryService from '@/services/gapAnalysisQueryService'
import { i18n } from '@/config/i18n'
import { useAuthStore } from '@/stores/authStore'
import EmployeeGapAnalysisPage from './EmployeeGapAnalysisPage'

// ── Mock setup ─────────────────────────────────────────────────────────────────
// Mock useEmployeeGapAnalysis so the 500-error test can inject a controlled error
// return without waiting through React Query retry backoffs.
const mockUseEmployeeGapAnalysis = vi.hoisted(() => vi.fn())

vi.mock('@/services/gapAnalysisQueryService', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/services/gapAnalysisQueryService')>()
  return {
    ...actual,
    useEmployeeGapAnalysis: mockUseEmployeeGapAnalysis,
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'

const theme = createTheme()

const makeFreshQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

const renderEmployeePage = (
  employeeId = 'emp-test-001',
  roles: string[] = ['People Manager']
) => {
  useAuthStore.setState(state => ({
    ...state,
    user: state.user ? { ...state.user, roles } : ({ roles } as never),
  }))

  return render(
    <QueryClientProvider client={makeFreshQueryClient()}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <MemoryRouter
            initialEntries={[`/employees/${employeeId}/gap-analysis`]}
          >
            <Routes>
              <Route
                path='/employees/:id/gap-analysis'
                element={<EmployeeGapAnalysisPage />}
              />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

// Capture the real hook so non-error tests go through MSW
let realUseEmployeeGapAnalysis:
  | ((
      id: string
    ) => ReturnType<typeof gapAnalysisQueryService.useEmployeeGapAnalysis>)
  | null = null

beforeAll(async () => {
  const actual = await vi.importActual<
    typeof import('@/services/gapAnalysisQueryService')
  >('@/services/gapAnalysisQueryService')
  realUseEmployeeGapAnalysis = actual.useEmployeeGapAnalysis
  mockUseEmployeeGapAnalysis.mockImplementation(realUseEmployeeGapAnalysis!)
})

afterEach(() => {
  // Reset auth store roles after each test
  useAuthStore.setState(state => ({
    ...state,
    user: state.user ? { ...state.user, roles: [] } : null,
  }))
  mockUseEmployeeGapAnalysis.mockReset()
  if (realUseEmployeeGapAnalysis) {
    mockUseEmployeeGapAnalysis.mockImplementation(realUseEmployeeGapAnalysis)
  }
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EmployeeGapAnalysisPage', () => {
  describe('successful data load (AC-019)', () => {
    it('renders the page title when data loads', async () => {
      renderEmployeePage()
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
    })

    it('renders the chart and table when data has skill gaps', async () => {
      renderEmployeePage()
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.getByRole('table')).toBeInTheDocument()
      })
    })
  })

  describe('People Manager — can create goal (AC-020)', () => {
    it('shows Create Goal button for People Manager viewing a direct report', async () => {
      renderEmployeePage('emp-test-001', ['People Manager'])
      await waitFor(() => {
        expect(
          screen.getAllByRole('button', { name: /create goal/i }).length
        ).toBeGreaterThan(0)
      })
    })
  })

  describe('Director — read-only view (AC-024)', () => {
    it('does not show Create Goal button for Director role', async () => {
      renderEmployeePage('emp-test-001', ['Director'])
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Administrator — read-only view (AC-027)', () => {
    it('does not show Create Goal button for Administrator role', async () => {
      renderEmployeePage('emp-test-001', ['Administrator'])
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('error states', () => {
    it('shows forbidden alert for 403 error (AC-025)', async () => {
      renderEmployeePage('forbidden')
      await waitFor(() => {
        expect(screen.getByText(/do not have access/i)).toBeInTheDocument()
      })
    })

    it('shows not-found alert for 404 error', async () => {
      renderEmployeePage('not-found')
      await waitFor(() => {
        expect(screen.getByText(/employee not found/i)).toBeInTheDocument()
      })
    })

    it('shows no-position warning for 422 error (AC-026)', async () => {
      renderEmployeePage('no-position')
      await waitFor(() => {
        expect(screen.getByText(/no position.*assigned/i)).toBeInTheDocument()
      })
    })

    it('shows generic error with reload button for server errors', async () => {
      // Inject error state directly to avoid React Query retry backoffs (500 retries 2x)
      const error = Object.assign(new Error('http error'), { status: 500 })
      mockUseEmployeeGapAnalysis.mockReturnValue({
        data: undefined,
        isLoading: false,
        isPending: false,
        isError: true,
        error,
        refetch: vi.fn(),
        isFetching: false,
        isSuccess: false,
        status: 'error' as const,
      } as unknown as ReturnType<
        typeof gapAnalysisQueryService.useEmployeeGapAnalysis
      >)
      renderEmployeePage('emp-error-test')
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load gap analysis/i)
        ).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /reload page/i })
      ).toBeInTheDocument()
    })
  })

  describe('back button (AC-023)', () => {
    it('renders a back button', async () => {
      renderEmployeePage()
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /back/i })
        ).toBeInTheDocument()
      })
    })
  })

  describe('at highest level', () => {
    it('shows at-highest-level alert when next position is null', async () => {
      renderEmployeePage('at-highest-level')
      await waitFor(() => {
        expect(screen.getByText(/highest level/i)).toBeInTheDocument()
      })
    })
  })

  describe('summary statistics (AC-019)', () => {
    it('renders skill gap data from the mock response', async () => {
      renderEmployeePage()
      await waitFor(() => {
        // TypeScript skill comes from mockEmployeeGapAnalysis
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
      })
    })
  })

  describe('Director access (AC-023)', () => {
    it('Director can load a same-department employee gap analysis page', async () => {
      renderEmployeePage('emp-test-001', ['Director'])
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.getByRole('table')).toBeInTheDocument()
      })
    })
  })

  describe('Administrator unrestricted access (AC-026)', () => {
    it('Administrator can load any employee gap analysis without restriction', async () => {
      renderEmployeePage('emp-test-001', ['Administrator'])
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
        expect(screen.getByRole('table')).toBeInTheDocument()
      })
    })
  })

  describe('goal creation by manager (AC-021, AC-022)', () => {
    it('submits goal with direct report employee_id, not manager id (AC-021)', async () => {
      const user = userEvent.setup()
      let capturedEmployeeId: string | undefined

      server.use(
        http.post(`${API_BASE}/Goals`, async ({ request }) => {
          const body = (await request.json()) as TCreateGoalDto
          capturedEmployeeId = body.employeeId
          return HttpResponse.json(
            {
              id: 'new-goal-emp-test',
              employeeId: body.employeeId ?? 'emp-test-001',
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

      renderEmployeePage('emp-test-001', ['People Manager'])
      await waitFor(() => {
        expect(
          screen.getAllByRole('button', { name: /create goal/i }).length
        ).toBeGreaterThan(0)
      })

      // Open the modal for the first gapped skill
      await user.click(
        screen.getAllByRole('button', { name: /create goal/i })[0]
      )
      await waitFor(() => {
        expect(screen.getByText(/create goal from gap/i)).toBeInTheDocument()
      })

      // Submit (title is pre-populated by the modal)
      const submitBtn = screen.getByRole('button', { name: /^create goal$/i })
      await user.click(submitBtn)

      await waitFor(() => {
        expect(capturedEmployeeId).toBe('emp-test-001')
      })
    })

    it('new goal appears inline after manager creates it (AC-022)', async () => {
      const user = userEvent.setup()
      let goalCreated = false

      server.use(
        http.get(`${API_BASE}/employees/:id/gap-analysis`, () => {
          if (goalCreated) {
            return HttpResponse.json({
              ...mockEmployeeGapAnalysis,
              skill_gaps: mockEmployeeGapAnalysis.skill_gaps.map(sg =>
                sg.skill.id === 'skill-003'
                  ? {
                      ...sg,
                      linked_goals: [
                        {
                          id: 'new-goal-mgr',
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
          return HttpResponse.json(mockEmployeeGapAnalysis)
        }),
        http.post(`${API_BASE}/Goals`, async ({ request }) => {
          goalCreated = true
          const body = (await request.json()) as TCreateGoalDto
          return HttpResponse.json(
            {
              id: 'new-goal-mgr',
              employeeId: 'emp-test-001',
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

      renderEmployeePage('emp-test-001', ['People Manager'])
      await waitFor(() => {
        expect(screen.getByText('System Design')).toBeInTheDocument()
      })

      // Click Create Goal for System Design (in Architecture category)
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

      // After creation, the new goal should appear inline in the System Design row
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
})
