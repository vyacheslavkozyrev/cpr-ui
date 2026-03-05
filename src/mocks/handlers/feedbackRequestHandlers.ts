import { http, HttpResponse } from 'msw'
import type {
  CreateFeedbackRequestDto,
  FeedbackRequestDto,
  FeedbackRequestListDto,
  FeedbackRequestRecipientDto,
  PaginatedFeedbackRequestsDto,
  UpdateFeedbackRequestDto,
} from '../../types/feedbackRequest'
import { logger } from '../../utils/logger'

// Mock data store
let feedbackRequests: FeedbackRequestDto[] = []
let nextId = 1

/**
 * Generate a mock feedback request from create DTO
 */
const generateMockFeedbackRequest = (
  data: CreateFeedbackRequestDto,
  requestorId: string = 'current-employee-id'
): FeedbackRequestDto => {
  const id = `fr-${nextId++}`
  const now = new Date().toISOString()

  const recipients: FeedbackRequestRecipientDto[] = data.employee_ids.map(
    (empId, index) => ({
      id: `recipient-${id}-${index}`,
      feedback_request_id: id,
      employee_id: empId,
      is_completed: false,
      responded_at: null,
      last_reminder_at: null,
      created_at: now,
      updated_at: now,
      employee: {
        id: empId,
        display_name: `Employee ${empId.substring(0, 8)}`,
        email: `employee${index}@example.com`,
        job_title: 'Software Engineer',
        department: 'Engineering',
      },
      status: 'pending',
      feedback_id: null,
    })
  )

  return {
    id,
    requestor_id: requestorId,
    message: data.message ?? null,
    project_id: data.project_id ?? null,
    goal_id: data.goal_id ?? null,
    due_date: data.due_date ?? null,
    status: 'pending',
    recipients,
    created_at: now,
    updated_at: now,
    created_by: requestorId,
    is_deleted: false,
    requestor: {
      id: requestorId,
      display_name: 'Current User',
      email: 'current@example.com',
      job_title: 'Senior Developer',
      department: 'Engineering',
    },
    project: null,
    goal: null,
    responded_count: 0,
    total_recipients: data.employee_ids.length,
  }
}

/**
 * Initialize with some mock feedback requests
 */
