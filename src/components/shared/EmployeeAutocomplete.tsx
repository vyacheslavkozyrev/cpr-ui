// EmployeeAutocomplete Component
// Feature 0005 - Feedback Submission Collection
// Searchable employee selector with debounced API search

import {
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
  type Theme,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../../hooks/useDebounce'
import type { EmployeeSummaryDto } from '../../types/feedback'

// Style factory outside component
const getStyles = (theme: Theme) => ({
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.875rem',
    bgcolor: theme.palette.primary.main,
  },
  employeeInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
})

/**
 * Props for EmployeeAutocomplete component
 */
export interface EmployeeAutocompleteProps {
  /** Selected employee */
  value: EmployeeSummaryDto | null
  /** Change handler */
  onChange: (employee: EmployeeSummaryDto | null) => void
  /** Employee options (provided by parent) */
  options: EmployeeSummaryDto[]
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
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** On search query change */
  onSearchChange?: (query: string) => void
}

/**
 * Get employee initials for avatar
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * EmployeeAutocomplete Component
 * Searchable dropdown for selecting employees with avatar display
 *
 * Features:
 * - Debounced search (300ms)
 * - Avatar with initials
 * - Shows name, job title, department
 * - Keyboard accessible
 * - Loading state
 * - Error state with helper text
 *
 * Usage:
 * ```tsx
 * <EmployeeAutocomplete
 *   value={selectedEmployee}
 *   onChange={setSelectedEmployee}
 *   options={employees}
 *   loading={isLoadingEmployees}
 *   required
 *   error={!!errors.employee}
 *   helperText={errors.employee?.message}
 *   onSearchChange={handleSearchChange}
 * />
 * ```
 */
export const EmployeeAutocomplete: React.FC<EmployeeAutocompleteProps> = ({
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
  onSearchChange,
}) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = useMemo(() => getStyles(theme), [theme])

  const [inputValue, setInputValue] = useState('')
  const debouncedSearchQuery = useDebounce(inputValue, 300)

  // Trigger search when debounced query changes
  React.useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, onSearchChange])

  const handleInputChange = useCallback(
    (_event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue)
    },
    []
  )

  return (
    <Autocomplete
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={option => option.display_name}
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
            placeholder={placeholder || t('feedback.form.search_employee')}
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
          <Avatar sx={styles.avatar}>{getInitials(option.display_name)}</Avatar>
          <Box sx={styles.employeeInfo}>
            <Typography variant='body2' fontWeight={500}>
              {option.display_name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {option.job_title && option.department
                ? `${option.job_title} • ${option.department}`
                : option.job_title ||
                  option.department ||
                  t('feedback.form.no_details')}
            </Typography>
          </Box>
        </Box>
      )}
      noOptionsText={t('feedback.form.no_employees_found')}
    />
  )
}
