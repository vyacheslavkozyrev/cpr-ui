import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ITeamMember } from '../../../models/TeamMember'

interface TeamMemberCardProps {
  member: ITeamMember
}

const getStyles = () => ({
  card: {
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1.5,
    py: 3,
  },
  name: { fontWeight: 600, textAlign: 'center' },
  jobTitle: { textAlign: 'center', color: 'text.secondary' },
})

/**
 * Card displaying a direct report's avatar, name, and job title.
 * Clicking navigates to the team member dashboard.
 */
export const TeamMemberCard: React.FC<TeamMemberCardProps> = memo(
  ({ member }) => {
    const navigate = useNavigate()
    const styles = useMemo(() => getStyles(), [])

    const handleClick = useCallback(() => {
      navigate(`/team/${member.id}`)
    }, [navigate, member.id])

    return (
      <Card elevation={2} sx={styles.card}>
        <CardActionArea onClick={handleClick}>
          <CardContent sx={styles.content}>
            <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {member.initials}
            </Avatar>
            <Box>
              <Typography variant='subtitle1' sx={styles.name}>
                {member.fullName}
              </Typography>
              <Typography variant='body2' sx={styles.jobTitle}>
                {member.jobTitle}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    )
  }
)

TeamMemberCard.displayName = 'TeamMemberCard'
