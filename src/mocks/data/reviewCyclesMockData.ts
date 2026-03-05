import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IAggregatedResults,
  type IDetailedResults,
  type IReviewCycleDetail,
  type IReviewNominee,
  type IReviewRequest,
  type IReviewResponse,
} from '../../types/reviewCycle.types'

// Reuse stable UUIDs consistent with other mock data
const SUBJECT_EMPLOYEE_ID = 'aaaaaaaa-0001-0000-0000-000000000001'
const REVIEWER_EMPLOYEE_ID_1 = 'aaaaaaaa-0002-0000-0000-000000000002'
const REVIEWER_EMPLOYEE_ID_2 = 'aaaaaaaa-0003-0000-0000-000000000003'
const REVIEWER_EMPLOYEE_ID_3 = 'aaaaaaaa-0004-0000-0000-000000000004'
const DEPARTMENT_ID = 'dddddddd-0001-0000-0000-000000000001'
const DIRECTOR_EMPLOYEE_ID = 'aaaaaaaa-0099-0000-0000-000000000099'

export const mockReviewCycles: IReviewCycleDetail[] = [
  {
    id: 'cycle-0001-0000-0000-000000000001',
    title: 'Annual 360 Review — Alice Smith',
    description: 'Comprehensive annual review for Alice Smith.',
    subject_employee_id: SUBJECT_EMPLOYEE_ID,
    subject_display_name: 'Alice Smith',
    department_id: DEPARTMENT_ID,
    status: EReviewCycleStatus.DRAFT,
    nominee_count: 0,
    response_count: 0,
    opened_at: null,
    started_at: null,
    closed_at: null,
    created_at: '2026-01-15T09:00:00Z',
    created_by: DIRECTOR_EMPLOYEE_ID,
  },
  {
    id: 'cycle-0002-0000-0000-000000000002',
    title: 'Mid-Year Review — Alice Smith',
    description: null,
    subject_employee_id: SUBJECT_EMPLOYEE_ID,
    subject_display_name: 'Alice Smith',
    department_id: DEPARTMENT_ID,
    status: EReviewCycleStatus.IN_PROGRESS,
    nominee_count: 3,
    response_count: 1,
    opened_at: '2026-02-01T09:00:00Z',
    started_at: '2026-02-10T09:00:00Z',
    closed_at: null,
    created_at: '2026-01-20T09:00:00Z',
    created_by: DIRECTOR_EMPLOYEE_ID,
  },
  {
    id: 'cycle-0003-0000-0000-000000000003',
    title: 'Q3 Review — Alice Smith',
    description: 'Third quarter review cycle.',
    subject_employee_id: SUBJECT_EMPLOYEE_ID,
    subject_display_name: 'Alice Smith',
    department_id: DEPARTMENT_ID,
    status: EReviewCycleStatus.CLOSED,
    nominee_count: 3,
    response_count: 3,
    opened_at: '2025-09-01T09:00:00Z',
    started_at: '2025-09-10T09:00:00Z',
    closed_at: '2025-10-01T09:00:00Z',
    created_at: '2025-08-20T09:00:00Z',
    created_by: DIRECTOR_EMPLOYEE_ID,
  },
]

export const mockReviewNominees: IReviewNominee[] = [
  {
    id: 'nominee-0001-0000-0000-000000000001',
    cycle_id: 'cycle-0002-0000-0000-000000000002',
    reviewer_employee_id: REVIEWER_EMPLOYEE_ID_1,
    reviewer_display_name: 'Bob Jones',
    nominated_by: DIRECTOR_EMPLOYEE_ID,
    nominated_by_display_name: 'Director Dan',
    status: EReviewNomineeStatus.SUBMITTED,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'nominee-0002-0000-0000-000000000002',
    cycle_id: 'cycle-0002-0000-0000-000000000002',
    reviewer_employee_id: REVIEWER_EMPLOYEE_ID_2,
    reviewer_display_name: 'Carol White',
    nominated_by: DIRECTOR_EMPLOYEE_ID,
    nominated_by_display_name: 'Director Dan',
    status: EReviewNomineeStatus.INVITED,
    created_at: '2026-02-01T10:05:00Z',
  },
  {
    id: 'nominee-0003-0000-0000-000000000003',
    cycle_id: 'cycle-0002-0000-0000-000000000002',
    reviewer_employee_id: REVIEWER_EMPLOYEE_ID_3,
    reviewer_display_name: 'Dave Brown',
    nominated_by: SUBJECT_EMPLOYEE_ID,
    nominated_by_display_name: 'Alice Smith',
    status: EReviewNomineeStatus.INVITED,
    created_at: '2026-02-02T10:00:00Z',
  },
]

