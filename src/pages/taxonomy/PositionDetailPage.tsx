import EditIcon from '@mui/icons-material/Edit'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Link as MuiLink,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { RoleGuard } from '@/components/auth'
import SkillDetailPanel from '@/components/taxonomy/SkillDetailPanel'
import SkillRadarChart from '@/components/taxonomy/SkillRadarChart'
import SkillRequirementsTable from '@/components/taxonomy/SkillRequirementsTable'
import PositionForm from '@/components/taxonomy/admin/PositionForm'
import PositionSkillsPanel from '@/components/taxonomy/admin/PositionSkillsPanel'
import { UserRole } from '@/models'
import { usePosition } from '@/services/taxonomyQueryService'
import type { IPositionSkillRequirement } from '@/types/taxonomy.types'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    mb: 3,
  },
  actions: {
    display: 'flex',
    gap: 1,
    flexShrink: 0,
    ml: 2,
  },
  section: {
    mt: 3,
  },
})

const PositionDetailPage: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { pathId, trackId, positionId } = useParams<{
    pathId: string
    trackId: string
    positionId: string
  }>()

  const {
    data: position,
    isLoading,
    isError,
    refetch,
  } = usePosition(positionId ?? '')

  const [editFormOpen, setEditFormOpen] = useState(false)
  const [manageSkillsOpen, setManageSkillsOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] =
    useState<IPositionSkillRequirement | null>(null)
  const [skillPanelOpen, setSkillPanelOpen] = useState(false)

  const handleRefetch = useCallback(() => refetch(), [refetch])
  const handleEditOpen = useCallback(() => setEditFormOpen(true), [])
  const handleEditClose = useCallback(() => setEditFormOpen(false), [])
  const handleManageSkillsOpen = useCallback(
    () => setManageSkillsOpen(true),
    []
  )
  const handleManageSkillsClose = useCallback(
    () => setManageSkillsOpen(false),
    []
  )

  const handleSkillClick = useCallback(
    (skillId: string) => {
      const requirement = position?.skills.find(s => s.skill_id === skillId)
      if (requirement) {
        setSelectedSkill(requirement)
        setSkillPanelOpen(true)
      }
    },
    [position]
  )

  const handleSkillPanelClose = useCallback(() => {
    setSkillPanelOpen(false)
    setSelectedSkill(null)
  }, [])

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !position) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={handleRefetch}>
              {t('common.retry', 'Retry')}
            </Button>
          }
        >
          {t(
            'taxonomy.errors.loadFailed',
            'Failed to load data. Please try again.'
          )}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component={Link}
          to='/career-framework'
          underline='hover'
          color='inherit'
        >
          {t('taxonomy.careerFramework.title', 'Career Framework')}
        </MuiLink>
        <MuiLink
          component={Link}
          to={`/career-framework/${pathId}`}
          underline='hover'
          color='inherit'
        >
          {position.career_path_title}
        </MuiLink>
        <MuiLink
          component={Link}
          to={`/career-framework/${pathId}/tracks/${trackId}`}
          underline='hover'
          color='inherit'
        >
          {position.career_track_title}
        </MuiLink>
        <Typography color='text.primary'>{position.title}</Typography>
      </Breadcrumbs>

      <Box sx={styles.header}>
        <Box>
          <Typography variant='h5' component='h1'>
            {position.title}
          </Typography>
          {position.description && (
            <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
              {position.description}
            </Typography>
          )}
          {position.expectations && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              <strong>
                {t('taxonomy.position.expectations', 'Expectations')}:{' '}
              </strong>
              {position.expectations}
            </Typography>
          )}
        </Box>
        <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]} fallback={null}>
          <Box sx={styles.actions}>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              size='small'
            >
              {t('taxonomy.position.edit', 'Edit Position')}
            </Button>
            <Button
              variant='contained'
              startIcon={<ManageSearchIcon />}
              onClick={handleManageSkillsOpen}
              size='small'
            >
              {t('taxonomy.position.manageSkills', 'Manage Skills')}
            </Button>
          </Box>
        </RoleGuard>
      </Box>

      <Divider />

      <Box sx={styles.section}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('taxonomy.position.skillProfile', 'Skill Profile')}
        </Typography>
        <SkillRadarChart skills={position.skills} />
      </Box>

      <Box sx={styles.section}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {t('taxonomy.position.skillRequirements', 'Skill Requirements')}
        </Typography>
        <SkillRequirementsTable
          skills={position.skills}
          onSkillClick={handleSkillClick}
        />
      </Box>

      <SkillDetailPanel
        skillId={selectedSkill?.skill_id ?? null}
        requiredLevelId={selectedSkill?.skill_level_id ?? null}
        open={skillPanelOpen}
        onClose={handleSkillPanelClose}
      />

      <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]} fallback={null}>
        <PositionForm
          open={editFormOpen}
          onClose={handleEditClose}
          existing={{
            id: position.id,
            title: position.title,
            description: position.description,
            expectations: position.expectations,
            sort_order: position.sort_order,
            career_track_id: position.career_track_id,
            career_track_title: position.career_track_title,
          }}
        />
        <Dialog
          open={manageSkillsOpen}
          onClose={handleManageSkillsClose}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            {t('taxonomy.position.manageSkills', 'Manage Skills')}
          </DialogTitle>
          <DialogContent>
            <PositionSkillsPanel position={position} />
          </DialogContent>
        </Dialog>
      </RoleGuard>
    </Container>
  )
})

PositionDetailPage.displayName = 'PositionDetailPage'

export default PositionDetailPage
