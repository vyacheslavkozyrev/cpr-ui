import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ITeamMemberSummary } from '../../types/skillAssessment.types'

interface TeamSkillOverviewTableProps {
  members: ITeamMemberSummary[]
  loading?: boolean
}

const TeamSkillOverviewTable: React.FC<TeamSkillOverviewTableProps> = ({
  members,
  loading = false,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>
              {t('pages.teamSkillOverview.columnName', 'Name')}
            </TableCell>
            <TableCell>
              {t('pages.teamSkillOverview.columnPosition', 'Position')}
            </TableCell>
            <TableCell align='center'>
              {t('pages.teamSkillOverview.columnAssessed', 'Assessed')}
            </TableCell>
            <TableCell align='center'>
              {t(
                'pages.teamSkillOverview.columnMeeting',
                'Meeting Requirement'
              )}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align='center'>
                <Typography color='text.secondary' variant='body2'>
                  {t(
                    'pages.teamSkillOverview.emptyState',
                    'No direct reports found.'
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            members.map(member => (
              <TableRow
                key={member.employee_id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() =>
                  navigate(`/skills/employees/${member.employee_id}/assessment`)
                }
              >
                <TableCell>{member.display_name}</TableCell>
                <TableCell>{member.position_title ?? '—'}</TableCell>
                <TableCell align='center'>
                  {member.assessed_skill_count} / {member.total_required_skills}
                </TableCell>
                <TableCell align='center'>
                  {member.skills_meeting_requirement_count} /{' '}
                  {member.total_required_skills}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TeamSkillOverviewTable
