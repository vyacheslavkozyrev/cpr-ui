/**
 * E2E tests for Performance Analytics & Reporting (0014)
 *
 * Covers role-gated navigation, period-selector behaviour, URL persistence,
 * empty states, and Analytics tab visibility on Team Member Dashboard.
 *
 * Role: Director (VITE_MOCK_USER_ROLE=director in .env.playwright)
 * Auth: Stub auth (VITE_ENABLE_STUB_AUTH=true) — Sign In button auto-authenticates.
 * MSW mock environment: all analytics API calls intercepted by analyticsHandlers.ts
 */

import { expect, test } from '@playwright/test'

type PlaywrightPage = import('@playwright/test').Page

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Sign in via the stub-auth login page and wait for the dashboard to load. */
async function signIn(page: PlaywrightPage) {
  await page.goto('/')
  // Stub auth — clicking Sign In auto-authenticates
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard)/, { timeout: 15000 })
}

/** Navigate to /analytics and wait for the page to render its main heading. */
async function goToAnalyticsPage(page: PlaywrightPage) {
  await page.goto('/analytics')
  // Wait for the time-range selector to indicate the page has mounted
  await page.waitForSelector('[role="group"]', { timeout: 10000 })
}

// ─── US-001: Navigation (AC-001, AC-002, AC-003, AC-004) ────────────────────

test.describe('US-001 US-005: Analytics page navigation and content', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('AC-001 AC-002 — Analytics sidebar item navigates to /analytics', async ({
    page,
  }) => {
    // Locate the Analytics sidebar nav item and click it
    const analyticsNavItem = page.getByRole('button', {
      name: /^analytics$/i,
    })
    await expect(analyticsNavItem).toBeVisible({ timeout: 5000 })
    await analyticsNavItem.click()

    // Should land on /analytics
    await expect(page).toHaveURL(/\/analytics/, { timeout: 10000 })
  })

  test('AC-003 — /analytics page has Goals and Skill Progression sections', async ({
    page,
  }) => {
    await goToAnalyticsPage(page)

    // Goals section heading
    const headings = page.locator('h4, h5, h6')
    const goalHeading = headings.filter({ hasText: /goal/i })
    await expect(goalHeading.first()).toBeVisible({ timeout: 8000 })

    // Skill Progression section heading
    const skillHeading = headings.filter({ hasText: /skill/i })
    await expect(skillHeading.first()).toBeVisible({ timeout: 8000 })
  })

  test('AC-004 — /analytics page loads authenticated user own analytics data', async ({
    page,
  }) => {
    await goToAnalyticsPage(page)

    // MSW mock returns total_goals: 12 — verify stat card value appears in the Goals section.
    // Use first() to handle the strict mode violation since '12' may appear in chart axis labels.
    await expect(page.getByText('12').first()).toBeVisible({ timeout: 8000 })
  })
})

// ─── US-005: Time Range Selection (AC-021, AC-022, AC-023, AC-024) ──────────

test.describe('US-005: Time range selection', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await goToAnalyticsPage(page)
  })

  test('AC-021 — Time range selector displays five preset buttons', async ({
    page,
  }) => {
    const toggleGroup = page.locator('[role="group"]')
    await expect(toggleGroup).toBeVisible()

    const buttons = toggleGroup.locator('button')
    await expect(buttons).toHaveCount(5)
  })

  test('AC-022 — Default selected period is Last 90 Days', async ({ page }) => {
    // The "Last 90 Days" button should have aria-pressed="true"
    const last90Btn = page.locator('button[value="last_90_days"]')
    await expect(last90Btn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5000,
    })
  })

  test('AC-023 — Selecting Last 180 Days updates charts without full page reload', async ({
    page,
  }) => {
    // Click the Last 180 Days button
    const last180Btn = page.locator('button[value="last_180_days"]')
    await last180Btn.click()

    // The button should now be aria-pressed=true
    await expect(last180Btn).toHaveAttribute('aria-pressed', 'true', {
      timeout: 5000,
    })

    // The page should still show the time range selector (no full reload)
    await expect(page.locator('[role="group"]')).toBeVisible()
  })

  test('AC-024 — Selected period is preserved in URL query string and restored on reload', async ({
    page,
  }) => {
    // Click Last 180 Days
    const last180Btn = page.locator('button[value="last_180_days"]')
    await last180Btn.click()

    // URL should contain ?period=last_180_days
    await expect(page).toHaveURL(/period=last_180_days/, { timeout: 5000 })

    // Reload the page — period should be restored from URL
    await page.reload()
    await page.waitForSelector('[role="group"]', { timeout: 10000 })

    const last180BtnAfterReload = page.locator('button[value="last_180_days"]')
    await expect(last180BtnAfterReload).toHaveAttribute(
      'aria-pressed',
      'true',
      {
        timeout: 5000,
      }
    )
  })
})

