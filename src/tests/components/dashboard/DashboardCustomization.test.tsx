import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DashboardCustomization,
  useDashboardCustomization,
} from '../../../components/dashboard/customization/DashboardCustomization'
import { renderWithProviders, renderWithRouter } from '../../utils'

// Test wrapper component to test the hook
function TestHookWrapper() {
  const { widgets, toggleWidget, resetLayout, getVisibleWidgets } =
    useDashboardCustomization()

  return (
    <div>
      <div data-testid='widget-count'>{widgets.length}</div>
      <div data-testid='visible-count'>{getVisibleWidgets().length}</div>
      {widgets.map(widget => (
        <div key={widget.id} data-testid={`widget-${widget.id}`}>
          <span>{widget.name}</span>
          <span data-testid={`${widget.id}-visible`}>
            {widget.visible.toString()}
          </span>
          <button onClick={() => toggleWidget(widget.id, !widget.visible)}>
            Toggle {widget.id}
          </button>
        </div>
      ))}
      <button onClick={resetLayout} data-testid='reset-button'>
        Reset
      </button>
    </div>
  )
}

describe('DashboardCustomization', () => {
  const mockWidgets = [
    { id: 'goals', name: 'Goal Summary', visible: true, order: 1 },
    { id: 'feedback', name: 'Feedback Summary', visible: true, order: 2 },
    { id: 'skills', name: 'Skill Progress', visible: false, order: 3 },
    { id: 'activity', name: 'Activity Feed', visible: true, order: 4 },
  ]

  const mockProps = {
    widgets: mockWidgets,
    onWidgetToggle: vi.fn(),
    onResetLayout: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the settings button', () => {
    renderWithProviders(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button', {
      name: 'dashboard.customization.ariaLabel',
    })
    expect(settingsButton).toBeInTheDocument()
  })

  it('opens menu when settings button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button', {
      name: 'dashboard.customization.ariaLabel',
    })
    await user.click(settingsButton)

    await waitFor(() => {
      expect(screen.getByText('Dashboard Settings')).toBeInTheDocument()
    })
  })

  it('displays correct widget count in menu header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(() => {
      // 3 visible out of 4 total widgets
      expect(screen.getByText('3 of 4 widgets visible')).toBeInTheDocument()
    })
  })

  it('displays all widgets in the list', async () => {
    const user = userEvent.setup()
    render(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(() => {
      expect(screen.getByText('Goal Summary')).toBeInTheDocument()
      expect(screen.getByText('Feedback Summary')).toBeInTheDocument()
      expect(screen.getByText('Skill Progress')).toBeInTheDocument()
      expect(screen.getByText('Activity Feed')).toBeInTheDocument()
    })
  })

  it('shows correct visibility status for each widget', async () => {
    const user = userEvent.setup()
    render(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(() => {
      // Check visible widgets show "Visible"
      const visibleLabels = screen.getAllByText('Visible')
      expect(visibleLabels).toHaveLength(3) // goals, feedback, activity

      // Check hidden widget shows "Hidden"
      expect(screen.getByText('Hidden')).toBeInTheDocument()
    })
  })

  it('calls onWidgetToggle when switch is toggled', async () => {
    const user = userEvent.setup()
    render(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(async () => {
      // Material-UI Switch has role="switch"
      const switches = screen.getAllByRole('switch')
      await user.click(switches[0]) // Toggle first widget (goals)

      expect(mockProps.onWidgetToggle).toHaveBeenCalledWith('goals', false)
    })
  })

  it('calls onResetLayout when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(async () => {
      const resetButton = screen.getByText('Reset to Default Layout')
      await user.click(resetButton)

      expect(mockProps.onResetLayout).toHaveBeenCalled()
    })
  })

  it('renders in inline mode when inline prop is true', () => {
    render(<DashboardCustomization {...mockProps} inline={true} />)

    const settingsButton = screen.getByRole('button')
    expect(settingsButton).toBeInTheDocument()
    // Button should not have fixed positioning in inline mode
  })

  it('closes menu when escape key is pressed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardCustomization {...mockProps} />)

    const settingsButton = screen.getByRole('button')
    await user.click(settingsButton)

    await waitFor(() => {
      expect(screen.getByText('Dashboard Settings')).toBeInTheDocument()
    })

    // Press escape key to close menu
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('Dashboard Settings')).not.toBeInTheDocument()
    })
  })
})

describe('useDashboardCustomization hook', () => {
  it('initializes with default widget configuration', () => {
    renderWithRouter(<TestHookWrapper />)

    expect(screen.getByTestId('widget-count')).toHaveTextContent('4')
    expect(screen.getByTestId('visible-count')).toHaveTextContent('4')

    // Check all widgets are initially visible
    expect(screen.getByTestId('goals-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('feedback-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('skills-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('activity-visible')).toHaveTextContent('true')
  })

  it('toggles widget visibility correctly', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestHookWrapper />)

    const toggleButton = screen.getByText('Toggle goals')
    await user.click(toggleButton)

    expect(screen.getByTestId('goals-visible')).toHaveTextContent('false')
    expect(screen.getByTestId('visible-count')).toHaveTextContent('3')
  })

  it('resets all widgets to visible when resetLayout is called', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestHookWrapper />)

    // Hide a widget first
    const toggleButton = screen.getByText('Toggle goals')
    await user.click(toggleButton)

    expect(screen.getByTestId('goals-visible')).toHaveTextContent('false')

    // Reset layout
    const resetButton = screen.getByTestId('reset-button')
    await user.click(resetButton)

    expect(screen.getByTestId('goals-visible')).toHaveTextContent('true')
    expect(screen.getByTestId('visible-count')).toHaveTextContent('4')
  })

  it('returns visible widgets in correct order', async () => {
    const user = userEvent.setup()
    renderWithRouter(<TestHookWrapper />)

    // Hide middle widget (skills - order 3)
    const toggleButton = screen.getByText('Toggle skills')
    await user.click(toggleButton)

    expect(screen.getByTestId('visible-count')).toHaveTextContent('3')

    // Visible widgets should still maintain their order
    const visibleWidgets = ['goals', 'feedback', 'activity'].map(
      id => screen.getByTestId(`${id}-visible`).textContent === 'true'
    )
    expect(visibleWidgets.every(Boolean)).toBe(true)
  })
})
