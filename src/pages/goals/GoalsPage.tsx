import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {t('pages.goals.title')}
      </Typography>
      <Typography>{t('pages.goals.comingSoon')}</Typography>
    </Box>
  )
}
