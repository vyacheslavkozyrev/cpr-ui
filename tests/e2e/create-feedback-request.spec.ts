import { expect, test } from '@playwright/test'

/**
 * E2E Test: Create Feedback Request - Complete Flow
 *
 * Tests the full user journey of creating a feedback request:
 * 1. Navigate to the feedback request form
 * 2. Select employees as recipients
 * 3. Fill out the form fields
 * 4. Submit the request
 * 5. Verify success toast notification
 * 6. Verify request appears in sent list
 * 7. Verify request details are correct
 */

test.describe('Create Feedback Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application (using mock mode with employee role)
    await page.goto('/')

    // Wait for the application to load
    await expect(page.locator('body')).toBeVisible()
  })

  test('should complete full create feedback request workflow', async ({
    page,
  }) => {
    // Step 1: Navigate to feedback request form
    await test.step('Navigate to feedback request form', async () => {
      // Click "Request Feedback" button in navigation
      const requestFeedbackButton = page.getByRole('button', {
        name: /request feedback/i,
      })
      await requestFeedbackButton.click()

      // Verify we're on the form page
      await expect(page).toHaveURL(/\/feedback\/request\/new/)
      await expect(
        page.getByRole('heading', { name: /request feedback/i })
      ).toBeVisible()
    })

    // Step 2: Select employees as recipients
    await test.step('Select employees as recipients', async () => {
      // Open employee picker/autocomplete
      const employeeInput = page
        .getByLabel(/select employees/i)
        .or(page.getByPlaceholder(/search employees/i))
      await employeeInput.click()

      // Wait for employee list to load
      await page.waitForTimeout(500)

      // Select first employee from the list
      const firstEmployee = page.getByRole('option').first()
      await firstEmployee.click()

      // Wait a bit for the selection to register
      await page.waitForTimeout(300)

      // Verify at least one employee is selected
      const selectedChips = page.locator(
        '[data-testid*="employee-chip"], .MuiChip-root'
      )
      await expect(selectedChips.first()).toBeVisible()
    })

    // Step 3: Fill out the form fields
    await test.step('Fill out form fields', async () => {
      // Fill message field
      const messageInput = page
        .getByLabel(/message/i)
        .or(page.getByPlaceholder(/your message/i))
      await messageInput.fill(
        'Please provide feedback on my recent project work. I would appreciate your insights on collaboration and technical skills.'
      )

      // Set due date (7 days from now)
      const dueDateInput = page.getByLabel(/due date/i)
      if (await dueDateInput.isVisible()) {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 7)
        const formattedDate = futureDate.toISOString().split('T')[0] // YYYY-MM-DD
        await dueDateInput.fill(formattedDate)
      }

      // Optional: Select project (if available)
      const projectSelect = page.getByLabel(/project/i)
      if (await projectSelect.isVisible()) {
        await projectSelect.click()
        await page.waitForTimeout(300)
        const firstProject = page.getByRole('option').first()
        if (await firstProject.isVisible()) {
          await firstProject.click()
        }
      }
    })

    // Step 4: Submit the request
    await test.step('Submit the request', async () => {
      // Find and click submit button
      const submitButton = page
        .getByRole('button', { name: /send request/i })
        .or(page.getByRole('button', { name: /submit/i }))
      await submitButton.click()

      // Wait for submission to complete
      await page.waitForTimeout(1000)
    })

    // Step 5: Verify success toast notification
    await test.step('Verify success toast notification', async () => {
      // Look for success toast/snackbar
      const successToast = page
        .locator('[role="alert"], .MuiSnackbar-root, .MuiAlert-root')
        .filter({ hasText: /request sent|success/i })
      await expect(successToast).toBeVisible({ timeout: 5000 })

      // Verify toast contains confirmation message
      await expect(successToast).toContainText(/sent|success/i)
    })

    // Step 6: Verify request appears in sent list
    await test.step('Navigate to sent list and verify request appears', async () => {
      // Navigate to sent requests list
      const sentRequestsLink = page
        .getByRole('link', { name: /sent requests/i })
        .or(page.getByRole('button', { name: /sent/i }))
      await sentRequestsLink.click()

      // Wait for list to load
      await page.waitForTimeout(1000)

      // Verify at least one request card is visible
      const requestCards = page.locator(
        '[data-testid*="feedback-request-card"], .feedback-request-card, [class*="RequestCard"]'
      )
      await expect(requestCards.first()).toBeVisible({ timeout: 5000 })
    })

    // Step 7: Verify request details are correct
    await test.step('Verify request details', async () => {
      // Find the most recent request (should be first in list)
      const firstRequestCard = page
        .locator(
          '[data-testid*="feedback-request-card"], .feedback-request-card, [class*="RequestCard"]'
        )
        .first()

      // Verify the message text appears
      await expect(firstRequestCard).toContainText(/Please provide feedback/i, {
        timeout: 3000,
      })

      // Verify status (should be "pending" or similar)
      const statusBadge = firstRequestCard.locator(
        '[data-testid*="status"], .status, [class*="status"]'
      )
      if (await statusBadge.isVisible()) {
        await expect(statusBadge).toContainText(/pending|active|sent/i)
      }

      // Verify recipient count
      await expect(firstRequestCard).toContainText(/1.*recipient|recipient.*1/i)
    })
  })

  test('should show validation errors for empty form submission', async ({
    page,
  }) => {
    // Navigate to form
    const requestFeedbackButton = page.getByRole('button', {
      name: /request feedback/i,
    })
    await requestFeedbackButton.click()

    // Try to submit without filling anything
    const submitButton = page
      .getByRole('button', { name: /send request/i })
      .or(page.getByRole('button', { name: /submit/i }))
    await submitButton.click()

    // Verify validation errors appear
    const errorMessages = page.locator(
      '[role="alert"], .error, .MuiFormHelperText-root.Mui-error'
    )
    await expect(errorMessages.first()).toBeVisible({ timeout: 2000 })
  })

  test('should allow canceling form with confirmation', async ({ page }) => {
    // Navigate to form
    const requestFeedbackButton = page.getByRole('button', {
      name: /request feedback/i,
    })
    await requestFeedbackButton.click()

    // Start filling the form
    const messageInput = page
      .getByLabel(/message/i)
      .or(page.getByPlaceholder(/your message/i))
    await messageInput.fill('Test message')

    // Click cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    await cancelButton.click()

    // Expect confirmation dialog
    const confirmDialog = page.locator('[role="dialog"], .MuiDialog-root')
    await expect(confirmDialog).toBeVisible({ timeout: 2000 })

    // Verify dialog has "Discard" option
    await expect(confirmDialog).toContainText(/discard|leave/i)
  })
})
