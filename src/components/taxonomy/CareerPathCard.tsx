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
import type { ICareerPathSummary } from '@/types/taxonomy.types'

interface ICareerPathCardProps {
  careerPath: ICareerPathSummary
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

const CareerPathCard: React.FC<ICareerPathCardProps> = React.memo(
  ({ careerPath, onClick, loading }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (loading) {
      return (
        <Card sx={styles.card}>
          <CardContent>
            <Skeleton variant='text' width='60%' height={28} />
            <Skeleton variant='text' width='90%' />
            <Skeleton variant='text' width='80%' />
          </CardContent>
        </Card>
      )
    }

    return (
      <Card sx={styles.card}>
        <CardActionArea onClick={onClick} sx={styles.actionArea}>
          <CardContent sx={styles.content}>
            <Typography variant='h6' component='h3'>
              {careerPath.title}
            </Typography>
            {careerPath.description && (
              <Typography variant='body2' color='text.secondary'>
                {careerPath.description}
              </Typography>
            )}
            {!careerPath.description && (
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'taxonomy.careerPath.noDescription',
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

CareerPathCard.displayName = 'CareerPathCard'

export default CareerPathCard
