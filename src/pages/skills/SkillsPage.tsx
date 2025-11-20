import { Box, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const SkillsPage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        {t('pages.skills.title')}
      </Typography>
      <Typography>{t('pages.skills.comingSoon')}</Typography>
    </Box>
  )
}
