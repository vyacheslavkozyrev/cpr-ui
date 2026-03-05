import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SentRequestsList } from '../../../components/FeedbackRequest/lists/SentRequestsList'

// Create QueryWrapper for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }
}

// Mock services
const mockUseSentRequests = vi.fn()
const mockSendReminderMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isSuccess: false,
}
const mockSendAllRemindersMutation = {
  mutate: vi.fn(),
  isLoading: false,
  isSuccess: false,
}

vi.mock('../../../services', () => ({
  useSentRequests: (...args: unknown[]) => mockUseSentRequests(...args),
}))

vi.mock('../../../hooks', () => ({
  useSendReminder: () => mockSendReminderMutation,
  useSendAllReminders: () => mockSendAllRemindersMutation,
  useDateFormat: () => ({
    formatDateRelative: vi.fn((date: string) => `Relative: ${date}`),
    formatDate: vi.fn((date: string) => `Formatted: ${date}`),
  }),
}))

vi.mock('../../../stores/toastStore', () => ({
  useToastStore: () => vi.fn(),
}))

// Mock data
const mockEmployeeData = {
  id: 'emp-1',
  display_name: 'John Doe',
  email: 'john.doe@example.com',
  job_title: 'Software Engineer',
}

const mockRecipient = {
  id: 'rec-1',
  feedback_request_id: 'req-1',
  employee_id: 'emp-1',
  is_completed: false,
  responded_at: null,
  last_reminder_at: null,
  created_at: '2025-11-20T10:00:00Z',
  updated_at: '2025-11-20T10:00:00Z',
  employee: mockEmployeeData,
  status: 'pending' as const,
  feedback_id: null,
}

const mockRequest = {
  id: 'req-1',
  requestor_id: 'emp-100',
  project_id: null,
  goal_id: null,
  message: 'Please provide feedback on my recent work',
  message_preview: 'Please provide feedback on my recent work',
  due_date: '2025-12-01T00:00:00Z',
  created_at: '2025-11-20T10:00:00Z',
  updated_at: '2025-11-20T10:00:00Z',
  created_by: 'emp-100',
  is_deleted: false,
  recipients_preview: [mockRecipient] as (typeof mockRecipient)[],
  status: 'pending' as const,
  responded_count: 0,
  total_recipients: 1,
}

const mockSentRequestsResponse = {
  data: [mockRequest],
  pagination: {
    page: 1,
    page_size: 20,
    total_items: 1,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  },
  summary: {
    pending_count: 1,
    partial_count: 0,
    complete_count: 0,
  },
}

