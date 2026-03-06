import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IPositionInTrack } from '@/types/taxonomy.types'
import PositionCard from './PositionCard'

interface IProgressionLadderProps {
  positions: IPositionInTrack[]
  loading?: boolean
  onPositionClick?: (positionId: string) => void
}

const getStyles = () => ({
  container: {
    position: 'relative',
  },
  connector: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    my: 0.5,
  },
  connectorLine: {
    width: 2,
    height: 24,
    bgcolor: 'divider',
  },
  connectorArrow: {
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '8px solid',
    borderTopColor: 'divider',
  },
  emptyState: {
    py: 4,
    textAlign: 'center' as const,
    color: 'text.secondary',
  },
})

const ProgressionLadder: React.FC<IProgressionLadderProps> = React.memo(
  ({ positions, loading, onPositionClick }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (loading) {
      return (
        <Box sx={styles.container}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PositionCard
              key={i}
              position={{
                id: '',
                title: '',
                description: null,
                expectations: null,
                sort_order: i,
              }}
              loading
            />
          ))}
        </Box>
      )
    }

    if (positions.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('taxonomy.careerTrack.noPositions', 'No positions available.')}
          </Typography>
        </Box>
      )
    }

    // Sort descending by sort_order (highest = most senior = top); alphabetical tiebreak
    const sorted = [...positions].sort((a, b) => {
      const o = b.sort_order - a.sort_order
      return o !== 0 ? o : a.title.localeCompare(b.title)
    })

    return (
      <Box sx={styles.container}>
        {sorted.map((position, index) => (
          <React.Fragment key={position.id}>
            <PositionCard
              position={position}
              {...(onPositionClick
                ? { onClick: () => onPositionClick(position.id) }
                : {})}
            />
            {index < sorted.length - 1 && (
              <Box sx={styles.connector}>
                <Box sx={styles.connectorLine} />
                <Box sx={styles.connectorArrow} />
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    )
  }
)

ProgressionLadder.displayName = 'ProgressionLadder'

export default ProgressionLadder
