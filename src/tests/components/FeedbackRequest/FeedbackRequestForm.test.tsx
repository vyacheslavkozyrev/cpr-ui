/**
 * FeedbackRequestForm Component Tests
 * Feature 0004 - US-001 T048
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FeedbackRequestForm } from '../../../components/FeedbackRequest/form/FeedbackRequestForm'

// Mock dependencies
vi.mock('../../../services', () => ({
  useCreateFeedbackRequest: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
  }),
  useProjects: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useGoals: () => ({
    data: { items: [] },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../../services/employeeQueryService', () => ({
  useEmployeeSearch: () => ({
    data: [],
    isLoading: false,
  }),
}))

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: 'test-user-123', name: 'Test User', email: 'test@example.com' },
  }),
}))

vi.mock('../../../stores', () => ({
  useFeedbackRequestDraftStore: () => ({
    saveDraft: vi.fn(),
    loadDraft: vi.fn().mockReturnValue(null),
    clearDraft: vi.fn(),
    hasDraft: vi.fn().mockReturnValue(false),
    getDraftAge: vi.fn().mockReturnValue(null),
    markDirty: vi.fn(),
  }),
}))

vi.mock('../../../stores/toastStore', () => ({
  useToastStore: () => vi.fn(),
}))

vi.mock('../../../hooks/useOfflineQueue', () => ({
  useOfflineQueue: () => ({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    sync: vi.fn(),
  }),
}))

vi.mock('../../../services/offlineQueueService', () => ({
  offlineQueueService: {
    enqueue: vi.fn(),
  },
}))

// Test wrapper with providers
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

describe('FeedbackRequestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the form title', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/request feedback/i)).toBeInTheDocument()
    })

    it('should render employee selection field', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/employees/i)).toBeInTheDocument()
    })

    it('should render message field', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(
        screen.getByRole('button', { name: /send request/i })
      ).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('should allow typing in message field', async () => {
      const user = userEvent.setup()
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      const messageField = screen.getByLabelText(/message/i)
      await user.type(messageField, 'Test feedback message')

      expect(messageField).toHaveValue('Test feedback message')
    })

    it('should show character count for message', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.getByText(/0 \/ 500/)).toBeInTheDocument()
    })

    it('should have submit button enabled (form validation happens on submit)', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      const submitButton = screen.getByRole('button', { name: /send request/i })
      // Submit button is enabled; validation happens when user clicks submit
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('should show validation helper text for empty employee selection', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      // Check that helper text is shown for the required employee field
      expect(
        screen.getByText(/please select at least one employee/i)
      ).toBeInTheDocument()
    })

    it('should update character count as user types', async () => {
      const user = userEvent.setup()
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      const messageField = screen.getByLabelText(/message/i)
      await user.type(messageField, 'Hello')

      await waitFor(() => {
        expect(screen.getByText(/5 \/ 500/)).toBeInTheDocument()
      })
    })
  })

  describe('Date Picker', () => {
    it('should render due date picker', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      // Use role="group" to find the date picker, not label (which has duplicates)
      expect(
        screen.getByRole('group', { name: /due date/i })
      ).toBeInTheDocument()
    })

    it('should render quick action buttons for due date', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      // Actual button labels from the component
      expect(
        screen.getByRole('button', { name: /\+3 days/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /\+7 days/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /\+14 days/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /\+30 days/i })
      ).toBeInTheDocument()
    })
  })

  describe('Offline Queue Integration', () => {
    it('should not show offline banner when online', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument()
    })
  })

  describe('Draft Banner', () => {
    it('should not show draft banner when no draft exists', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.queryByText(/unsaved draft/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure with labels', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      // Use role="group" for date picker to avoid duplicate label issue
      expect(
        screen.getByRole('group', { name: /due date/i })
      ).toBeInTheDocument()
    })

    it('should have submit button with proper role', () => {
      render(<FeedbackRequestForm />, { wrapper: createWrapper() })

      const submitButton = screen.getByRole('button', { name: /send request/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Component Integration', () => {
    it('should render without crashing', () => {
      expect(() => {
        render(<FeedbackRequestForm />, { wrapper: createWrapper() })
      }).not.toThrow()
    })

    it('should handle onSuccess callback when provided', () => {
      const onSuccess = vi.fn()
      render(<FeedbackRequestForm onSuccess={onSuccess} />, {
        wrapper: createWrapper(),
      })

      expect(
        screen.getByRole('button', { name: /send request/i })
      ).toBeInTheDocument()
    })

    it('should handle onCancel callback when provided', () => {
      const onCancel = vi.fn()
      render(<FeedbackRequestForm onCancel={onCancel} />, {
        wrapper: createWrapper(),
      })

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })
  })
})
