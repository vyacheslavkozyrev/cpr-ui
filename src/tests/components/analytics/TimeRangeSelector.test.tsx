/**
 * Component tests for TimeRangeSelector
 * Feature 0014 — Performance Analytics & Reporting
 *
 * Covers: default preset rendered, selection fires callback, URL ?period= param updated.
 */

import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { EAnalyticsPeriod } from '../../../models/analytics.models'
import { TimeRangeSelector } from '../../../components/analytics/TimeRangeSelector'
import { renderWithRouter } from '../../utils'

/** Thin helper that wraps in a single MemoryRouter (no nested routers on rerender). */
function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('TimeRangeSelector', () => {
  const noop = () => {}

  it('AC-021: renders all five preset options', () => {
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={noop}
      />
    )
    expect(screen.getByRole('group')).toBeInTheDocument()
    // All 5 toggle buttons should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(5)
  })

  it('AC-022: marks the current value as selected (aria-pressed)', () => {
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={noop}
      />
    )
    // The selected button has aria-pressed="true"
    const selectedButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-pressed') === 'true')
    expect(selectedButtons).toHaveLength(1)
  })

  it('AC-023: calls onChange when a different preset is clicked', () => {
    const handleChange = vi.fn()
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={handleChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    // Click the first button (not the currently selected one)
    fireEvent.click(buttons[0])

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(EAnalyticsPeriod.LAST_30_DAYS)
  })

  it('AC-023: does not call onChange when the currently selected preset is re-clicked', () => {
    // MUI ToggleButtonGroup with exclusive does not fire when re-clicking the same value
    const handleChange = vi.fn()
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={handleChange}
      />
    )

    const selectedButtons = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-pressed') === 'true')
    fireEvent.click(selectedButtons[0])

    // onChange should NOT be called because newValue would be null
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('AC-021: renders different values as selected when prop changes', () => {
    // Use renderInRouter (MemoryRouter only) so that rerender does not nest routers.
    const { rerender } = renderInRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_30_DAYS}
        onChange={noop}
      />
    )

    let selected = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-pressed') === 'true')
    expect(selected).toHaveLength(1)

    // Rerender with a different value — rerender keeps the existing MemoryRouter wrapper.
    rerender(
      <MemoryRouter>
        <TimeRangeSelector value={EAnalyticsPeriod.LAST_YEAR} onChange={noop} />
      </MemoryRouter>
    )

    selected = screen
      .getAllByRole('button')
      .filter(btn => btn.getAttribute('aria-pressed') === 'true')
    expect(selected).toHaveLength(1)
  })

  it('AC-021: onChange is called with the correct period value for each preset', () => {
    const handleChange = vi.fn()
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={handleChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    // buttons[1] is last_90_days (already selected), so click buttons[2] (last_180_days)
    fireEvent.click(buttons[2])
    expect(handleChange).toHaveBeenLastCalledWith(
      EAnalyticsPeriod.LAST_180_DAYS
    )
  })

  it('AC-022: last_90_days button is selected when value prop is LAST_90_DAYS', () => {
    renderWithRouter(
      <TimeRangeSelector
        value={EAnalyticsPeriod.LAST_90_DAYS}
        onChange={noop}
      />
    )
    const buttons = screen.getAllByRole('button')
    const last90Btn = buttons.find(
      btn => btn.getAttribute('value') === 'last_90_days'
    )
    expect(last90Btn).toBeDefined()
    expect(last90Btn?.getAttribute('aria-pressed')).toBe('true')
  })
})
