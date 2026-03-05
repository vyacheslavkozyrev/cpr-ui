// Time Range Selector Component - Feature 0005 Task T088
// Dropdown selector for analytics time ranges with custom date picker

import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatDateToISO,
  TimeRangePreset,
  type CustomDateRange,
} from '../../utils/analyticsCalculations'

export interface TimeRangeSelectorProps {
  /** Current preset */
  preset: TimeRangePreset
  /** Custom date range (if preset is 'custom') */
  customRange?: CustomDateRange | undefined
  /** Whether comparison is enabled */
  includeComparison: boolean
  /** Callback when preset or custom range changes */
  onPresetChange: (
    preset: TimeRangePreset,
    customRange?: CustomDateRange
  ) => void
  /** Callback when comparison toggle changes */
  onComparisonToggle: () => void
}

/**
 * Time Range Selector Component
 * Allows selecting predefined time ranges or custom date range
 * Includes comparison toggle switch
 */
export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  preset,
  customRange,
  includeComparison,
  onPresetChange,
  onComparisonToggle,
}) => {
  const { t } = useTranslation()
  const [showCustomPicker, setShowCustomPicker] = useState(
    preset === TimeRangePreset.Custom
  )
  const [tempStartDate, setTempStartDate] = useState(
    customRange?.start_date || ''
  )
  const [tempEndDate, setTempEndDate] = useState(customRange?.end_date || '')

  // Handle preset change from dropdown
  const handlePresetChange = (event: SelectChangeEvent<string>) => {
    const newPreset = event.target.value as TimeRangePreset

    if (newPreset === TimeRangePreset.Custom) {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
      onPresetChange(newPreset, undefined)
    }
  }

  // Handle custom date range apply
  const handleApplyCustomRange = () => {
    if (tempStartDate && tempEndDate) {
      const customRange: CustomDateRange = {
        start_date: tempStartDate,
        end_date: tempEndDate,
      }
      onPresetChange(TimeRangePreset.Custom, customRange)
      setShowCustomPicker(false)
    }
  }

  // Handle custom date range cancel
  const handleCancelCustomRange = () => {
    setShowCustomPicker(false)
    // Reset to previous preset if custom was not applied
    if (!customRange) {
      onPresetChange(TimeRangePreset.YearToDate, undefined)
    }
  }

  // Get today's date for max constraint
  const today = formatDateToISO(new Date())

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'stretch', sm: 'center' },
      }}
    >
      {/* Time Range Dropdown */}
      <Select
        value={showCustomPicker ? TimeRangePreset.Custom : preset}
        onChange={handlePresetChange}
        size='small'
        sx={{ minWidth: { xs: '100%', sm: 200 } }}
      >
        <MenuItem value={TimeRangePreset.Last30Days}>
          {t('feedback.analytics.timeRange.last30Days', 'Last 30 Days')}
        </MenuItem>
        <MenuItem value={TimeRangePreset.Last90Days}>
          {t('feedback.analytics.timeRange.last90Days', 'Last 90 Days')}
        </MenuItem>
        <MenuItem value={TimeRangePreset.Last6Months}>
          {t('feedback.analytics.timeRange.last6Months', 'Last 6 Months')}
        </MenuItem>
        <MenuItem value={TimeRangePreset.YearToDate}>
          {t('feedback.analytics.timeRange.yearToDate', 'Year to Date')}
        </MenuItem>
        <MenuItem value={TimeRangePreset.AllTime}>
          {t('feedback.analytics.timeRange.allTime', 'All Time')}
        </MenuItem>
        <MenuItem value={TimeRangePreset.Custom}>
          {t('feedback.analytics.timeRange.custom', 'Custom Range')}
        </MenuItem>
      </Select>

      {/* Custom Date Range Picker (shown when Custom is selected) */}
      {showCustomPicker && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            type='date'
            label={t('feedback.analytics.customRange.startDate', 'Start Date')}
            value={tempStartDate}
            onChange={e => setTempStartDate(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today }}
          />
          <TextField
            type='date'
            label={t('feedback.analytics.customRange.endDate', 'End Date')}
            value={tempEndDate}
            onChange={e => setTempEndDate(e.target.value)}
            size='small'
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today, min: tempStartDate }}
          />
          <Button
            variant='contained'
            size='small'
            onClick={handleApplyCustomRange}
            disabled={!tempStartDate || !tempEndDate}
          >
            {t('common.apply', 'Apply')}
          </Button>
          <Button
            variant='outlined'
            size='small'
            onClick={handleCancelCustomRange}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
        </Box>
      )}

      {/* Comparison Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={includeComparison}
            onChange={onComparisonToggle}
            size='small'
          />
        }
        label={t('feedback.analytics.comparison.toggle', 'Compare Periods')}
        sx={{ ml: { xs: 0, sm: 2 } }}
      />
    </Box>
  )
}
