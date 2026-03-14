import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { IPositionInTrack } from '@/types/taxonomy.types'

interface IPositionCardProps {
  position: IPositionInTrack
  loading?: boolean
  onClick?: () => void
}

const getStyles = () => ({
  card: {
    mb: 1,
  },
  title: {
    fontWeight: 600,
  },
  description: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    mt: 0.5,
  },
  accordion: {
    boxShadow: 'none',
    '&:before': { display: 'none' },
    mt: 1,
  },
  accordionSummary: {
    p: 0,
    minHeight: 'unset',
    '& .MuiAccordionSummary-content': { m: 0 },
  },
  accordionDetails: {
    p: 0,
    pt: 1,
  },
})

const PositionCard: React.FC<IPositionCardProps> = React.memo(
  ({ position, loading, onClick }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const handleAccordionClick = useCallback(
      (e: React.MouseEvent) => e.stopPropagation(),
      []
    )

    if (loading) {
      return (
        <Card sx={styles.card}>
          <CardContent>
            <Skeleton variant='text' width='50%' height={24} />
            <Skeleton variant='text' width='90%' />
            <Skeleton variant='text' width='80%' />
          </CardContent>
        </Card>
      )
    }

    const inner = (
      <CardContent>
        <Typography variant='subtitle1' sx={styles.title}>
          {position.title}
        </Typography>
        {position.description && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={styles.description}
          >
            {position.description}
          </Typography>
        )}
        {position.expectations && (
          <Accordion
            sx={styles.accordion}
            disableGutters
            onClick={handleAccordionClick}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={styles.accordionSummary}
            >
              <Typography variant='caption' color='primary'>
                {t('taxonomy.position.expectations', 'Expectations')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={styles.accordionDetails}>
              <Typography variant='body2' color='text.secondary'>
                {position.expectations}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    )

    return (
      <Card sx={styles.card}>
        {onClick ? (
          <CardActionArea component='span' onClick={onClick}>
            {inner}
          </CardActionArea>
        ) : (
          inner
        )}
      </Card>
    )
  }
)

PositionCard.displayName = 'PositionCard'

export default PositionCard