export const mockReviewResponses: IReviewResponse[] = [
  {
    id: 'response-0001-0000-0000-000000000001',
    cycle_id: 'cycle-0002-0000-0000-000000000002',
    nominee_id: 'nominee-0001-0000-0000-000000000001',
    overall_rating: 4,
    comments:
      'Alice consistently delivers high quality work and collaborates well with the team.',
    created_at: '2026-02-15T14:00:00Z',
  },
  {
    id: 'response-0002-0000-0000-000000000002',
    cycle_id: 'cycle-0003-0000-0000-000000000003',
    nominee_id: 'nominee-q3-001',
    overall_rating: 5,
    comments: 'Excellent performance across all areas. A true team player.',
    created_at: '2025-09-25T10:00:00Z',
  },
]

export const mockAggregatedResults: IAggregatedResults = {
  view: 'aggregated',
  cycle_id: 'cycle-0003-0000-0000-000000000003',
  cycle_title: 'Q3 Review — Alice Smith',
  status: EReviewCycleStatus.CLOSED,
  average_rating: 3.7,
  response_count: 3,
  comments: [
    {
      overall_rating: 4,
      comments:
        'Strong technical skills and excellent problem-solving ability.',
    },
    {
      overall_rating: 3,
      comments: 'Great collaboration — always willing to help teammates.',
    },
    {
      overall_rating: 4,
      comments: 'Communicates clearly and delivers on time consistently.',
    },
  ],
}

export const mockDetailedResults: IDetailedResults = {
  view: 'detailed',
  cycle_id: 'cycle-0003-0000-0000-000000000003',
  cycle_title: 'Q3 Review — Alice Smith',
  subject_display_name: 'Alice Smith',
  status: EReviewCycleStatus.CLOSED,
  average_rating: 3.7,
  response_count: 3,
  responses: [
    {
      reviewer_employee_id: REVIEWER_EMPLOYEE_ID_1,
      reviewer_display_name: 'Bob Jones',
      overall_rating: 4,
      comments:
        'Strong technical skills and excellent problem-solving ability.',
      submitted_at: '2025-09-20T09:00:00Z',
    },
    {
      reviewer_employee_id: REVIEWER_EMPLOYEE_ID_2,
      reviewer_display_name: 'Carol White',
      overall_rating: 3,
      comments: 'Great collaboration — always willing to help teammates.',
      submitted_at: '2025-09-21T11:00:00Z',
    },
    {
      reviewer_employee_id: REVIEWER_EMPLOYEE_ID_3,
      reviewer_display_name: 'Dave Brown',
      overall_rating: 4,
      comments: 'Communicates clearly and delivers on time consistently.',
      submitted_at: '2025-09-22T14:00:00Z',
    },
  ],
}

export const mockReviewRequests: IReviewRequest[] = [
  {
    cycle_id: 'cycle-0002-0000-0000-000000000002',
    cycle_title: 'Mid-Year Review — Alice Smith',
    subject_display_name: 'Alice',
    nominee_status: EReviewNomineeStatus.INVITED,
    cycle_started_at: '2026-02-10T09:00:00Z',
  },
  {
    cycle_id: 'cycle-req2-0000-0000-000000000001',
    cycle_title: 'Q1 Review — Jane Doe',
    subject_display_name: 'Jane',
    nominee_status: EReviewNomineeStatus.INVITED,
    cycle_started_at: '2026-02-05T09:00:00Z',
  },
]
