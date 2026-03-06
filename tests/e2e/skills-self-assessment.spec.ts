/**
 * E2E tests for Skills Self-Assessment feature (0007)
 *
 * Covers user flows from wireframes.md.
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

// ─── US-001: View Skill Self-Assessment Dashboard ────────────────────────────

test.describe('US-001: Skill Self-Assessment Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-001 — Position header shows position title and career track', async ({
    page,
  }) => {
    // Mock data: position.title = 'Senior Software Engineer', track = 'Backend Engineering'
    await expect(
      page.getByText('Senior Software Engineer').first()
    ).toBeVisible()
    await expect(page.getByText('Backend Engineering')).toBeVisible()
  })

  test('AC-002 — Skill categories are grouped and listed', async ({ page }) => {
    await expect(page.getByText('Technical Skills')).toBeVisible()
    await expect(page.getByText('Leadership & Communication')).toBeVisible()
  })

  test('AC-003 — Skill rows display title and required level badge', async ({
    page,
  }) => {
    // Skill title
    await expect(page.getByText('TypeScript').first()).toBeVisible()
    // Required level badge chip (MUI Chip)
    const chips = page.locator('.MuiChip-root')
    expect(await chips.count()).toBeGreaterThan(0)
  })

  test('AC-004 — Page loads successfully for authenticated Director role', async ({
    page,
  }) => {
    // Page loaded without error — title is visible
    await expect(page.getByText(/skill self-assessment/i).first()).toBeVisible()
  })
})

// ─── US-002: Self-Assess Current Skill Level ─────────────────────────────────

test.describe('US-002: Self-Assess Current Skill Level', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('[role="combobox"]', { timeout: 10000 })
  })

  test('AC-005 — Level selector dropdowns are present', async ({ page }) => {
    const selects = page.locator('[role="combobox"]')
    expect(await selects.count()).toBeGreaterThan(0)
  })

  test('AC-006 — No explicit save button — save happens on dropdown change', async ({
    page,
  }) => {
    // Confirm there is no global "Save" button on the page
    const saveButton = page.getByRole('button', { name: /^save$/i })
    await expect(saveButton).not.toBeVisible()
  })
})

// ─── US-003: Set Target Skill Level ──────────────────────────────────────────

test.describe('US-003: Set Target Skill Level', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('[role="combobox"]', { timeout: 10000 })
  })

  test('AC-010 — Target level Select dropdowns are present alongside current level dropdowns', async ({
    page,
  }) => {
    // There should be at least two comboboxes per skill row: current + target
    const selects = page.locator('[role="combobox"]')
    expect(await selects.count()).toBeGreaterThanOrEqual(2)
  })
})

// ─── US-004: View Radar Chart ────────────────────────────────────────────────

test.describe('US-004: Radar Chart', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    // Wait for the page to fully load (skill data appears)
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-014 — Radar chart canvas is rendered', async ({ page }) => {
    const canvas = page.locator('canvas')
    await expect(canvas.first()).toBeVisible()
  })

  test('AC-015 — "Highest position" banner absent when next_position exists', async ({
    page,
  }) => {
    // Mock data has next_position = { id: 'pos-002', title: 'Staff Software Engineer' }
    const banner = page.getByText(/highest position in your/i)
    await expect(banner).not.toBeVisible()
  })
})

// ─── US-005: Link Received Feedback as Evidence ───────────────────────────────

test.describe('US-005: Link Received Feedback as Evidence', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
    await page.goto('/skills/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-018 — "Link feedback" action opens Evidence modal', async ({
    page,
  }) => {
    const linkBtn = page.getByText(/link feedback/i).first()
    await linkBtn.click()
    // MUI Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/link evidence/i)).toBeVisible()
  })

  test('AC-020 — Already-linked feedback is pre-checked in modal', async ({
    page,
  }) => {
    // TypeScript skill (SKILL_ASSESSED) already has fb-001 linked
    const linkBtn = page.getByText(/link feedback/i).first()
    await linkBtn.click()
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Wait for the modal to load feedback items (MUI Checkbox renders <input type="checkbox">)
    await page.waitForSelector('input[type="checkbox"]', { timeout: 5000 })
    const checkboxes = page.locator('input[type="checkbox"]')
    // At least one checkbox should be checked (already linked)
    const checkedCount = await checkboxes.evaluateAll(
      (cbs: Element[]) =>
        cbs.filter(cb => (cb as HTMLInputElement).checked).length
    )
    expect(checkedCount).toBeGreaterThan(0)
  })

  test('AC-021 — Evidence items appear below skill row', async ({ page }) => {
    // TypeScript skill has an evidence item from Alice Johnson
    await expect(page.getByText('Alice Johnson').first()).toBeVisible()
  })
})

// ─── US-006: PeopleManager Views Direct Reports ───────────────────────────────

test.describe('US-006: PeopleManager Team Overview', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsManager(page)
    await page.goto('/skills/team')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-023 — PeopleManager sees team skill overview with direct reports', async ({
    page,
  }) => {
    await expect(page.getByText('Jane Smith')).toBeVisible()
    await expect(page.getByText('Bob Chen')).toBeVisible()
    await expect(page.getByText('Maria Garcia')).toBeVisible()
  })

  test('AC-024 — Clicking a direct report navigates to their read-only assessment', async ({
    page,
  }) => {
    const row = page.getByRole('row', { name: /jane smith/i })
    await row.click()
    await page.waitForURL(/\/skills\/employees\/.+\/assessment/, {
      timeout: 10000,
    })
    // Read-only banner
    await expect(page.getByText(/viewing assessment for/i)).toBeVisible()
  })
})

// ─── US-007: Director Views Any Employee's Assessment ─────────────────────────

test.describe('US-007: Director / Admin Read-Only Assessment', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page) // Director role
    await page.goto('/skills/employees/emp-002/assessment')
    await page.waitForSelector('table', { timeout: 10000 })
  })

  test('AC-026 — Director can access any employee assessment page', async ({
    page,
  }) => {
    // Page loaded — skill data is visible
    await expect(page.getByText('TypeScript').first()).toBeVisible()
  })

  test('AC-027 — Read-only view shows banner and no interactive controls', async ({
    page,
  }) => {
    // Read-only banner
    await expect(page.getByText(/viewing assessment for/i)).toBeVisible()
    // No combobox (Select) elements
    const selects = page.locator('[role="combobox"]')
    expect(await selects.count()).toBe(0)
    // No "Link feedback" button
    await expect(page.getByText(/link feedback/i)).not.toBeVisible()
  })

  test('AC-025 — Read-only view shows skills with notes and evidence', async ({
    page,
  }) => {
    // Skill titles visible
    await expect(page.getByText('TypeScript').first()).toBeVisible()
    // Evidence from Alice Johnson visible (pre-linked in mock data)
    await expect(page.getByText('Alice Johnson')).toBeVisible()
  })
})
