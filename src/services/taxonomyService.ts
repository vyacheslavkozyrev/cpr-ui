import { apiClient } from '@/services/apiClient'
import type {
  IAddPositionSkillDto,
  IAddSkillLevelDto,
  ICareerPathDetail,
  ICareerPathSummary,
  ICareerTrackDetail,
  ICareerTrackSummary,
  ICreateCareerPathDto,
  ICreateCareerTrackDto,
  ICreatePositionDto,
  ICreateSkillCategoryDto,
  ICreateSkillDto,
  IPaginatedResponse,
  IPositionDetail,
  IPositionSkillRequirement,
  IPositionSummary,
  ISkillCategory,
  ISkillDetail,
  ISkillLevelSummary,
  ISkillSummary,
  IUpdateCareerPathDto,
  IUpdateCareerTrackDto,
  IUpdatePositionDto,
  IUpdatePositionSkillDto,
  IUpdateSkillCategoryDto,
  IUpdateSkillDto,
  IUpdateSkillLevelDto,
} from '@/types/taxonomy.types'

class TaxonomyApiService {
  // --- Career Paths ---

  async getCareerPaths(params?: {
    page?: number
    per_page?: number
    sort_by?: string
    sort_dir?: string
  }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    if (params?.sort_by) query.set('sort_by', params.sort_by)
    if (params?.sort_dir) query.set('sort_dir', params.sort_dir)
    const qs = query.toString()
    return apiClient.get<IPaginatedResponse<ICareerPathSummary>>(
      `/taxonomy/career-paths${qs ? `?${qs}` : ''}`
    )
  }

  async getCareerPath(id: string) {
    return apiClient.get<ICareerPathDetail>(`/taxonomy/career-paths/${id}`)
  }

  async createCareerPath(dto: ICreateCareerPathDto) {
    return apiClient.post<ICareerPathSummary>('/taxonomy/career-paths', dto)
  }

  async updateCareerPath(id: string, dto: IUpdateCareerPathDto) {
    return apiClient.patch<ICareerPathSummary>(
      `/taxonomy/career-paths/${id}`,
      dto
    )
  }

  // --- Career Tracks ---

  async getCareerTracks(params?: {
    career_path_id?: string
    page?: number
    per_page?: number
  }) {
    const query = new URLSearchParams()
    if (params?.career_path_id)
      query.set('career_path_id', params.career_path_id)
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    const qs = query.toString()
    return apiClient.get<IPaginatedResponse<ICareerTrackSummary>>(
      `/taxonomy/career-tracks${qs ? `?${qs}` : ''}`
    )
  }

  async getCareerTrack(id: string) {
    return apiClient.get<ICareerTrackDetail>(`/taxonomy/career-tracks/${id}`)
  }

  async createCareerTrack(dto: ICreateCareerTrackDto) {
    return apiClient.post<ICareerTrackSummary>('/taxonomy/career-tracks', dto)
  }

  async updateCareerTrack(id: string, dto: IUpdateCareerTrackDto) {
    return apiClient.patch<ICareerTrackSummary>(
      `/taxonomy/career-tracks/${id}`,
      dto
    )
  }

  // --- Positions ---

  async getPosition(id: string) {
    return apiClient.get<IPositionDetail>(`/taxonomy/positions/${id}`)
  }

  async createPosition(dto: ICreatePositionDto) {
    return apiClient.post<IPositionSummary>('/taxonomy/positions', dto)
  }

  async updatePosition(id: string, dto: IUpdatePositionDto) {
    return apiClient.patch<IPositionSummary>(`/taxonomy/positions/${id}`, dto)
  }

  async addPositionSkill(positionId: string, dto: IAddPositionSkillDto) {
    return apiClient.post<IPositionSkillRequirement>(
      `/taxonomy/positions/${positionId}/skills`,
      dto
    )
  }

  async updatePositionSkill(
    positionId: string,
    positionSkillId: string,
    dto: IUpdatePositionSkillDto
  ) {
    return apiClient.patch<IPositionSkillRequirement>(
      `/taxonomy/positions/${positionId}/skills/${positionSkillId}`,
      dto
    )
  }

  async deletePositionSkill(positionId: string, positionSkillId: string) {
    return apiClient.delete<void>(
      `/taxonomy/positions/${positionId}/skills/${positionSkillId}`
    )
  }

  // --- Skill Categories ---

  async getSkillCategories(params?: { page?: number; per_page?: number }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    const qs = query.toString()
    return apiClient.get<IPaginatedResponse<ISkillCategory>>(
      `/taxonomy/skill-categories${qs ? `?${qs}` : ''}`
    )
  }

  async createSkillCategory(dto: ICreateSkillCategoryDto) {
    return apiClient.post<ISkillCategory>('/taxonomy/skill-categories', dto)
  }

  async updateSkillCategory(id: string, dto: IUpdateSkillCategoryDto) {
    return apiClient.patch<ISkillCategory>(
      `/taxonomy/skill-categories/${id}`,
      dto
    )
  }

  // --- Skills ---

  async getSkills(params?: {
    category_id?: string
    page?: number
    per_page?: number
  }) {
    const query = new URLSearchParams()
    if (params?.category_id) query.set('category_id', params.category_id)
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    const qs = query.toString()
    return apiClient.get<IPaginatedResponse<ISkillSummary>>(
      `/taxonomy/skills${qs ? `?${qs}` : ''}`
    )
  }

  async getSkill(id: string) {
    return apiClient.get<ISkillDetail>(`/taxonomy/skills/${id}`)
  }

  async createSkill(dto: ICreateSkillDto) {
    return apiClient.post<ISkillDetail>('/taxonomy/skills', dto)
  }

  async updateSkill(id: string, dto: IUpdateSkillDto) {
    return apiClient.patch<ISkillDetail>(`/taxonomy/skills/${id}`, dto)
  }

  async deleteSkill(id: string) {
    return apiClient.delete<void>(`/taxonomy/skills/${id}`)
  }

  async addSkillLevel(skillId: string, dto: IAddSkillLevelDto) {
    return apiClient.post<ISkillLevelSummary>(
      `/taxonomy/skills/${skillId}/levels`,
      dto
    )
  }

  async updateSkillLevel(
    skillId: string,
    levelId: string,
    dto: IUpdateSkillLevelDto
  ) {
    return apiClient.patch<ISkillLevelSummary>(
      `/taxonomy/skills/${skillId}/levels/${levelId}`,
      dto
    )
  }
}

export const taxonomyApiService = new TaxonomyApiService()
