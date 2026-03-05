import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewCycleApiService } from '../services/reviewCycles/reviewCycleService'
import type {
  IAddNomineeRequest,
  ICreateReviewCycleRequest,
  IListReviewCyclesParams,
  ISubmitResponseRequest,
  ITransitionStatusRequest,
} from '../types/reviewCycle.types'

const REVIEW_CYCLE_KEYS = {
  all: ['review-cycles'] as const,
  list: (params?: IListReviewCyclesParams) =>
    [...REVIEW_CYCLE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...REVIEW_CYCLE_KEYS.all, id] as const,
  nominees: (cycleId: string) =>
    [...REVIEW_CYCLE_KEYS.all, cycleId, 'nominees'] as const,
  results: (cycleId: string) =>
    [...REVIEW_CYCLE_KEYS.all, cycleId, 'results'] as const,
  myRequests: ['review-requests'] as const,
}

export const useReviewCycles = (params?: IListReviewCyclesParams) =>
  useQuery({
    queryKey: REVIEW_CYCLE_KEYS.list(params),
    queryFn: async () => {
      const res = await reviewCycleApiService.listCycles(params)
      return res.data.data
    },
    staleTime: 2 * 60 * 1000,
  })

export const useReviewCycle = (id: string) =>
  useQuery({
    queryKey: REVIEW_CYCLE_KEYS.detail(id),
    queryFn: async () => {
      const res = await reviewCycleApiService.getCycle(id)
      return res.data.data
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })

export const useReviewNominees = (cycleId: string) =>
  useQuery({
    queryKey: REVIEW_CYCLE_KEYS.nominees(cycleId),
    queryFn: async () => {
      const res = await reviewCycleApiService.getNominees(cycleId)
      return res.data.data ?? []
    },
    enabled: Boolean(cycleId),
  })

export const useReviewCycleResults = (
  cycleId: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: REVIEW_CYCLE_KEYS.results(cycleId),
    queryFn: async () => {
      const res = await reviewCycleApiService.getResults(cycleId)
      return res.data.data
    },
    enabled: options?.enabled !== false && Boolean(cycleId),
    staleTime: 5 * 60 * 1000,
  })

export const useMyReviewRequests = () =>
  useQuery({
    queryKey: REVIEW_CYCLE_KEYS.myRequests,
    queryFn: async () => {
      const res = await reviewCycleApiService.listMyReviewRequests()
      return res.data.data ?? []
    },
    staleTime: 2 * 60 * 1000,
  })

export const useCreateReviewCycle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreateReviewCycleRequest) =>
      reviewCycleApiService.createCycle(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.all })
    },
  })
}

export const useTransitionCycleStatus = (cycleId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ITransitionStatusRequest) =>
      reviewCycleApiService.transitionStatus(cycleId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.detail(cycleId) })
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.all })
    },
  })
}

export const useAddNominee = (cycleId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: IAddNomineeRequest) =>
      reviewCycleApiService.addNominee(cycleId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.nominees(cycleId) })
    },
  })
}

export const useRemoveNominee = (cycleId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nomineeId: string) =>
      reviewCycleApiService.removeNominee(cycleId, nomineeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.nominees(cycleId) })
    },
  })
}

export const useSubmitReviewResponse = (cycleId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ISubmitResponseRequest) =>
      reviewCycleApiService.submitResponse(cycleId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.detail(cycleId) })
      qc.invalidateQueries({ queryKey: REVIEW_CYCLE_KEYS.myRequests })
    },
  })
}
