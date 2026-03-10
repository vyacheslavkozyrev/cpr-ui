import { apiClient } from './apiClient'
import type {
  IAssessedLevel,
  IEvidenceItem,
  IEmployeeSkillAssessmentResponse,
  ILinkEvidenceRequest,
  ISkillAssessmentResponse,
  ITargetLevel,
  ITeamSkillSummaryResponse,
  IUpsertSkillAssessmentRequest,
  IUpsertSkillTargetRequest,
} from '../types/skillAssessment.types'

class SkillAssessmentApiService {
  async getMyAssessment() {
    return apiClient.get<ISkillAssessmentResponse>('/me/skill-assessment')
  }

  async upsertCurrentLevel(
    skillId: string,
    dto: IUpsertSkillAssessmentRequest
  ) {
    return apiClient.put<IAssessedLevel>(
      `/me/skill-assessment/skills/${skillId}`,
      dto
    )
  }

  async deleteCurrentLevel(skillId: string) {
    return apiClient.delete<void>(`/me/skill-assessment/skills/${skillId}`)
  }

  async upsertTarget(skillId: string, dto: IUpsertSkillTargetRequest) {
    return apiClient.put<ITargetLevel>(
      `/me/skill-assessment/skills/${skillId}/target`,
      dto
    )
  }

  async deleteTarget(skillId: string) {
    return apiClient.delete<void>(
      `/me/skill-assessment/skills/${skillId}/target`
    )
  }

  async linkEvidence(skillId: string, dto: ILinkEvidenceRequest) {
    return apiClient.post<IEvidenceItem>(
      `/me/skill-assessment/skills/${skillId}/evidence`,
      dto
    )
  }

  async unlinkEvidence(skillId: string, feedbackId: string) {
    return apiClient.delete<void>(
      `/me/skill-assessment/skills/${skillId}/evidence/${feedbackId}`
    )
  }

  async getEmployeeAssessment(employeeId: string) {
    return apiClient.get<IEmployeeSkillAssessmentResponse>(
      `/employees/${employeeId}/skill-assessment`
    )
  }

  async getTeamSummary() {
    return apiClient.get<ITeamSkillSummaryResponse>(
      '/me/team/skill-assessment-summary'
    )
  }
}

export const skillAssessmentApiService = new SkillAssessmentApiService()
