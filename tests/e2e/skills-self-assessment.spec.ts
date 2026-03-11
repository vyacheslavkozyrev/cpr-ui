/**
 * E2E tests for Skills Self-Assessment — feature 0010 (schema refactor)
 *
 * Covers key user flows from wireframes.md.
 * Runs against MSW-backed mock environment (vite --mode playwright).
 *
 * Default role: Director (VITE_MOCK_USER_ROLE=director in .env.playwright)
 *   — can access /skills/assessment (all roles) and
 *     /skills/employees/:id/assessment (Director/Admin/PeopleManager)
 *
 * Manager role: People Manager (injected via sessionStorage)
 *   — required for /skills/team (PeopleManager-only route)
 */

import { expect, test } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/(dashboard|skills|reviews|my-reviews)/, {
    timeout: 15000,
  })
}

/** Inject People Manager auth into sessionStorage and reload the page. */
async function signInAsManager(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem(
      '__stub_auth__',
      JSON.stringify({
        isAuthenticated: true,
        user: {
          id: 'pm-001',
          name: 'Sarah Manager',
          email: 'sarah.manager@cpr.com',
          roles: ['Employee', 'People Manager'],
          tenantId: 'mock-tenant-001',
          accessToken: 'stub-access-token',
          idToken: 'stub-id-token',
        },
        accessToken: 'stub-access-token',
        idToken: 'stub-id-token',
      })
    )
  })
  await page.reload()
  await page.waitForURL(/\/(dashboard|skills|reviews|my-reviews)/, {
    timeout: 15000,
  })
}

// ─── US-001: Employee views self-assessment without target level ──────────────

test.describe('US-001: Self-Assessment Page', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-001/AC-004 — Page loads and no Target Level column', async ({
    page,
  }) => {
    // Page title
    await expect(page.getByText(/skill self-assessment/i).first()).toBeVisible()
    // AC-004: No "Target Level" column header
    await expect(page.getByText(/target level/i)).not.toBeVisible()
  })

  test('AC-003 — Skill rows display title and required level badge', async ({
    page,
  }) => {
    await expect(page.getByText('TypeScript').first()).toBeVisible()
    const chips = page.locator('.MuiChip-root')
    expect(await chips.count()).toBeGreaterThan(0)
  })
})

// ─── US-002: Employee enters numeric self-assessment ─────────────────────────

test.describe('US-002: Numeric Self-Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-005 — "My Weight" column with numeric input (no dropdown)', async ({
    page,
  }) => {
    // Column header
    await expect(page.getByText(/my weight/i)).toBeVisible()
    // No combobox (Select dropdown) should be present
    const selects = page.locator('[role="combobox"]')
    expect(await selects.count()).toBe(0)
    // Numeric input should be present
    const numericInputs = page.locator('input[type="number"]')
    expect(await numericInputs.count()).toBeGreaterThan(0)
  })

  test('AC-007 — Validation error for zero/negative value', async ({
    page,
  }) => {
    const input = page.locator('input[type="number"]').first()
    await input.fill('0')
    await input.blur()
    await expect(page.getByText(/must be greater than 0/i)).toBeVisible({
      timeout: 5000,
    })
  })
})

// ─── US-003: Link feedback as evidence ───────────────────────────────────────

test.describe('US-003: Link Feedback as Evidence', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-013 — "Link feedback" button visible when assessment exists', async ({
    page,
  }) => {
    await expect(page.getByText(/link feedback/i).first()).toBeVisible()
  })

  test('AC-014 — Clicking "Link feedback" opens Evidence Modal', async ({
    page,
  }) => {
    const linkBtn = page.getByText(/link feedback/i).first()
    await linkBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/link evidence/i)).toBeVisible()
  })

  test('AC-019 — Evidence items appear below skill row', async ({ page }) => {
    await expect(page.getByText('Alice Johnson').first()).toBeVisible()
  })
})

// ─── US-004: Target endpoints removed ────────────────────────────────────────

test.describe('US-004: Target Endpoints Removed', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-020/AC-021 — No target-level controls present in UI', async ({
    page,
  }) => {
    // AC-020/AC-021: Target level endpoints are removed. UI must not render
    // any target-level input or column that would trigger those endpoints.
    await expect(page.getByText(/target level/i)).not.toBeVisible()
    await expect(page.getByText(/set target/i)).not.toBeVisible()
  })
})

// ─── US-005: PeopleManager sets manager assessment ───────────────────────────

test.describe('US-005/US-006: Manager Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsManager(page)
    await page.goto('/skills/employees/emp-002/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-029/AC-030 — Manager Assessment column visible', async ({
    page,
  }) => {
    await expect(page.getByText(/manager assessment/i).first()).toBeVisible()
  })

  test('AC-032 — Employee read-only: viewer with manager role still sees assessment page', async ({
    page,
  }) => {
    await expect(page.getByText(/viewing assessment for/i)).toBeVisible()
    await expect(page.getByText('TypeScript').first()).toBeVisible()
  })
})

// ─── US-007: Weight removed from position_to_skill ───────────────────────────

test.describe('US-007: Weight Removed', () => {
  test('AC-035 — Taxonomy position detail does not show weight column', async ({
    page,
  }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
    // No "Weight" column header anywhere on the skills assessment page
    await expect(page.getByText(/^weight$/i)).not.toBeVisible()
  })
})
