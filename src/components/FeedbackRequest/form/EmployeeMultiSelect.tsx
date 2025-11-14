import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Stack,
  Typography,
  Paper,
  List,
  ListItemButton,
  Avatar,
  FormControl,
  FormHelperText,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '../../../hooks/useDebounce';

// TODO: Import from actual API service once implemented
// import { useEmployeeSearch } from '../../../services/employeeService';

interface Employee {
  id: string;
  display_name: string;
  email: string;
  job_title: string;
  department: string;
  location?: string;
}

interface EmployeeMultiSelectProps {
  value: string[]; // Array of employee IDs
  onChange: (employeeIds: string[]) => void;
  error?: string;
  required?: boolean;
  maxSelection?: number;
  disabled?: boolean;
}

interface Filters {
  department: string;
  location: string;
  role: string;
}

export const EmployeeMultiSelect: React.FC<EmployeeMultiSelectProps> = ({
  value = [],
  onChange,
  error,
  required = false,
  maxSelection = 20,
  disabled = false,
}) => {
  const { t } = useTranslation('feedbackRequest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    department: '',
    location: '',
    role: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // TODO: Replace with actual API call once employee search endpoint is available (T045)
  // Mock data for demonstration
  const mockEmployees: Employee[] = [
    {
      id: '1',
      display_name: 'John Doe',
      email: 'john.doe@example.com',
      job_title: 'Software Engineer',
      department: 'Engineering',
      location: 'New York',
    },
    {
      id: '2',
      display_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      job_title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco',
    },
    {
      id: '3',
      display_name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      job_title: 'Senior Engineer',
      department: 'Engineering',
      location: 'New York',
    },
    {
      id: '4',
      display_name: 'Alice Williams',
      email: 'alice.williams@example.com',
      job_title: 'UX Designer',
      department: 'Design',
      location: 'San Francisco',
    },
    {
      id: '5',
      display_name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      job_title: 'Engineering Manager',
      department: 'Engineering',
      location: 'Austin',
    },
  ];

  // Mock API call - Replace with actual API integration
  const performSearch = async (query: string, appliedFilters: Filters) => {
    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let results = mockEmployees;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (emp) =>
          emp.display_name.toLowerCase().includes(lowerQuery) ||
          emp.email.toLowerCase().includes(lowerQuery) ||
          emp.job_title.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply department filter
    if (appliedFilters.department) {
      results = results.filter((emp) => emp.department === appliedFilters.department);
    }

    // Apply location filter
    if (appliedFilters.location) {
      results = results.filter((emp) => emp.location === appliedFilters.location);
    }

    // Apply role filter (job_title)
    if (appliedFilters.role) {
      results = results.filter((emp) => emp.job_title === appliedFilters.role);
    }

    // Exclude already selected employees
    results = results.filter((emp) => !value.includes(emp.id));

    setSearchResults(results);
    setIsSearching(false);
    setShowResults(true);
  };

  // Load selected employees details (in real app, this would fetch from API)
  useEffect(() => {
    if (value.length > 0) {
      const selected = mockEmployees.filter((emp) => value.includes(emp.id));
      setSelectedEmployees(selected);
    } else {
      setSelectedEmployees([]);
    }
  }, [value]);

  // Perform search when debounced query or filters change
  useEffect(() => {
    if (debouncedSearchQuery || filters.department || filters.location || filters.role) {
      performSearch(debouncedSearchQuery, filters);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, filters]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (filterType: keyof Filters, filterValue: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: filterValue,
    }));
  };

  const handleSelectEmployee = (employee: Employee) => {
    if (value.length >= maxSelection) {
      // Max selection reached, don't add
      return;
    }

    const newValue = [...value, employee.id];
    onChange(newValue);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    const newValue = value.filter((id) => id !== employeeId);
    onChange(newValue);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isMaxReached = value.length >= maxSelection;

  // Get unique filter options from mock data
  const departments = Array.from(new Set(mockEmployees.map((e) => e.department)));
  const locations = Array.from(new Set(mockEmployees.map((e) => e.location).filter(Boolean))) as string[];
  const roles = Array.from(new Set(mockEmployees.map((e) => e.job_title)));

  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      <Box>
        {/* Selected Employees Chips */}
        {selectedEmployees.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedEmployees.map((employee) => (
                <Chip
                  key={employee.id}
                  avatar={<Avatar>{getInitials(employee.display_name)}</Avatar>}
                  label={employee.display_name}
                  onDelete={() => handleRemoveEmployee(employee.id)}
                  color="primary"
                  sx={{ mb: 1 }}
                />
              ))}
              {selectedEmployees.length > 1 && (
                <Chip
                  label={t('form.employees.clearAll')}
                  onClick={handleClearAll}
                  variant="outlined"
                  color="default"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {t('form.employees.selected', { count: value.length, max: maxSelection })}
            </Typography>
          </Box>
        )}

        {/* Max Selection Warning */}
        {isMaxReached && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('form.employees.maxReached', { max: maxSelection })}
          </Alert>
        )}

        {/* Search Input */}
        <TextField
          fullWidth
          placeholder={t('form.employees.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={disabled || isMaxReached}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            endAdornment: isSearching ? <CircularProgress size={20} /> : null,
          }}
          sx={{ mb: 2 }}
        />

        {/* Filter Chips */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Department Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('form.employees.filters.department')}</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                label={t('form.employees.filters.department')}
                disabled={disabled}
              >
                <MenuItem value="">
                  <em>{t('form.employees.filters.all')}</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('form.employees.filters.location')}</InputLabel>
              <Select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                label={t('form.employees.filters.location')}
                disabled={disabled}
              >
                <MenuItem value="">
                  <em>{t('form.employees.filters.all')}</em>
                </MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Role Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t('form.employees.filters.role')}</InputLabel>
              <Select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                label={t('form.employees.filters.role')}
                disabled={disabled}
              >
                <MenuItem value="">
                  <em>{t('form.employees.filters.all')}</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Clear Filters Button */}
            {(filters.department || filters.location || filters.role) && (
              <Chip
                label={t('form.employees.filters.clear')}
                onClick={() => setFilters({ department: '', location: '', role: '' })}
                onDelete={() => setFilters({ department: '', location: '', role: '' })}
                size="small"
                color="default"
              />
            )}
          </Stack>
        </Box>

        {/* Search Results */}
        {showResults && (
          <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
            {searchResults.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('form.employees.noResults')}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {searchResults.map((employee) => (
                  <ListItemButton
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    disabled={isMaxReached}
                    divider
                  >
                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                      <Avatar>{getInitials(employee.display_name)}</Avatar>
                      <Box flex={1}>
                        {/* Line 1: Name */}
                        <Typography variant="body1" fontWeight={500}>
                          {employee.display_name}
                        </Typography>
                        {/* Line 2: Job Title */}
                        <Typography variant="body2" color="text.secondary">
                          {employee.job_title}
                        </Typography>
                        {/* Line 3: Department + Location */}
                        <Typography variant="caption" color="text.secondary">
                          {employee.department}
                          {employee.location && ` • ${employee.location}`}
                        </Typography>
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
          <FormHelperText>{t('form.employees.required')}</FormHelperText>
        )}
      </Box>
    </FormControl>
  );
};