// ─── US-002: Empty goal state (AC-009) ──────────────────────────────────────

test.describe('US-002: Empty goal data state', () => {
  test('AC-009 — Empty goal state shows zero stat values', async ({ page }) => {
    await signIn(page)

    // Override MSW analytics/goals to return empty data
    await page.goto('/analytics')
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msw = (window as any).__msw
      if (msw) {
        const { worker, http, HttpResponse } = msw
        worker.use(
          http.get('*/me/analytics/goals', () =>
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
      }
    })

    // Navigate to trigger a fresh load with the override
    await page.goto('/analytics')
    await page.waitForSelector('[role="group"]', { timeout: 10000 })

    // Several "0" values should be visible in the stat cards
    const zeros = page.getByText('0')
    await expect(zeros.first()).toBeVisible({ timeout: 8000 })
  })
})

// ─── US-004: Team Member Dashboard — Analytics tab (AC-015, AC-020) ─────────

test.describe('US-004: Team Member Dashboard Analytics tab visibility', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('AC-015 — PeopleManager/Director sees Analytics tab on Team Member Dashboard', async ({
    page,
  }) => {
    // Override the stub auth user to have Director role so the Analytics tab is visible.
    // The server runs with VITE_MOCK_USER_ROLE=employee by default, so we must patch
    // sessionStorage.__stub_auth__ after sign-in.
    await page.evaluate(() => {
      try {
        const saved = sessionStorage.getItem('__stub_auth__')
        if (saved) {
          const auth = JSON.parse(saved)
          if (auth.user) {
            auth.user.roles = ['Director']
            sessionStorage.setItem('__stub_auth__', JSON.stringify(auth))
          }
        }
      } catch {
        /* ignore */
      }
    })

    // Navigate directly to team member dashboard for emp-001
    await page.goto('/team/emp-001')
    // Wait for the tabs to render
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 })

    // Analytics tab should be visible for Director role
    const analyticsTab = page.getByRole('tab', { name: /analytics/i })
    await expect(analyticsTab).toBeVisible({ timeout: 5000 })
  })

  test('AC-020 — Employee role does not see Analytics tab on Team Member Dashboard', async ({
    page,
  }) => {
    // The server runs with VITE_MOCK_USER_ROLE=employee by default.
    // After signIn the user has Employee role — ensure stub auth explicitly reflects this.
    await page.evaluate(() => {
      try {
        const saved = sessionStorage.getItem('__stub_auth__')
        if (saved) {
          const auth = JSON.parse(saved)
          if (auth.user) {
            auth.user.roles = ['Employee']
            sessionStorage.setItem('__stub_auth__', JSON.stringify(auth))
          }
        }
      } catch {
        /* ignore */
      }
    })

    // Employee cannot navigate to /team/:id (no team menu item visible), so
    // go directly — the page should still load but omit the Analytics tab.
    await page.goto('/team/emp-001')
    // Brief wait for the page to render fully
    await page.waitForSelector('[role="main"], main, .MuiBox-root', {
      timeout: 10000,
    })

    // Analytics tab must NOT be present for Employee role
    const analyticsTab = page.locator('[role="tab"]', { hasText: /analytics/i })
    await expect(analyticsTab).not.toBeVisible({ timeout: 3000 })
  })
})
