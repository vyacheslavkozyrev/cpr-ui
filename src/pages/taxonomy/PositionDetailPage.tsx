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
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { RoleGuard } from '@/components/auth'
import SkillDetailPanel from '@/components/taxonomy/SkillDetailPanel'
import SkillRadarChart from '@/components/taxonomy/SkillRadarChart'
import SkillRequirementsTable from '@/components/taxonomy/SkillRequirementsTable'
import PositionForm from '@/components/taxonomy/admin/PositionForm'
import PositionSkillsPanel from '@/components/taxonomy/admin/PositionSkillsPanel'
import { EUserRole } from '@/models'
import { usePosition } from '@/hooks/useTaxonomy'
import type { IPositionSkillRequirement } from '@/types/taxonomy.types'

// W1: factory function per CLAUDE.md convention
const getStyles = () => ({
  container: {
    py: 3,
  },
  breadcrumbs: {
    mb: 2,
  },
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
  bodyText: {
    mt: 1,
  },
  section: {
    mt: 3,
  },
  sectionHeader: {
    mb: 2,
  },
  tabs: {
    mb: 2,
  },
  categoryLabel: {
    mb: 2,
    fontWeight: 600,
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
  const [activeCategoryId, setActiveCategoryId] = useState<string>('')

  const categories = useMemo(
    () =>
      position
        ? Array.from(
            new Map(
              position.skills.map(s => [
                s.category_id,
                { id: s.category_id, title: s.category_title },
              ])
            ).values()
          )
        : [],
    [position]
  )

  // W4: only reset tab if the active category no longer exists after a mutation
  useEffect(() => {
    if (activeCategoryId && !categories.some(c => c.id === activeCategoryId)) {
      setActiveCategoryId('')
    }
  }, [categories, activeCategoryId])

  const effectiveCategoryId = useMemo(
    () => activeCategoryId || categories[0]?.id || '',
    [activeCategoryId, categories]
  )

  const filteredSkills = useMemo(
    () =>
      position?.skills.filter(s => s.category_id === effectiveCategoryId) ?? [],
    [position, effectiveCategoryId]
  )

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

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: string) =>
      setActiveCategoryId(newValue),
    []
  )

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={styles.container}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !position) {
    return (
      <Container maxWidth='lg' sx={styles.container}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={refetch}>
              {t('common.retry')}
            </Button>
          }
        >
          {t('taxonomy.errors.loadFailed')}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={styles.container}>
      {/* S2: breadcrumbs margin extracted to styles */}
      <Breadcrumbs sx={styles.breadcrumbs}>
        <MuiLink
          component={Link}
          to='/career-framework'
          underline='hover'
          color='inherit'
        >
          {t('taxonomy.careerFramework.title')}
        </MuiLink>
        {/* S6: guard against undefined route params */}
        <MuiLink
          component={Link}
          to={pathId ? `/career-framework/${pathId}` : '/career-framework'}
          underline='hover'
          color='inherit'
        >
          {position.career_path_title}
        </MuiLink>
        <MuiLink
          component={Link}
          to={
            pathId && trackId
              ? `/career-framework/${pathId}/tracks/${trackId}`
              : '/career-framework'
          }
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
            <Typography
              variant='body1'
              color='text.secondary'
              sx={styles.bodyText}
            >
              {position.description}
            </Typography>
          )}
          {position.expectations && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={styles.bodyText}
            >
              <strong>{t('taxonomy.position.expectations')}: </strong>
              {position.expectations}
            </Typography>
          )}
        </Box>
        <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]} fallback={null}>
          <Box sx={styles.actions}>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              size='small'
            >
              {t('taxonomy.position.edit')}
            </Button>
            <Button
              variant='contained'
              startIcon={<ManageSearchIcon />}
              onClick={handleManageSkillsOpen}
              size='small'
            >
              {t('taxonomy.position.manageSkills')}
            </Button>
          </Box>
        </RoleGuard>
      </Box>

      <Divider />

      <Box sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionHeader}>
          {t('taxonomy.position.skillProfile')}
        </Typography>
        {categories.length > 1 ? (
          <Tabs
            value={effectiveCategoryId}
            onChange={handleTabChange}
            sx={styles.tabs}
          >
            {categories.map(cat => (
              <Tab key={cat.id} label={cat.title} value={cat.id} />
            ))}
          </Tabs>
        ) : (
          categories.length === 1 && (
            <Typography variant='subtitle2' sx={styles.categoryLabel}>
              {categories[0].title}
            </Typography>
          )
        )}
        <SkillRadarChart skills={filteredSkills} />
      </Box>

      <Box sx={styles.section}>
        <Typography variant='h6' sx={styles.sectionHeader}>
          {t('taxonomy.position.skillRequirements')}
        </Typography>
        <SkillRequirementsTable
          skills={filteredSkills}
          onSkillClick={handleSkillClick}
        />
      </Box>

      <SkillDetailPanel
        skillId={selectedSkill?.skill_id ?? null}
        requiredLevelId={selectedSkill?.skill_level_id ?? null}
        open={skillPanelOpen}
        onClose={handleSkillPanelClose}
      />

      <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]} fallback={null}>
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
          <DialogTitle>{t('taxonomy.position.manageSkills')}</DialogTitle>
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
