import { Alert, Box, CircularProgress, Grid, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { mapTeamMember } from '../../mappers/teamMemberMapper'
import { useMyTeam } from '../../services/teamQueryService'
import { TeamMemberCard } from './components/TeamMemberCard'

const getStyles = () => ({
  container: { p: 3 },
  grid: { mt: 2 },
  emptyBox: { textAlign: 'center', py: 6 },
})

/**
 * Page listing all direct reports for the authenticated manager.
 * Route: /team (PeopleManager / Director only)
 */
const TeamListPage: React.FC = memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])

  const { data, isLoading, isError } = useMyTeam()

  const members = useMemo(() => (data?.data ?? []).map(mapTeamMember), [data])

  return (
    <Box sx={styles.container}>
      <Typography variant='h4' gutterBottom>
        {t('team_list.title', 'My Team')}
      </Typography>

      {isLoading && (
        <Box display='flex' justifyContent='center' py={4}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity='error'>
          {t('team_list.load_error', 'Failed to load team members.')}
        </Alert>
      )}

      {!isLoading && !isError && members.length === 0 && (
        <Box sx={styles.emptyBox}>
          <Typography color='text.secondary'>
            {t('team_list.empty', 'No direct reports found.')}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && members.length > 0 && (
        <Grid container spacing={2} sx={styles.grid}>
          {members.map(member => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={member.id}>
              <TeamMemberCard member={member} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
})

TeamListPage.displayName = 'TeamListPage'

export default TeamListPage
