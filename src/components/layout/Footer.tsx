import { Box, Container, Typography } from '@mui/material'
import React from 'react'

/**
 * Footer Component
 * Simple application footer
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component='footer'
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth='xl'>
        <Typography variant='body2' color='text.secondary' align='center'>
          © {currentYear} CPR Performance Management System. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  )
}