const initializeMockData = () => {
  if (feedbackRequests.length === 0) {
    feedbackRequests = [
      generateMockFeedbackRequest(
        {
          employee_ids: ['emp-1', 'emp-2', 'emp-3'],
          message: 'Please provide feedback on my recent project presentation',
          project_id: 'project-1',
          goal_id: null,
          due_date: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        'current-employee-id'
      ),
      generateMockFeedbackRequest(
        {
          employee_ids: ['emp-4', 'emp-5'],
          message: 'Looking for feedback on my leadership skills',
          project_id: null,
          goal_id: 'goal-1',
          due_date: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        'current-employee-id'
      ),
    ]
    // Mark first request as partially responded
    feedbackRequests[0].recipients[0].status = 'responded'
    feedbackRequests[0].recipients[0].is_completed = true
    feedbackRequests[0].recipients[0].responded_at = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ).toISOString()
    feedbackRequests[0].status = 'partial'
    feedbackRequests[0].responded_count = 1
  }
}

/**
 * MSW handlers for Feedback Request API
 */
export const feedbackRequestHandlers = [
  // POST /api/feedback/request - Create feedback request
  http.post('*/api/feedback/request', async ({ request }) => {
    const data = (await request.json()) as CreateFeedbackRequestDto

    logger.msw('Creating feedback request', {
      recipientCount: data.employee_ids.length,
      hasMessage: !!data.message,
      hasProject: !!data.project_id,
      hasGoal: !!data.goal_id,
      hasDueDate: !!data.due_date,
    })

    // Validate request
    if (!data.employee_ids || data.employee_ids.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          message: 'At least one employee must be selected',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (data.employee_ids.length > 20) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Maximum 20 recipients allowed per request',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (data.message && data.message.length > 500) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Message cannot exceed 500 characters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Check for duplicates (simulate 409 conflict)
    // For testing, check if all recipients already have a pending request
    initializeMockData()
    const existingRequest = feedbackRequests.find(
      req =>
        req.project_id === data.project_id &&
        req.goal_id === data.goal_id &&
        req.status === 'pending' &&
        data.employee_ids.every(empId =>
          req.recipients.some(r => r.employee_id === empId)
        )
    )

    if (existingRequest) {
      logger.msw('Duplicate feedback request detected', {
        existingRequestId: existingRequest.id,
      })
      return HttpResponse.json(
        {
          success: false,
          message: `Active feedback requests already exist for these recipients: ${data.employee_ids.join(', ')}`,
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    // Create new request
    const newRequest = generateMockFeedbackRequest(data)
    feedbackRequests.unshift(newRequest) // Add to beginning

    logger.msw('Feedback request created successfully', {
      requestId: newRequest.id,
      recipientCount: newRequest.recipients.length,
    })

    return HttpResponse.json(newRequest, { status: 201 })
  }),

  // GET /api/feedback/request/sent - List sent requests
  http.get('*/api/feedback/request/sent', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10)
    const status = url.searchParams.get('status') || ''
    const search = url.searchParams.get('search') || ''

    logger.msw('Listing sent feedback requests', {
      page,
      pageSize,
      status,
      search,
    })

    initializeMockData()

    // Filter by status
    let filtered = [...feedbackRequests]
    if (status) {
      filtered = filtered.filter(req => req.status === status)
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        req =>
          req.message?.toLowerCase().includes(query) ||
          req.requestor?.display_name.toLowerCase().includes(query) ||
          req.recipients.some(r =>
            r.employee?.display_name.toLowerCase().includes(query)
          )
      )
    }

    // Pagination
    const total = filtered.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    // Convert to list DTOs with pagination
    const listItems: FeedbackRequestListDto[] = items.map(req => ({
      id: req.id,
      requestor_id: req.requestor_id,
      message_preview: req.message?.substring(0, 100) ?? null,
      due_date: req.due_date ?? null,
      created_at: req.created_at,
      status: req.status,
      responded_count: req.responded_count,
      total_recipients: req.total_recipients,
      has_overdue: false,
      requestor: req.requestor ?? null,
      project: req.project ?? null,
      goal: req.goal ?? null,
      recipients_preview: req.recipients.slice(0, 3),
    }))

    const response: PaginatedFeedbackRequestsDto = {
      data: listItems,
      pagination: {
        page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_previous: page > 1,
        has_next: page < Math.ceil(total / pageSize),
      },
      summary: {
        total_active: feedbackRequests.length,
        pending_count: feedbackRequests.filter(r => r.status === 'pending')
          .length,
        partial_count: feedbackRequests.filter(r => r.status === 'partial')
          .length,
        complete_count: feedbackRequests.filter(r => r.status === 'complete')
          .length,
        overdue_count: 0,
      },
    }

    return HttpResponse.json({
      data: response,
      success: true,
      message: 'Feedback requests retrieved successfully',
      timestamp: new Date().toISOString(),
    })
  }),

  // GET /api/feedback/request/:id - Get single request
  http.get('*/api/feedback/request/:id', ({ params }) => {
    const { id } = params

    logger.msw('Getting feedback request detail', { id })

    initializeMockData()

    const request = feedbackRequests.find(req => req.id === id)

    if (!request) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Feedback request not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      data: request,
      success: true,
      message: 'Feedback request retrieved successfully',
      timestamp: new Date().toISOString(),
    })
  }),

  // PUT /api/feedback/request/:id - Update request
  http.put('*/api/feedback/request/:id', async ({ params, request }) => {
    const { id } = params
    const data = await request.json()

    logger.msw('Updating feedback request', { id, data })

    initializeMockData()

    const requestIndex = feedbackRequests.findIndex(req => req.id === id)

    if (requestIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Feedback request not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // Update request (type-safe)
    const updateData = data as UpdateFeedbackRequestDto
    feedbackRequests[requestIndex] = {
      ...feedbackRequests[requestIndex],
      ...(updateData.due_date !== undefined && {
        due_date: updateData.due_date,
      }),
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json({
      data: feedbackRequests[requestIndex],
      success: true,
      message: 'Feedback request updated successfully',
      timestamp: new Date().toISOString(),
    })
  }),

  // DELETE /api/feedback/request/:id - Cancel request
  http.delete('*/api/feedback/request/:id', ({ params }) => {
    const { id } = params

    logger.msw('Cancelling feedback request', { id })

    initializeMockData()

    const requestIndex = feedbackRequests.findIndex(req => req.id === id)

    if (requestIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Feedback request not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // Mark as cancelled
    feedbackRequests[requestIndex].status = 'cancelled'
    feedbackRequests[requestIndex].updated_at = new Date().toISOString()

    return HttpResponse.json({
      data: feedbackRequests[requestIndex],
      success: true,
      message: 'Feedback request cancelled successfully',
      timestamp: new Date().toISOString(),
    })
  }),

  // POST /api/feedback/request/:id/reminder - Send reminder
  http.post('*/api/feedback/request/:id/reminder', ({ params }) => {
    const { id } = params

    logger.msw('Sending reminder for feedback request', { id })

    initializeMockData()

    const request = feedbackRequests.find(req => req.id === id)

    if (!request) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Feedback request not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // Mark pending recipients as reminded
    const now = new Date().toISOString()
    let remindedCount = 0

    request.recipients.forEach(recipient => {
      if (recipient.status === 'pending') {
        recipient.last_reminder_at = now
        remindedCount++
      }
    })

    return HttpResponse.json({
      data: {
        request_id: request.id,
        reminded_recipients: remindedCount,
      },
      success: true,
      message: `Reminder sent to ${remindedCount} recipient(s)`,
      timestamp: new Date().toISOString(),
    })
  }),

  // GET /api/me/feedback/request - Get sent requests for current user
  http.get('*/api/me/feedback/request', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10)
    const status = url.searchParams.get('status') || ''
    const search = url.searchParams.get('search') || ''

    logger.msw('Listing sent feedback requests for current user', {
      page,
      pageSize,
      status,
      search,
    })

    initializeMockData()

    // Filter by status
    let filtered = [...feedbackRequests]
    if (status) {
      filtered = filtered.filter(req => req.status === status)
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        req =>
          req.message?.toLowerCase().includes(query) ||
          req.requestor?.display_name.toLowerCase().includes(query) ||
          req.recipients.some(r =>
            r.employee?.display_name.toLowerCase().includes(query)
          )
      )
    }

    // Pagination
    const total = filtered.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    // Convert to list DTOs with pagination
    const listItems: FeedbackRequestListDto[] = items.map(req => ({
      id: req.id,
      requestor_id: req.requestor_id,
      message_preview: req.message?.substring(0, 100) ?? null,
      due_date: req.due_date ?? null,
      created_at: req.created_at,
      status: req.status,
      responded_count: req.responded_count,
      total_recipients: req.total_recipients,
      has_overdue: false,
      requestor: req.requestor ?? null,
      project: req.project ?? null,
      goal: req.goal ?? null,
      recipients_preview: req.recipients.slice(0, 3),
    }))

    const response: PaginatedFeedbackRequestsDto = {
      data: listItems,
      pagination: {
        page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_previous: page > 1,
        has_next: page < Math.ceil(total / pageSize),
      },
      summary: {
        total_active: feedbackRequests.length,
        pending_count: feedbackRequests.filter(r => r.status === 'pending')
          .length,
        partial_count: feedbackRequests.filter(r => r.status === 'partial')
          .length,
        complete_count: feedbackRequests.filter(r => r.status === 'complete')
          .length,
        overdue_count: 0,
      },
    }

    return HttpResponse.json(response)
  }),

  // GET /api/me/feedback/request/todo - Get todo requests for current user (as recipient)
  http.get('*/api/me/feedback/request/todo', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('page_size') || '20', 10)
    const status = url.searchParams.get('status') || ''

    logger.msw('Listing todo feedback requests for current user', {
      page,
      pageSize,
      status,
    })

    initializeMockData()

    // For testing purposes, return same data as sent requests
    // In real implementation, this would filter by current user as recipient
    let filtered = [...feedbackRequests]
    if (status) {
      filtered = filtered.filter(req => req.status === status)
    }

    // Pagination
    const total = filtered.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const items = filtered.slice(startIndex, endIndex)

    // Convert to list DTOs
    const listItems: FeedbackRequestListDto[] = items.map(req => ({
      id: req.id,
      requestor_id: req.requestor_id,
      message_preview: req.message?.substring(0, 100) ?? null,
      due_date: req.due_date ?? null,
      created_at: req.created_at,
      status: req.status,
      responded_count: req.responded_count,
      total_recipients: req.total_recipients,
      has_overdue: false,
      requestor: req.requestor ?? null,
      project: req.project ?? null,
      goal: req.goal ?? null,
      recipients_preview: req.recipients.slice(0, 3),
    }))

    const response: PaginatedFeedbackRequestsDto = {
      data: listItems,
      pagination: {
        page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
        has_previous: page > 1,
        has_next: page < Math.ceil(total / pageSize),
      },
      summary: {
        total_active: feedbackRequests.length,
        pending_count: feedbackRequests.filter(r => r.status === 'pending')
          .length,
        partial_count: feedbackRequests.filter(r => r.status === 'partial')
          .length,
        complete_count: feedbackRequests.filter(r => r.status === 'complete')
          .length,
        overdue_count: 0,
      },
    }

    return HttpResponse.json(response)
  }),
]
