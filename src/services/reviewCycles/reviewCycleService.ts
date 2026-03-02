import { apiClient } from '../apiClient'
import type {
  IAddNomineeRequest,
  IAggregatedResults,
  ICreateReviewCycleRequest,
  IDetailedResults,
  IListReviewCyclesParams,
  IPaginatedResponse,
  IReviewCycleDetail,
  IReviewCycleSummary,
  IReviewCycleStatusTransition,
  IReviewNominee,
  IReviewRequest,
  IReviewResponse,
  ISubmitResponseRequest,
  ITransitionStatusRequest,
} from '../../types/reviewCycle.types'

class ReviewCycleApiService {
  async createCycle(dto: ICreateReviewCycleRequest) {
    return apiClient.post<IReviewCycleDetail>('/review-cycles', dto)
  }

  async listCycles(params?: IListReviewCyclesParams) {
    const search = new URLSearchParams()
    if (params?.page) search.set('page', params.page.toString())
    if (params?.page_size) search.set('page_size', params.page_size.toString())
    if (params?.status) search.set('status', params.status)
    if (params?.sort_dir) search.set('sort_dir', params.sort_dir)
    const qs = search.toString()
    return apiClient.get<{ data: IPaginatedResponse<IReviewCycleSummary> }>(
      `/review-cycles${qs ? `?${qs}` : ''}`
    )
  }

  async getCycle(id: string) {
    return apiClient.get<{ data: IReviewCycleDetail }>(`/review-cycles/${id}`)
  }

  async transitionStatus(id: string, dto: ITransitionStatusRequest) {
    return apiClient.patch<IReviewCycleStatusTransition>(
      `/review-cycles/${id}/status`,
      dto
    )
  }

  async addNominee(cycleId: string, dto: IAddNomineeRequest) {
    return apiClient.post<IReviewNominee>(
      `/review-cycles/${cycleId}/nominees`,
      dto
    )
  }

  async removeNominee(cycleId: string, nomineeId: string) {
    return apiClient.delete(`/review-cycles/${cycleId}/nominees/${nomineeId}`)
  }

  async getNominees(cycleId: string) {
    return apiClient.get<{ data: IReviewNominee[] }>(
      `/review-cycles/${cycleId}/nominees`
    )
  }

  async submitResponse(cycleId: string, dto: ISubmitResponseRequest) {
    return apiClient.post<IReviewResponse>(
      `/review-cycles/${cycleId}/responses`,
      dto
    )
  }

  async getResults(cycleId: string) {
    return apiClient.get<{ data: IAggregatedResults | IDetailedResults }>(
      `/review-cycles/${cycleId}/results`
    )
  }

  async listMyReviewRequests() {
    return apiClient.get<{ data: IReviewRequest[] }>('/me/review-requests')
  }
}

export const reviewCycleApiService = new ReviewCycleApiService()
