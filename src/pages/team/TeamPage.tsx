import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const TeamPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {t('pages.team.title')}
      </Typography>
      <Typography>{t('pages.team.comingSoon')}</Typography>
    </Box>
  )
}