describe('SentRequestsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', () => {
      mockUseSentRequests.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockUseSentRequests.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Actual error message text
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no requests exist', () => {
      mockUseSentRequests.mockReturnValue({
        data: {
          data: [],
          pagination: {
            page: 1,
            page_size: 20,
            total_items: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
          summary: {
            pending_count: 0,
            partial_count: 0,
            complete_count: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Should show EmptyState component
      expect(screen.queryByText(/status/i)).not.toBeInTheDocument()
    })
  })

  describe('Rendering Requests', () => {
    beforeEach(() => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
    })

    it('should render filter dropdowns', () => {
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Check that both filter comboboxes are rendered
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes).toHaveLength(2)
      expect(comboboxes[0]).toHaveTextContent('All')
      expect(comboboxes[1]).toHaveTextContent('Newest')
    })

    it('should render request cards', () => {
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // FeedbackRequestCard should render (checking for message content)
      expect(
        screen.getByText(/please provide feedback on my recent work/i)
      ).toBeInTheDocument()
    })

    it('should render summary statistics', () => {
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // RequestsSummary component should show the summary text with counts
      expect(screen.getByText(/showing 1 of 1 requests/i)).toBeInTheDocument()
      expect(screen.getByText(/1 pending/i)).toBeInTheDocument()
    })
  })

  describe('Filter Functionality', () => {
    beforeEach(() => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
    })

    it('should allow changing status filter', async () => {
      const user = userEvent.setup()
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // MUI Select renders as a combobox
      const statusFilter = screen.getAllByRole('combobox')[0]
      await user.click(statusFilter)

      // Check that filter options are available in the dropdown
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument()
      })
    })

    it('should call useSentRequests with updated filters when status changes', async () => {
      const user = userEvent.setup()
      render(<SentRequestsList />, { wrapper: createWrapper() })

      const statusFilter = screen.getAllByRole('combobox')[0]
      await user.click(statusFilter)

      // Find and click 'pending' option
      const pendingOption = await screen.findByRole('option', {
        name: /pending/i,
      })
      await user.click(pendingOption)

      // useSentRequests should be called with new parameters
      await waitFor(() => {
        expect(mockUseSentRequests).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'pending',
            page: 1,
          })
        )
      })
    })
  })

  describe('Sort Functionality', () => {
    beforeEach(() => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
    })

    it('should allow changing sort order', async () => {
      const user = userEvent.setup()
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Second combobox is the sort dropdown
      const sortDropdown = screen.getAllByRole('combobox')[1]
      await user.click(sortDropdown)

      // Check that sort options are available
      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /newest/i })
        ).toBeInTheDocument()
      })
    })

    it('should call useSentRequests with updated sort when changed', async () => {
      const user = userEvent.setup()
      render(<SentRequestsList />, { wrapper: createWrapper() })

      const sortDropdown = screen.getAllByRole('combobox')[1]
      await user.click(sortDropdown)

      // Find and click 'oldest' option
      const oldestOption = await screen.findByRole('option', {
        name: /oldest/i,
      })
      await user.click(oldestOption)

      // useSentRequests should be called with new sort parameters
      await waitFor(() => {
        expect(mockUseSentRequests).toHaveBeenCalledWith(
          expect.objectContaining({
            sort_by: 'created_at',
            sort_order: 'asc',
            page: 1,
          })
        )
      })
    })
  })

  describe('Pagination', () => {
    it('should show pagination when multiple pages exist', () => {
      mockUseSentRequests.mockReturnValue({
        data: {
          ...mockSentRequestsResponse,
          pagination: {
            page: 1,
            page_size: 20,
            total_items: 50,
            total_pages: 3,
            has_next: true,
            has_previous: false,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Pagination component should be visible
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should not show pagination when only one page exists', () => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Pagination should not be rendered
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })

    it('should allow navigating between pages', async () => {
      const user = userEvent.setup()
      mockUseSentRequests.mockReturnValue({
        data: {
          ...mockSentRequestsResponse,
          pagination: {
            page: 1,
            page_size: 20,
            total_items: 50,
            total_pages: 3,
            has_next: true,
            has_previous: false,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Find page 2 button
      const page2Button = screen.getByRole('button', { name: /go to page 2/i })
      await user.click(page2Button)

      // useSentRequests should be called with page 2
      await waitFor(() => {
        expect(mockUseSentRequests).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        )
      })
    })
  })

  describe('Filtered Empty Results', () => {
    it('should show empty state when no requests exist with default filters', () => {
      mockUseSentRequests.mockReturnValue({
        data: {
          data: [],
          pagination: {
            page: 1,
            page_size: 20,
            total_items: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
          summary: {
            pending_count: 0,
            partial_count: 0,
            complete_count: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // With no filters active (default state), component shows EmptyState
      // EmptyState has "Start gathering feedback" text
      expect(screen.getByText(/start gathering feedback/i)).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    beforeEach(() => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
    })

    it('should render without crashing', () => {
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Check that comboboxes (filters) are rendered
      expect(screen.getAllByRole('combobox')).toHaveLength(2) // Status and Sort
    })

    it('should integrate with FeedbackRequestCard component', () => {
      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Card content should be visible
      expect(
        screen.getByText(/please provide feedback on my recent work/i)
      ).toBeInTheDocument()
    })
  })

  describe('Card Expansion', () => {
    it('should render cards with expandable content', async () => {
      const user = userEvent.setup()
      const multiRecipientRequest = {
        ...mockRequest,
        total_recipients: 5,
        recipients_preview: [
          mockRecipient,
          { ...mockRecipient, id: 'rec-2', employee_id: 'emp-2' },
          { ...mockRecipient, id: 'rec-3', employee_id: 'emp-3' },
        ],
      }

      mockUseSentRequests.mockReturnValue({
        data: {
          data: [multiRecipientRequest],
          pagination: mockSentRequestsResponse.pagination,
          summary: mockSentRequestsResponse.summary,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Find expand button (aria-label is 'expand')
      const expandButton = screen.getByLabelText(/expand/i)
      expect(expandButton).toBeInTheDocument()

      // Click to expand
      await user.click(expandButton)

      // After expansion, button aria-label should change to 'collapse'
      await waitFor(() => {
        expect(screen.getByLabelText(/collapse/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Functionality', () => {
    it('should show cancel button for active requests', () => {
      mockUseSentRequests.mockReturnValue({
        data: mockSentRequestsResponse,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Cancel Request button should be visible
      expect(screen.getByText(/cancel request/i)).toBeInTheDocument()
    })

    it('should not show cancel button for cancelled requests', () => {
      const cancelledRequest = {
        ...mockRequest,
        status: 'cancelled' as const,
      }

      mockUseSentRequests.mockReturnValue({
        data: {
          data: [cancelledRequest],
          pagination: mockSentRequestsResponse.pagination,
          summary: mockSentRequestsResponse.summary,
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })

      render(<SentRequestsList />, { wrapper: createWrapper() })

      // Cancel button should not be visible for cancelled requests
      expect(screen.queryByText(/cancel request/i)).not.toBeInTheDocument()
    })
  })
})
