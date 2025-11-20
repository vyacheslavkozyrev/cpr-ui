import { Box, Container, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const getStyles = () => ({
  footer: {
    py: 2,
    px: 2,
    mt: 'auto',
    backgroundColor: 'background.paper',
    borderTop: 1,
    borderColor: 'divider',
  },
})

/**
 * Footer Component
 * Simple application footer
 */
export const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const styles = useMemo(() => getStyles(), [])

  return (
    <Box component='footer' sx={styles.footer}>
      <Container maxWidth='xl'>
        <Typography variant='body2' color='text.secondary' align='center'>
          {t('footer.copyright', { year: currentYear })}
        </Typography>
      </Container>
    </Box>
  )
}
