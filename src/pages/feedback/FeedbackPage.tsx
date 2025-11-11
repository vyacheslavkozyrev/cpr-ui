import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const FeedbackPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {t('pages.feedback.title')}
      </Typography>
      <Typography>{t('pages.feedback.comingSoon')}</Typography>
    </Box>
  )
}
