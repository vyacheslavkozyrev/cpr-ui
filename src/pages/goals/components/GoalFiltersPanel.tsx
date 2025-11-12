import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { IGoalsQueryParams } from '../../../types/goalFilters'

interface GoalFiltersPanelProps {
  filters: Partial<IGoalsQueryParams>
  onChange: (filters: Partial<IGoalsQueryParams>) => void
}

/**
 * Goal Filters Panel Component
 * Provides filtering controls for goals list
 * Feature 0001 - Phase 3
 */
export const GoalFiltersPanel: React.FC<GoalFiltersPanelProps> = ({
  filters,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleChange = (
    key: keyof IGoalsQueryParams,
    value: string | number | boolean | undefined
  ) => {
    onChange({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    onChange({
      page: 1,
      per_page: filters.per_page || 12,
      status: 'all',
      visibility: 'all',
      priority: 'all',
      deadline: 'all',
      search: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })
  }

  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.visibility && filters.visibility !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.deadline && filters.deadline !== 'all') ||
    Boolean(filters.search)

  return (
    <Box>
      <Stack spacing={2}>
        {/* Search */}
        <TextField
          fullWidth
          size='small'
          label={t('goals.filters.search', 'Search')}
          placeholder={t(
            'goals.filters.searchPlaceholder',
            'Search by title or description'
          )}
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Controls Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Status Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>{t('goals.filters.status', 'Status')}</InputLabel>
            <Select
              value={filters.status || 'all'}
              label={t('goals.filters.status', 'Status')}
              onChange={e => handleChange('status', e.target.value)}
            >
              <MenuItem value='all'>
                {t('goals.filters.allStatus', 'All Status')}
              </MenuItem>
              <MenuItem value='open'>{t('goals.status.open', 'Open')}</MenuItem>
              <MenuItem value='in_progress'>
                {t('goals.status.in_progress', 'In Progress')}
              </MenuItem>
              <MenuItem value='completed'>
                {t('goals.status.completed', 'Completed')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Visibility Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>
              {t('goals.filters.visibility', 'Visibility')}
            </InputLabel>
            <Select
              value={filters.visibility || 'all'}
              label={t('goals.filters.visibility', 'Visibility')}
              onChange={e => handleChange('visibility', e.target.value)}
            >
              <MenuItem value='all'>
                {t('goals.filters.allVisibility', 'All')}
              </MenuItem>
              <MenuItem value='private'>
                {t('goals.visibility.private', 'Private')}
              </MenuItem>
              <MenuItem value='team'>
                {t('goals.visibility.team', 'Team')}
              </MenuItem>
              <MenuItem value='org'>
                {t('goals.visibility.org', 'Organization')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>{t('goals.filters.priority', 'Priority')}</InputLabel>
            <Select
              value={filters.priority || 'all'}
              label={t('goals.filters.priority', 'Priority')}
              onChange={e => handleChange('priority', e.target.value)}
            >
              <MenuItem value='all'>
                {t('goals.filters.allPriority', 'All')}
              </MenuItem>
              <MenuItem value='high'>
                {t('goals.priority.high', 'High')}
              </MenuItem>
              <MenuItem value='medium'>
                {t('goals.priority.medium', 'Medium')}
              </MenuItem>
              <MenuItem value='low'>{t('goals.priority.low', 'Low')}</MenuItem>
            </Select>
          </FormControl>

          {/* Sort By */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>{t('goals.filters.sortBy', 'Sort By')}</InputLabel>
            <Select
              value={filters.sortBy || 'createdAt'}
              label={t('goals.filters.sortBy', 'Sort By')}
              onChange={e => handleChange('sortBy', e.target.value)}
            >
              <MenuItem value='createdAt'>
                {t('goals.sort.createdAt', 'Created Date')}
              </MenuItem>
              <MenuItem value='title'>
                {t('goals.sort.title', 'Title')}
              </MenuItem>
              <MenuItem value='deadline'>
                {t('goals.sort.deadline', 'Deadline')}
              </MenuItem>
              <MenuItem value='progress'>
                {t('goals.sort.progress', 'Progress')}
              </MenuItem>
              <MenuItem value='priority'>
                {t('goals.sort.priority', 'Priority')}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Box>
            <Button
              variant='outlined'
              size='small'
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              {t('goals.filters.clear', 'Clear Filters')}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
