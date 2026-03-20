import { Home } from '@mui/icons-material'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'

// Style factory outside component
const getStyles = () => ({
  breadcrumbs: {
    mb: 2,
  },
  homeIcon: {
    mr: 0.5,
    fontSize: 'inherit',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
})

interface IBreadcrumbItem {
  label: string
  path?: string
}

/**
 * BreadcrumbNavigation Component
 * Displays hierarchical navigation breadcrumbs based on current route
 */
export const BreadcrumbNavigation: React.FC = () => {
  const styles = useMemo(() => getStyles(), [])
  const { t } = useTranslation()
  const location = useLocation()

  // UUID/ULID-like segment — treat as a detail page ID
  const isIdSegment = useCallback(
    (segment: string): boolean => /^[0-9a-f-]{8,}$/i.test(segment),
    []
  )

  // Helper function to get human-readable labels for path segments
  const getBreadcrumbLabel = useCallback(
    (segment: string, parentSegment?: string): string => {
      if (isIdSegment(segment)) {
        // Map known parent routes to their detail-page titles
        const detailTitleMap: Record<string, string> = {
          reviews: t('pages.reviewCycleDetail.title'),
          goals: t('navigation.goals'),
        }
        return detailTitleMap[parentSegment ?? ''] ?? t('common.view')
      }

      const labelMap: Record<string, string> = {
        dashboard: t('navigation.dashboard'),
        goals: t('navigation.goals'),
        skills: t('navigation.skills'),
        'career-framework': t('navigation.careerFramework'),
        feedback: t('navigation.feedback'),
        reviews: t('pages.feedback.tabs.reviews360'),
        team: t('navigation.team'),
        admin: t('navigation.admin'),
        profile: t('navigation.profile'),
        settings: t('navigation.settings'),
        request: t('pages.feedback.request.form.title'),
        new: t('common.create'),
        give: t('pages.feedback.new.title'),
      }

      return (
        labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      )
    },
    [t, isIdSegment]
  )

  // Override path for segments that belong to a different nav section
  const getSegmentPath = useCallback(
    (segment: string, builtPath: string): string => {
      // Review cycle detail pages are reached from /feedback (360 Reviews tab)
      if (segment === 'reviews') return '/feedback'
      return builtPath
    },
    []
  )

  // Generate breadcrumb items based on current path
  const breadcrumbItems = useMemo((): IBreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean)

    if (pathSegments.length === 0) {
      return []
    }

    const items: IBreadcrumbItem[] = []

    // Build breadcrumbs from path segments
    let currentPath = ''

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const parentSegment = index > 0 ? pathSegments[index - 1] : undefined
      const label = getBreadcrumbLabel(segment, parentSegment)

      // Don't create breadcrumb for the current page
      if (index === pathSegments.length - 1) {
        items.push({ label })
      } else {
        items.push({
          label,
          path: getSegmentPath(segment, currentPath),
        })
      }
    })

    return items
  }, [location.pathname, getBreadcrumbLabel, getSegmentPath])

  // Don't show breadcrumbs on root dashboard
  if (breadcrumbItems.length === 0 || location.pathname === '/dashboard') {
    return null
  }

  return (
    <Breadcrumbs aria-label='breadcrumb' sx={styles.breadcrumbs}>
      {/* Home breadcrumb */}
      <Link
        component={RouterLink}
        to='/dashboard'
        sx={styles.link}
        aria-label='Navigate to dashboard'
      >
        <Home sx={styles.homeIcon} />
        {t('navigation.dashboard')}
      </Link>

      {/* Dynamic breadcrumbs */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return isLast ? (
          <Typography key={item.label} color='textPrimary'>
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.label}
            component={RouterLink}
            to={item.path!}
            sx={styles.link}
          >
            {item.label}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
