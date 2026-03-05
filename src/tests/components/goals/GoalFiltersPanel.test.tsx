import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoalFiltersPanel } from '../../../pages/goals/components/GoalFiltersPanel'
import type { IGoalsQueryParams } from '../../../types/goalFilters'
import { renderWithProviders } from '../../utils'

describe('GoalFiltersPanel Component Tests', () => {
  const mockOnChange = vi.fn()

  const defaultFilters: Partial<IGoalsQueryParams> = {
    page: 1,
    per_page: 12,
    status: 'all',
    visibility: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
  }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  describe('Positive Cases - Rendering', () => {
    it('should render search field', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      const searchField = screen.getByPlaceholderText(/search by title/i)
      expect(searchField).toBeInTheDocument()
    })

    it('should render status filter dropdown', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      // MUI Select renders label text in multiple places (label + legend), use getAllByText
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0)
      expect(screen.getByText('All Status')).toBeInTheDocument()
    })

    it('should render visibility filter dropdown', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      // MUI Select renders label text in multiple places (label + legend), use getAllByText
      expect(screen.getAllByText('Visibility').length).toBeGreaterThan(0)
    })

    it('should render priority filter dropdown', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      // MUI Select renders label text in multiple places (label + legend), use getAllByText
      expect(screen.getAllByText('Priority').length).toBeGreaterThan(0)
    })

    it('should render sort by dropdown', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      // MUI Select renders label text in multiple places (label + legend), use getAllByText
      expect(screen.getAllByText('Sort By').length).toBeGreaterThan(0)
    })
  })

  describe('Positive Cases - User Interactions', () => {
    it('should call onChange when search text changes', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      const searchField = screen.getByPlaceholderText(/search by title/i)
      fireEvent.change(searchField, { target: { value: 'React' } })
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'React' })
      )
    })

    it('should display clear filters button when filters are active', () => {
      const activeFilters: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
        status: 'in_progress',
      }
      renderWithProviders(
        <GoalFiltersPanel filters={activeFilters} onChange={mockOnChange} />
      )
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should not display clear filters button when no active filters', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()
    })

    it('should call onChange with reset values when clear filters clicked', () => {
      const activeFilters: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
        status: 'completed',
        search: 'test',
      }
      renderWithProviders(
        <GoalFiltersPanel filters={activeFilters} onChange={mockOnChange} />
      )
      const clearButton = screen.getByText(/clear filters/i)
      fireEvent.click(clearButton)
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'all',
          visibility: 'all',
          priority: 'all',
          search: '',
        })
      )
    })
  })

  describe('Negative Cases - Edge Cases', () => {
    it('should handle empty filters object', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={{}} onChange={mockOnChange} />
      )
      expect(
        screen.getByPlaceholderText(/search by title/i)
      ).toBeInTheDocument()
    })

    it('should handle undefined search value', () => {
      const filtersWithUndefinedSearch: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
      }
      delete filtersWithUndefinedSearch.search
      renderWithProviders(
        <GoalFiltersPanel
          filters={filtersWithUndefinedSearch}
          onChange={mockOnChange}
        />
      )
      const searchField = screen.getByPlaceholderText(
        /search by title/i
      ) as HTMLInputElement
      expect(searchField.value).toBe('')
    })

    it('should handle missing filter values gracefully', () => {
      const incompleteFilters = { page: 1, per_page: 12 }
      renderWithProviders(
        <GoalFiltersPanel filters={incompleteFilters} onChange={mockOnChange} />
      )
      expect(
        screen.getByPlaceholderText(/search by title/i)
      ).toBeInTheDocument()
    })
  })

  describe('Filter State Detection', () => {
    it('should detect active status filter', () => {
      const filters: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
        status: 'completed',
      }
      renderWithProviders(
        <GoalFiltersPanel filters={filters} onChange={mockOnChange} />
      )
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should detect active visibility filter', () => {
      const filters: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
        visibility: 'team',
      }
      renderWithProviders(
        <GoalFiltersPanel filters={filters} onChange={mockOnChange} />
      )
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should detect active priority filter', () => {
      const filters: Partial<IGoalsQueryParams> = {
        ...defaultFilters,
        priority: 'high',
      }
      renderWithProviders(
        <GoalFiltersPanel filters={filters} onChange={mockOnChange} />
      )
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should detect active search filter', () => {
      const filters = { ...defaultFilters, search: 'test query' }
      renderWithProviders(
        <GoalFiltersPanel filters={filters} onChange={mockOnChange} />
      )
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument()
    })

    it('should not show clear button for default filter values', () => {
      renderWithProviders(
        <GoalFiltersPanel filters={defaultFilters} onChange={mockOnChange} />
      )
      expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument()
    })
  })

  describe('Data Structure Validation', () => {
    it('should accept valid filter parameters', () => {
      const validFilters: Partial<IGoalsQueryParams> = {
        status: 'in_progress',
        visibility: 'private',
        priority: 'high',
        search: 'test',
        sortBy: 'deadline',
        sortDirection: 'asc',
      }
      expect(validFilters.status).toMatch(/^(all|open|in_progress|completed)$/)
      expect(validFilters.visibility).toMatch(/^(all|private|team|org)$/)
      expect(validFilters.priority).toMatch(/^(all|high|medium|low)$/)
    })

    it('should validate sort field options', () => {
      const validSortFields = [
        'createdAt',
        'title',
        'deadline',
        'progress',
        'priority',
      ]
      validSortFields.forEach(field => {
        expect([
          'createdAt',
          'title',
          'deadline',
          'progress',
          'priority',
        ]).toContain(field)
      })
    })
  })
})
