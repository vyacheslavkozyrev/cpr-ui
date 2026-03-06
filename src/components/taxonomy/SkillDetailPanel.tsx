import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkill } from '@/services/taxonomyQueryService'

interface ISkillDetailPanelProps {
  skillId: string | null
  requiredLevelId: string | null
  open: boolean
  onClose: () => void
}

const DRAWER_WIDTH = 380

const getStyles = () => ({
  drawer: {
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    pb: 1,
  },
  body: {
    p: 2,
    overflowY: 'auto' as const,
    flex: 1,
  },
  categoryBadge: {
    mb: 2,
  },
  levelsTitle: {
    mt: 2,
    mb: 1,
    fontWeight: 600,
  },
  levelItem: {
    borderRadius: 1,
    mb: 0.5,
  },
  requiredLevel: {
    bgcolor: 'primary.light',
    '& .MuiListItemText-primary': {
      color: 'primary.contrastText',
      fontWeight: 600,
    },
    '& .MuiListItemText-secondary': {
      color: 'primary.contrastText',
    },
  },
})

const SkillDetailPanel: React.FC<ISkillDetailPanelProps> = React.memo(
  ({ skillId, requiredLevelId, open, onClose }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const { data: skill, isLoading } = useSkill(skillId ?? '')

    const sortedLevels = useMemo(
      () =>
        skill?.levels
          ? [...skill.levels].sort((a, b) => a.value - b.value)
          : [],
      [skill]
    )

    return (
      <Drawer anchor='right' open={open} onClose={onClose} sx={styles.drawer}>
        <Box sx={styles.header}>
          <Typography variant='h6'>
            {isLoading ? (
              <Skeleton width={180} />
            ) : (
              (skill?.title ?? t('taxonomy.skill.detail', 'Skill Detail'))
            )}
          </Typography>
          <IconButton
            onClick={onClose}
            size='small'
            aria-label={t('common.close', 'Close')}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={styles.body}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && skill && (
            <>
              <Box sx={styles.categoryBadge}>
                <Chip
                  label={skill.category_title}
                  size='small'
                  color='secondary'
                />
              </Box>

              {skill.description && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  {skill.description}
                </Typography>
              )}

              <Typography variant='subtitle2' sx={styles.levelsTitle}>
                {t('taxonomy.skill.proficiencyLevels', 'Proficiency Levels')}
              </Typography>

              {requiredLevelId && (
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mb: 1, display: 'block' }}
                >
                  {t('taxonomy.skill.requiredLevel', 'Required Level')}
                  {': '}
                  {sortedLevels.find(l => l.id === requiredLevelId)?.title ??
                    ''}
                </Typography>
              )}

              <List disablePadding>
                {sortedLevels.map(level => {
                  const isRequired = level.id === requiredLevelId
                  return (
                    <ListItem
                      key={level.id}
                      sx={{
                        ...styles.levelItem,
                        ...(isRequired ? styles.requiredLevel : {}),
                      }}
                    >
                      <ListItemText
                        primary={`${level.value}. ${level.title}`}
                        secondary={level.description}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {isRequired && (
                        <Chip
                          label={t('taxonomy.skill.requiredLevel', 'Required')}
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      )}
                    </ListItem>
                  )
                })}
              </List>
            </>
          )}
        </Box>
      </Drawer>
    )
  }
)

SkillDetailPanel.displayName = 'SkillDetailPanel'

export default SkillDetailPanel
