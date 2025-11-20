import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const AdminPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {t('pages.admin.title')}
      </Typography>
      <Typography>{t('pages.admin.comingSoon')}</Typography>
    </Box>
  )
}
