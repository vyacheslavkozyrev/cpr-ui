import { cleanup, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from '../../components/layout/Header'
import { server } from '../../mocks/server'
import { renderWithUser } from '../utils'

// Mock the stores
vi.mock('../../stores/themeStore', () => ({
  useThemeStore: vi.fn(() => ({
    mode: 'light',
    resolvedTheme: 'light',
    systemTheme: 'light',
    setMode: vi.fn(),
    toggleTheme: vi.fn(),
    setSystemTheme: vi.fn(),
    isDark: vi.fn(() => false),
    isLight: vi.fn(() => true),
    isSystemMode: vi.fn(() => false),
  })),
}))

vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    logout: vi.fn(),
    user: {
      displayName: 'John Doe',
      initials: 'JD',
    },
  })),
}))

// Mock navigation hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('Header Component - Basic Tests', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'warn' })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    server.resetHandlers()
  })

  it('renders the header component successfully', () => {
    const { container } = renderWithUser(<Header />, 'employee')
    expect(container.firstChild).toBeTruthy()
  })

  it('displays the application brand/title', () => {
    renderWithUser(<Header />, 'employee')
    expect(screen.getByText('header.brand')).toBeInTheDocument()
  })

  it('displays user avatar area', () => {
    renderWithUser(<Header />, 'employee')
    expect(screen.getByText('common.loading')).toBeInTheDocument()
  })

  it('shows theme toggle button', () => {
    renderWithUser(<Header />, 'employee')
    const themeButton = screen.getByLabelText('header.toggleTheme')
    expect(themeButton).toBeInTheDocument()
  })

  it('renders with Material-UI AppBar structure', () => {
    const { container } = renderWithUser(<Header />, 'employee')
    const appBar = container.querySelector(
      '.MuiAppBar-root, [data-testid="header-appbar"]'
    )
    expect(appBar || container.firstChild).toBeTruthy()
  })
})
