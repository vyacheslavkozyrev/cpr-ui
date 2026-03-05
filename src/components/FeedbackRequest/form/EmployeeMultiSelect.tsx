import { Search as SearchIcon } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  FormHelperText,
  List,
  ListItemButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '../../../hooks/useDebounce'
import {
  useEmployeeSearch,
  type EmployeeSearchParams,
  type EmployeeSummaryDto,
} from '../../../services/employeeQueryService'

type Employee = EmployeeSummaryDto

interface EmployeeMultiSelectProps {
  value: string[]
  onChange: (employeeIds: string[]) => void
  onSelectedEmployeesChange?: (employees: Employee[]) => void
  error?: string
  required?: boolean
  maxSelection?: number
  disabled?: boolean
}

export const EmployeeMultiSelect: React.FC<EmployeeMultiSelectProps> = ({
  value = [],
  onChange,
  onSelectedEmployeesChange,
  error,
  required = false,
  maxSelection = 20,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([])

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Search API
  const searchParams: EmployeeSearchParams = debouncedSearchQuery
    ? { query: debouncedSearchQuery }
    : {}
  const { data: apiResults = [], isLoading: isSearching } = useEmployeeSearch(
    searchParams,
    debouncedSearchQuery.length >= 2
  )

  // Filter out already selected employees
  const searchResults = apiResults.filter(emp => !value.includes(emp.id))

  // Update show results when search changes
  useEffect(() => {
    setShowResults(debouncedSearchQuery.length >= 2)
  }, [debouncedSearchQuery])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSelectEmployee = (employee: Employee) => {
    if (value.length >= maxSelection) {
      return
    }

    const newEmployees = [...selectedEmployees, employee]
    onChange([...value, employee.id])
    setSelectedEmployees(newEmployees)
    onSelectedEmployeesChange?.(newEmployees)
    setSearchQuery('')
    setShowResults(false)
  }

  const handleRemoveEmployee = (employeeId: string) => {
    const newEmployees = selectedEmployees.filter(emp => emp.id !== employeeId)
    onChange(value.filter(id => id !== employeeId))
    setSelectedEmployees(newEmployees)
    onSelectedEmployeesChange?.(newEmployees)
  }

  const handleClearAll = () => {
    onChange([])
    setSelectedEmployees([])
    onSelectedEmployeesChange?.([])
  }

  const getInitials = (name?: string | null): string => {
    if (!name) {
      return '??'
    }
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const isMaxReached = value.length >= maxSelection

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <Box>
        {/* Selected Employees Chips */}
        {selectedEmployees.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {selectedEmployees.map(emp => (
                <Chip
                  key={emp.id}
                  avatar={<Avatar>{getInitials(emp.display_name)}</Avatar>}
                  label={emp.display_name || 'Unknown Employee'}
                  onDelete={() => handleRemoveEmployee(emp.id)}
                  disabled={disabled}
                />
              ))}
              {selectedEmployees.length > 1 && (
                <Chip
                  label={t('pages.feedback.request.form.employees.clearAll')}
                  onClick={handleClearAll}
                  onDelete={handleClearAll}
                  size='small'
                  color='default'
                  disabled={disabled}
                />
              )}
            </Stack>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
              {t('pages.feedback.request.form.employees.selected', {
                count: value.length,
                max: maxSelection,
              })}
            </Typography>
          </Box>
        )}

        {/* Max Selection Warning */}
        {isMaxReached && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {t('pages.feedback.request.form.employees.maxReached', {
              max: maxSelection,
            })}
          </Alert>
        )}

        {/* Search Input */}
        <TextField
          fullWidth
          placeholder={t(
            'pages.feedback.request.form.employees.searchPlaceholder'
          )}
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={disabled || isMaxReached}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            ),
            endAdornment: isSearching ? <CircularProgress size={20} /> : null,
          }}
          sx={{ mb: 2 }}
        />

        {/* Search Results */}
        {showResults && (
          <Paper variant='outlined' sx={{ maxHeight: 300, overflow: 'auto' }}>
            {searchResults.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('pages.feedback.request.form.employees.noResults')}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {searchResults.map(employee => (
                  <ListItemButton
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    disabled={disabled || isMaxReached}
                  >
                    <Stack
                      direction='row'
                      spacing={2}
                      alignItems='center'
                      width='100%'
                    >
                      <Avatar>{getInitials(employee.display_name)}</Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant='body1'>
                          {employee.display_name || 'Unknown Employee'}
                        </Typography>
                        {employee.job_title && (
                          <Typography variant='body2' color='text.secondary'>
                            {employee.job_title}
                          </Typography>
                        )}
                        {employee.department && (
                          <Typography variant='caption' color='text.secondary'>
                            {employee.department}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        )}

        {/* Error Message */}
        {error && <FormHelperText error>{error}</FormHelperText>}

        {/* Required Indicator */}
        {required && !error && value.length === 0 && (
          <FormHelperText>
            {t('pages.feedback.request.form.employees.required')}
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  )
}
