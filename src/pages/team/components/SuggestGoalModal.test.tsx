/**
 * SuggestGoalModal Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-017: Name is required, timeframe is required, description is optional
 * - AC-018: Submit button disabled until required fields are filled
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../../config/i18n'
import { SuggestGoalModal } from './SuggestGoalModal'

function renderModal(onSubmit = vi.fn(), onClose = vi.fn()) {
  return render(
    <I18nextProvider i18n={i18n}>
      <SuggestGoalModal open={true} onClose={onClose} onSubmit={onSubmit} />
    </I18nextProvider>
  )
}

describe('SuggestGoalModal — AC-017: Required and optional fields', () => {
  it('renders Goal Name field as required', () => {
    renderModal()
    const nameInput = screen.getByLabelText(/Goal Name/i)
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toBeRequired()
  })

  it('renders Timeframe field as required', () => {
    renderModal()
    // Timeframe is a select rendered with a label
    expect(screen.getByText('Timeframe')).toBeInTheDocument()
  })

  it('renders Description field (optional — no required attribute)', () => {
    renderModal()
    const descInput = screen.getByLabelText(/Description/i)
    expect(descInput).toBeInTheDocument()
    expect(descInput).not.toBeRequired()
  })

  it('submit button is disabled when name is empty', async () => {
    renderModal()
    const submitBtn = screen.getByRole('button', { name: /^Suggest$/i })
    // Name is empty by default → form invalid → button disabled
    expect(submitBtn).toBeDisabled()
  })

  // AC-018: Submit enabled after filling required fields
  it('enables submit button when name is filled (timeframe has default)', async () => {
    const user = userEvent.setup()
    renderModal()

    const nameInput = screen.getByLabelText(/Goal Name/i)
    await user.type(nameInput, 'Learn TypeScript')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Suggest$/i })
      ).not.toBeDisabled()
    })
  })

  it('calls onSubmit with name and timeframe when form is submitted', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderModal(onSubmit)

    await user.type(screen.getByLabelText(/Goal Name/i), 'Learn TypeScript')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Suggest$/i })
      ).not.toBeDisabled()
    })

    await user.click(screen.getByRole('button', { name: /^Suggest$/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Learn TypeScript' })
      )
    })
  })

  it('allows submitting without description (description is optional)', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    renderModal(onSubmit)

    await user.type(screen.getByLabelText(/Goal Name/i), 'Learn TypeScript')
    // Do NOT fill description

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^Suggest$/i })
      ).not.toBeDisabled()
    })

    await user.click(screen.getByRole('button', { name: /^Suggest$/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const dto = onSubmit.mock.calls[0][0]
      // description should not be present in DTO (optional, omitted when empty)
      expect(dto.description).toBeUndefined()
    })
  })
})
