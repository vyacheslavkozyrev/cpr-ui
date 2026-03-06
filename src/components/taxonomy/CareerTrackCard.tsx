import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ICareerTrackSummary } from '@/types/taxonomy.types'

interface ICareerTrackCardProps {
  careerTrack: ICareerTrackSummary
  onClick: () => void
  loading?: boolean
}

const getStyles = () => ({
  card: {
    mb: 2,
  },
  actionArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
  },
  content: {
    flex: 1,
    p: 0,
  },
  arrow: {
    color: 'text.secondary',
    ml: 1,
  },
})

const CareerTrackCard: React.FC<ICareerTrackCardProps> = React.memo(
  ({ careerTrack, onClick, loading }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (loading) {
      return (
        <Card sx={styles.card}>
          <CardContent>
            <Skeleton variant='text' width='60%' height={28} />
            <Skeleton variant='text' width='90%' />
          </CardContent>
        </Card>
      )
    }

    return (
      <Card sx={styles.card}>
        <CardActionArea onClick={onClick} sx={styles.actionArea}>
          <CardContent sx={styles.content}>
            <Typography variant='h6' component='h3'>
              {careerTrack.title}
            </Typography>
            {careerTrack.description && (
              <Typography variant='body2' color='text.secondary'>
                {careerTrack.description}
              </Typography>
            )}
            {!careerTrack.description && (
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'taxonomy.careerTrack.noDescription',
                  'No description available.'
                )}
              </Typography>
            )}
          </CardContent>
          <ArrowForwardIosIcon sx={styles.arrow} fontSize='small' />
        </CardActionArea>
      </Card>
    )
  }
)

CareerTrackCard.displayName = 'CareerTrackCard'

export default CareerTrackCard
