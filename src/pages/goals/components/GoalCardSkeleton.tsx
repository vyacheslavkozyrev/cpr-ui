import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material'
import React from 'react'

/**
 * Goal Card Skeleton Loader
 * Displays loading placeholder for goal cards
 * Feature 0001 - Phase 5A
 */
export const GoalCardSkeleton: React.FC = () => {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, width: '100%' }}>
        {/* Status chips skeleton */}
        <Stack direction='row' spacing={1} mb={1}>
          <Skeleton variant='rounded' width={80} height={24} />
          <Skeleton variant='rounded' width={60} height={24} />
        </Stack>

        {/* Title skeleton */}
        <Skeleton variant='text' width='90%' height={32} sx={{ mb: 1 }} />
        <Skeleton variant='text' width='70%' height={32} />

        {/* Description skeleton */}
        <Box mt={2} mb={2}>
          <Skeleton variant='text' width='100%' />
          <Skeleton variant='text' width='85%' />
        </Box>

        {/* Progress bar skeleton */}
        <Box mb={1}>
          <Stack direction='row' justifyContent='space-between' mb={0.5}>
            <Skeleton variant='text' width={60} height={16} />
            <Skeleton variant='text' width={30} height={16} />
          </Stack>
          <Skeleton variant='rounded' width='100%' height={6} />
        </Box>

        {/* Tasks count skeleton */}
        <Skeleton variant='text' width={120} height={16} sx={{ mt: 1 }} />

        {/* Deadline skeleton */}
        <Skeleton variant='text' width={140} height={16} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  )
}
