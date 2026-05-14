/**
 * AnalyticsTabSection component
 * Analytics tab content for the Team Member Dashboard.
 * RBAC-gated: visible only for PeopleManager, Director, Administrator (AC-015, AC-020).
 * Scopes AnalyticsContent to the viewed employee (AC-016, AC-017).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Alert, Box } from '@mui/material'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnalyticsContent } from '../../../components/analytics/AnalyticsContent'
import { EUserRole } from '../../../models'
import { useAuthStore } from '../../../stores/authStore'

export interface AnalyticsTabSectionProps {
  employeeId: string
}

const getStyles = () => ({
  container: { pt: 2 },
})

/**
 * Renders analytics content scoped to the given employee.
 * Hidden for Employee and SolutionOwner roles (AC-020).
 */
const AnalyticsTabSection: React.FC<AnalyticsTabSectionProps> = memo(
  ({ employeeId }) => {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const styles = useMemo(() => getStyles(), [])

    const userRoles = user?.roles ?? []
    const allowedRoles: string[] = [
      EUserRole.PEOPLE_MANAGER,
      EUserRole.DIRECTOR,
      EUserRole.ADMINISTRATOR,
    ]

    const hasAccess = allowedRoles.some(role =>
      userRoles.includes(role as EUserRole)
    )

    if (!hasAccess) {
      return (
        <Alert severity='error' sx={{ mt: 2 }}>
          {t(
            'analytics.tab.forbidden',
            'You do not have permission to view analytics for this employee.'
          )}
        </Alert>
      )
    }

    return (
      <Box sx={styles.container}>
        <AnalyticsContent employeeId={employeeId} />
      </Box>
    )
  }
)

AnalyticsTabSection.displayName = 'AnalyticsTabSection'

export default AnalyticsTabSection
