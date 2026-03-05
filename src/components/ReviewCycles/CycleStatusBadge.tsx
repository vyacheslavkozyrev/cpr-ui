import { Chip } from '@mui/material'
import type { ChipOwnProps } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { EReviewCycleStatus } from '../../types/reviewCycle.types'

interface CycleStatusBadgeProps {
  status: EReviewCycleStatus
}

const STATUS_COLOR_MAP: Record<
  EReviewCycleStatus,
  NonNullable<ChipOwnProps['color']>
> = {
  [EReviewCycleStatus.DRAFT]: 'default',
  [EReviewCycleStatus.OPEN]: 'info',
  [EReviewCycleStatus.IN_PROGRESS]: 'warning',
  [EReviewCycleStatus.CLOSED]: 'success',
}

const CycleStatusBadge: React.FC<CycleStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation()
  return (
    <Chip
      label={t(`enums.reviewCycleStatus.${status}`)}
      color={STATUS_COLOR_MAP[status]}
      size='small'
    />
  )
}

export default CycleStatusBadge
