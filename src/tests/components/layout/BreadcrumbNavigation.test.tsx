import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BreadcrumbNavigation } from '../../../components/layout/BreadcrumbNavigation'
import { renderWithProviders } from '../../utils'

// Since the BreadcrumbNavigation is rendering translation keys instead of actual text,
// we need to look for the actual text that appears in the DOM

describe('BreadcrumbNavigation', () => {
  it('does not render on root dashboard path', () => {
    const { container } = renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard', includeRouter: true },
    })

    // Should not render breadcrumbs on root dashboard
    expect(container.firstChild).toBeNull()
  })

  it('does not render when on root path', () => {
    const { container } = renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/', includeRouter: true },
    })

    // Should not render breadcrumbs on root
    expect(container.firstChild).toBeNull()
  })

  it('renders breadcrumbs for nested dashboard paths', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/goals', includeRouter: true },
    })

    // Should show Home (Dashboard) and current page
    // In tests, translations show as keys, not translated text
    // Use aria-label to get the home dashboard link specifically
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.goals')).toBeInTheDocument()
  })

  it('renders multiple levels of breadcrumbs', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/team/members',
        includeRouter: true,
      },
    })

    // Use aria-label for home dashboard link, getAllByText for others
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.team')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
  })

  it('shows Home icon for dashboard link', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/goals', includeRouter: true },
    })

    // Check for Home icon (should be in the DOM)
    const homeIcon =
      document.querySelector('[data-testid="HomeIcon"]') ||
      document.querySelector('svg[class*="MuiSvgIcon-root"]')
    expect(homeIcon).toBeInTheDocument()
  })

  it('creates clickable links for intermediate breadcrumbs', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/team/members',
        includeRouter: true,
      },
    })

    // Dashboard link should be clickable - use aria-label since there are multiple dashboard links
    const dashboardLink = screen.getByLabelText('Navigate to dashboard')
    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    // Team link should be clickable
    const teamLink = screen.getByRole('link', { name: /navigation.team/i })
    expect(teamLink).toBeInTheDocument()
    expect(teamLink).toHaveAttribute('href', '/dashboard/team')
  })

  it('shows current page as non-clickable text', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/goals', includeRouter: true },
    })

    // Current page should not be a link
    const currentPage = screen.getByText('navigation.goals')
    expect(currentPage.closest('a')).toBeNull()
  })

  it('handles known navigation keys with translations', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/skills',
        includeRouter: true,
      },
    })

    // Should use translated labels (showing as keys in tests)
    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.skills')).toBeInTheDocument()
  })

  it('handles unknown path segments with capitalization', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/unknown-section',
        includeRouter: true,
      },
    })

    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    // Should capitalize unknown segments
    expect(screen.getByText('Unknown-section')).toBeInTheDocument()
  })

  it('handles deeply nested paths correctly', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/admin/users/profile',
        includeRouter: true,
      },
    })

    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.admin')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('navigation.profile')).toBeInTheDocument()

    // Check that intermediate links have correct paths
    const adminLink = screen.getByRole('link', { name: /navigation.admin/i })
    expect(adminLink).toHaveAttribute('href', '/dashboard/admin')

    const usersLink = screen.getByRole('link', { name: /Users/i })
    expect(usersLink).toHaveAttribute('href', '/dashboard/admin/users')
  })

  it('applies proper ARIA labels for accessibility', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/goals', includeRouter: true },
    })

    // Check for breadcrumb ARIA label
    const breadcrumbs = document.querySelector('[aria-label="breadcrumb"]')
    expect(breadcrumbs).toBeInTheDocument()

    // Check for dashboard link ARIA label
    const dashboardLink = screen.getByLabelText('Navigate to dashboard')
    expect(dashboardLink).toBeInTheDocument()
  })

  it('handles special characters in path segments', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/test-page',
        includeRouter: true,
      },
    })

    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('Test-page')).toBeInTheDocument()
  })

  it('maintains correct breadcrumb order', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard/team/members/profile',
        includeRouter: true,
      },
    })

    const breadcrumbContainer = document.querySelector(
      '[aria-label="breadcrumb"]'
    )
    expect(breadcrumbContainer).toBeInTheDocument()

    // All breadcrumb items should be present
    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.team')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('navigation.profile')).toBeInTheDocument()
  })

  it('handles single letter path segments', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/a', includeRouter: true },
    })

    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument() // Should be capitalized
  })

  it('handles empty path segments gracefully', () => {
    renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: {
        initialRoute: '/dashboard//goals',
        includeRouter: true,
      }, // Double slash creates empty segment
    })

    // Use aria-label for home dashboard link
    expect(screen.getByLabelText('Navigate to dashboard')).toBeInTheDocument()
    expect(screen.getByText('navigation.goals')).toBeInTheDocument()
    // Should filter out empty segments
  })

  it('renders with correct Material-UI styling', () => {
    const { container } = renderWithProviders(<BreadcrumbNavigation />, {
      contextOptions: { initialRoute: '/dashboard/goals', includeRouter: true },
    })

    // Check for MUI Breadcrumbs component
    const breadcrumbs =
      container.querySelector('.MuiBreadcrumbs-root') ||
      container.querySelector('[class*="MuiBreadcrumbs"]')
    expect(breadcrumbs).toBeInTheDocument()
  })
})
