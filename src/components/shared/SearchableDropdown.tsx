// SearchableDropdown Component
// Feature 0005 - Feedback Submission Collection
// Generic searchable dropdown for goals/projects with context display

import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  option: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    py: 1,
  },
  optionTitle: {
    fontWeight: 500,
  },
  optionMeta: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
})

/**
 * Generic option type for dropdown items
 */
export interface SearchableDropdownOption {
  id: string
  title: string
  description?: string | null
  metadata?: string | null // e.g., "Progress: 75%" or "Status: Active"
}

/**
 * Props for SearchableDropdown component
 */
export interface SearchableDropdownProps {
  /** Selected option */
  value: SearchableDropdownOption | null
  /** Change handler */
  onChange: (option: SearchableDropdownOption | null) => void
  /** Dropdown options */
  options: SearchableDropdownOption[]
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  helperText?: string
  /** Required field indicator */
  required?: boolean
  /** Label text */
  label: string
  /** Placeholder text */
  placeholder?: string
  /** No options text override */
  noOptionsText?: string
}

/**
 * SearchableDropdown Component
 * Generic searchable dropdown with title, description, and metadata display
 *
 * Features:
 * - Client-side search filtering
 * - Title + description + metadata display
 * - Loading state
 * - Error state with helper text
 * - Keyboard accessible
 *
 * Usage (Goals):
 * ```tsx
 * <SearchableDropdown
 *   value={selectedGoal}
 *   onChange={setSelectedGoal}
 *   options={goals.map(g => ({
 *     id: g.id,
 *     title: g.title,
 *     description: g.description,
 *     metadata: `Progress: ${g.progress}% • ${g.status}`
 *   }))}
 *   label="Goal"
 *   required
 * />
 * ```
 *
 * Usage (Projects):
 * ```tsx
 * <SearchableDropdown
 *   value={selectedProject}
 *   onChange={setSelectedProject}
 *   options={projects.map(p => ({
 *     id: p.id,
 *     title: p.name,
 *     description: p.description,
 *     metadata: p.status
 *   }))}
 *   label="Project"
 * />
 * ```
 */
export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  options,
  loading = false,
  disabled = false,
  error = false,
  helperText,
  required = false,
  label,
  placeholder,
  noOptionsText,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  const [inputValue, setInputValue] = useState('')

  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
      options={options}
      getOptionLabel={option => option.title}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      loading={loading}
      disabled={disabled}
      renderInput={params => {
        const { InputProps, InputLabelProps, size, ...restParams } = params
        // Filter out properties with undefined values to satisfy exactOptionalPropertyTypes
        const filteredLabelProps = InputLabelProps
          ? Object.fromEntries(
              Object.entries(InputLabelProps).filter(
                ([_, v]) => v !== undefined
              )
            )
          : undefined

        return (
          <TextField
            {...restParams}
            {...(size !== undefined && { size })}
            {...(filteredLabelProps && { InputLabelProps: filteredLabelProps })}
            label={label}
            {...(placeholder ? { placeholder } : {})}
            required={required}
            error={error}
            helperText={helperText}
            slotProps={{
              input: {
                ...InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color='inherit' size={20} />
                    ) : null}
                    {InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )
      }}
      renderOption={(props, option) => (
        <Box component='li' {...props} sx={styles.option}>
          <Typography variant='body2' sx={styles.optionTitle}>
            {option.title}
          </Typography>
          {option.description && (
            <Typography variant='caption' sx={styles.optionMeta} noWrap>
              {option.description}
            </Typography>
          )}
          {option.metadata && (
            <Typography variant='caption' sx={styles.optionMeta}>
              {option.metadata}
            </Typography>
          )}
        </Box>
      )}
      noOptionsText={noOptionsText || t('pages.feedback.form.no_options')}
    />
  )
}
