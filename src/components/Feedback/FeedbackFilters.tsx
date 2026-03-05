import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalDto } from '../../dtos/GoalDto'
import type { ProjectSummaryDto } from '../../services/projectQueryService'
import type {
  FeedbackFilters as FeedbackFiltersType,
  RatingValue,
} from '../../types/feedback'

/**
 * Props for FeedbackFilters component
 */
export interface FeedbackFiltersProps {
  /** Current filter values */
  filters: FeedbackFiltersType
  /** Filter change handler */
  onFiltersChange: (filters: FeedbackFiltersType) => void
  /** Available goals for filtering */
  goals?: TGoalDto[]
  /** Available projects for filtering */
  projects?: ProjectSummaryDto[]
  /** Show as compact mode */
  compact?: boolean
}

/**
 * Feedback Filters Component
 * Filter panel for feedback list with date range, rating, goal, project, search
 * Feature 0005 - Phase 3 US-002 (T045-T047)
 */
export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({
  filters,
  onFiltersChange,
  goals = [],
  projects = [],
  compact = false,
}) => {
  const { t } = useTranslation()
  const [showFilters, setShowFilters] = useState(false)

  // Count active filters
  const activeFilterCount = [
    filters.date_from,
    filters.date_to,
    filters.rating,
    filters.goal_id,
    filters.project_id,
    filters.from_employee_id,
    filters.search,
  ].filter(Boolean).length

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || null })
  }

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      rating: value ? (Number.parseInt(value, 10) as RatingValue) : null,
    })
  }

  const handleGoalChange = (value: string) => {
    onFiltersChange({ ...filters, goal_id: value || null })
  }

  const handleProjectChange = (value: string) => {
    onFiltersChange({ ...filters, project_id: value || null })
  }

  const handleDateFromChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      date_from: date ? date.toISOString() : null,
    })
  }

  const handleDateToChange = (date: Date | null) => {
    onFiltersChange({
      ...filters,
      date_to: date ? date.toISOString() : null,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      date_from: null,
      date_to: null,
      rating: null,
      goal_id: null,
      project_id: null,
      from_employee_id: null,
      search: null,
    })
  }

  return (
    <Box>
      {/* Search and Filter Toggle */}
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder={t('pages.feedback.list.filters.search')}
          value={filters.search || ''}
          onChange={e => handleSearchChange(e.target.value)}
          size={compact ? 'small' : 'medium'}
          inputProps={{
            'aria-label': 'Search feedback',
          }}
          InputProps={{
            endAdornment: filters.search ? (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={() => handleSearchChange('')}
                  edge='end'
                  aria-label='Clear search'
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant={showFilters ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{ minWidth: 120 }}
          aria-expanded={showFilters}
          aria-controls='feedback-filters-panel'
        >
          {t('pages.feedback.list.filters.label', 'Filters')}
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </Button>
      </Stack>

      {/* Filter Panel */}
      {showFilters && (
        <Box
          id='feedback-filters-panel'
          role='region'
          aria-label='Feedback filters'
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2}>
            {/* Date Range */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction='row' spacing={2}>
                <DatePicker
                  label={t(
                    'pages.feedback.list.filters.date_from',
                    'From Date'
                  )}
                  value={filters.date_from ? new Date(filters.date_from) : null}
                  onChange={handleDateFromChange}
                  slotProps={{
                    textField: {
                      size: compact ? 'small' : 'medium',
                      fullWidth: true,
                    },
                  }}
                />
                <DatePicker
                  label={t('pages.feedback.list.filters.date_to', 'To Date')}
                  value={filters.date_to ? new Date(filters.date_to) : null}
                  onChange={handleDateToChange}
                  slotProps={{
                    textField: {
                      size: compact ? 'small' : 'medium',
                      fullWidth: true,
                    },
                  }}
                />
              </Stack>
            </LocalizationProvider>

            {/* Rating, Goal, Project Filters */}
            <Stack direction='row' spacing={2}>
              <FormControl fullWidth size={compact ? 'small' : 'medium'}>
                <InputLabel>
                  {t('pages.feedback.list.filters.rating')}
                </InputLabel>
                <Select
                  value={filters.rating?.toString() || ''}
                  onChange={e => handleRatingChange(e.target.value)}
                  label={t('pages.feedback.list.filters.rating')}
                >
                  <MenuItem value=''>
                    {t('pages.feedback.list.filters.all_ratings')}
                  </MenuItem>
                  <MenuItem value='1'>
                    1 - {t('pages.feedback.submission.form.rating.label_1')}
                  </MenuItem>
                  <MenuItem value='2'>
                    2 - {t('pages.feedback.submission.form.rating.label_2')}
                  </MenuItem>
                  <MenuItem value='3'>
                    3 - {t('pages.feedback.submission.form.rating.label_3')}
                  </MenuItem>
                  <MenuItem value='4'>
                    4 - {t('pages.feedback.submission.form.rating.label_4')}
                  </MenuItem>
                  <MenuItem value='5'>
                    5 - {t('pages.feedback.submission.form.rating.label_5')}
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size={compact ? 'small' : 'medium'}>
                <InputLabel>{t('pages.feedback.list.filters.goal')}</InputLabel>
                <Select
                  value={filters.goal_id || ''}
                  onChange={e => handleGoalChange(e.target.value)}
                  label={t('pages.feedback.list.filters.goal')}
                >
                  <MenuItem value=''>
                    {t('pages.feedback.list.filters.all_goals')}
                  </MenuItem>
                  {goals.map(goal => (
                    <MenuItem key={goal.id} value={goal.id}>
                      {goal.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size={compact ? 'small' : 'medium'}>
                <InputLabel>
                  {t('pages.feedback.list.filters.project')}
                </InputLabel>
                <Select
                  value={filters.project_id || ''}
                  onChange={e => handleProjectChange(e.target.value)}
                  label={t('pages.feedback.list.filters.project')}
                >
                  <MenuItem value=''>
                    {t('pages.feedback.list.filters.all_projects')}
                  </MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Action Buttons */}
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <Button
                variant='outlined'
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
              >
                {t('pages.feedback.list.filters.clear_all')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <Stack
          direction='row'
          spacing={1}
          flexWrap='wrap'
          useFlexGap
          sx={{ mb: 2 }}
        >
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ alignSelf: 'center' }}
          >
            {t('pages.feedback.list.filters.active_filters', {
              count: activeFilterCount,
            })}
            :
          </Typography>
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              size='small'
              onDelete={() => handleSearchChange('')}
            />
          )}
          {filters.rating && (
            <Chip
              label={`Rating: ${filters.rating}`}
              size='small'
              onDelete={() => handleRatingChange('')}
            />
          )}
          {filters.goal_id && (
            <Chip
              label={`Goal: ${goals.find(g => g.id === filters.goal_id)?.title || filters.goal_id}`}
              size='small'
              onDelete={() => handleGoalChange('')}
            />
          )}
          {filters.project_id && (
            <Chip
              label={`Project: ${projects.find(p => p.id === filters.project_id)?.name || filters.project_id}`}
              size='small'
              onDelete={() => handleProjectChange('')}
            />
          )}
          {(filters.date_from || filters.date_to) && (
            <Chip
              label='Date Range'
              size='small'
              onDelete={() => {
                handleDateFromChange(null)
                handleDateToChange(null)
              }}
            />
          )}
        </Stack>
      )}
    </Box>
  )
}
