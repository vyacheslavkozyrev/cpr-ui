import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ILinkEvidenceRequest,
  IUpsertManagerAssessmentRequest,
  IUpsertSkillAssessmentRequest,
} from '../types/skillAssessment.types'
import { skillAssessmentApiService } from './skillAssessmentService'

const SKILL_ASSESSMENT_KEYS = {
  myAssessment: ['skill-assessment', 'me'] as const,
  employeeAssessment: (employeeId: string) =>
    ['skill-assessment', 'employee', employeeId] as const,
  teamSummary: ['skill-assessment', 'team-summary'] as const,
}

export const useMySkillAssessment = () =>
  useQuery({
    queryKey: SKILL_ASSESSMENT_KEYS.myAssessment,
    queryFn: async () => {
      const res = await skillAssessmentApiService.getMyAssessment()
      return res.data
    },
    staleTime: 2 * 60 * 1000,
  })

export const useEmployeeSkillAssessment = (employeeId: string) =>
  useQuery({
    queryKey: SKILL_ASSESSMENT_KEYS.employeeAssessment(employeeId),
    queryFn: async () => {
      const res =
        await skillAssessmentApiService.getEmployeeAssessment(employeeId)
      return res.data
    },
    enabled: Boolean(employeeId),
    staleTime: 2 * 60 * 1000,
  })

export const useTeamSkillSummary = () =>
  useQuery({
    queryKey: SKILL_ASSESSMENT_KEYS.teamSummary,
    queryFn: async () => {
      const res = await skillAssessmentApiService.getTeamSummary()
      return res.data
    },
    staleTime: 2 * 60 * 1000,
  })

export const useUpsertCurrentLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      dto,
    }: {
      skillId: string
      dto: IUpsertSkillAssessmentRequest
    }) => skillAssessmentApiService.upsertCurrentLevel(skillId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SKILL_ASSESSMENT_KEYS.myAssessment,
      })
    },
  })
}

export const useDeleteCurrentLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) =>
      skillAssessmentApiService.deleteCurrentLevel(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SKILL_ASSESSMENT_KEYS.myAssessment,
      })
    },
  })
}

export const useUpsertManagerAssessment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      skillId,
      dto,
    }: {
      employeeId: string
      skillId: string
      dto: IUpsertManagerAssessmentRequest
    }) =>
      skillAssessmentApiService.upsertManagerAssessment(
        employeeId,
        skillId,
        dto
      ),
    onSuccess: (_data, { employeeId }) => {
      queryClient.invalidateQueries({
        queryKey: SKILL_ASSESSMENT_KEYS.employeeAssessment(employeeId),
      })
    },
  })
}

export const useLinkEvidence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      dto,
    }: {
      skillId: string
      dto: ILinkEvidenceRequest
    }) => skillAssessmentApiService.linkEvidence(skillId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SKILL_ASSESSMENT_KEYS.myAssessment,
      })
    },
  })
}

export const useUnlinkEvidence = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      feedbackId,
    }: {
      skillId: string
      feedbackId: string
    }) => skillAssessmentApiService.unlinkEvidence(skillId, feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SKILL_ASSESSMENT_KEYS.myAssessment,
      })
    },
  })
}
