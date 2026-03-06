import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  IAddPositionSkillDto,
  IAddSkillLevelDto,
  ICreateCareerPathDto,
  ICreateCareerTrackDto,
  ICreatePositionDto,
  ICreateSkillCategoryDto,
  ICreateSkillDto,
  IUpdateCareerPathDto,
  IUpdateCareerTrackDto,
  IUpdatePositionDto,
  IUpdatePositionSkillDto,
  IUpdateSkillCategoryDto,
  IUpdateSkillDto,
  IUpdateSkillLevelDto,
} from '@/types/taxonomy.types'
import { taxonomyApiService } from '@/services/taxonomyService'

// --- Query key factory ---

const TAXONOMY_KEYS = {
  careerPaths: ['taxonomy', 'career-paths'] as const,
  careerPath: (id: string) => ['taxonomy', 'career-paths', id] as const,
  careerTracks: (careerPathId?: string) =>
    ['taxonomy', 'career-tracks', careerPathId ?? 'all'] as const,
  careerTrack: (id: string) => ['taxonomy', 'career-tracks', id] as const,
  position: (id: string) => ['taxonomy', 'positions', id] as const,
  skillCategories: ['taxonomy', 'skill-categories'] as const,
  skills: (categoryId?: string) =>
    ['taxonomy', 'skills', categoryId ?? 'all'] as const,
  skill: (id: string) => ['taxonomy', 'skills', id] as const,
}

// --- Read hooks ---

export const useCareerPaths = () =>
  useQuery({
    queryKey: TAXONOMY_KEYS.careerPaths,
    queryFn: async () => {
      const res = await taxonomyApiService.getCareerPaths({ per_page: 100 })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

export const useCareerPath = (id: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.careerPath(id),
    queryFn: async () => {
      const res = await taxonomyApiService.getCareerPath(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

export const useCareerTracks = (careerPathId?: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.careerTracks(careerPathId),
    queryFn: async () => {
      const res = await taxonomyApiService.getCareerTracks({
        career_path_id: careerPathId,
        per_page: 100,
      })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

export const useCareerTrack = (id: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.careerTrack(id),
    queryFn: async () => {
      const res = await taxonomyApiService.getCareerTrack(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

export const usePosition = (id: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.position(id),
    queryFn: async () => {
      const res = await taxonomyApiService.getPosition(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

export const useSkillCategories = () =>
  useQuery({
    queryKey: TAXONOMY_KEYS.skillCategories,
    queryFn: async () => {
      const res = await taxonomyApiService.getSkillCategories({ per_page: 100 })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

export const useSkills = (categoryId?: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.skills(categoryId),
    queryFn: async () => {
      const res = await taxonomyApiService.getSkills({
        category_id: categoryId,
        per_page: 100,
      })
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

export const useSkill = (id: string) =>
  useQuery({
    queryKey: TAXONOMY_KEYS.skill(id),
    queryFn: async () => {
      const res = await taxonomyApiService.getSkill(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })

// --- Admin mutation hooks ---

export const useCreateCareerPath = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreateCareerPathDto) =>
      taxonomyApiService.createCareerPath(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerPaths })
    },
  })
}

export const useUpdateCareerPath = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateCareerPathDto }) =>
      taxonomyApiService.updateCareerPath(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerPaths })
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerPath(id) })
    },
  })
}

export const useCreateCareerTrack = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreateCareerTrackDto) =>
      taxonomyApiService.createCareerTrack(dto),
    onSuccess: (_data, { career_path_id }) => {
      qc.invalidateQueries({
        queryKey: TAXONOMY_KEYS.careerTracks(career_path_id),
      })
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerTracks() })
      qc.invalidateQueries({
        queryKey: TAXONOMY_KEYS.careerPath(career_path_id),
      })
    },
  })
}

export const useUpdateCareerTrack = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateCareerTrackDto }) =>
      taxonomyApiService.updateCareerTrack(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerTracks() })
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.careerTrack(id) })
    },
  })
}

export const useCreatePosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreatePositionDto) =>
      taxonomyApiService.createPosition(dto),
    onSuccess: (_data, { career_track_id }) => {
      qc.invalidateQueries({
        queryKey: TAXONOMY_KEYS.careerTrack(career_track_id),
      })
    },
  })
}

export const useUpdatePosition = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdatePositionDto }) =>
      taxonomyApiService.updatePosition(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.position(id) })
    },
  })
}

export const useCreateSkillCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreateSkillCategoryDto) =>
      taxonomyApiService.createSkillCategory(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skillCategories })
    },
  })
}

export const useUpdateSkillCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateSkillCategoryDto }) =>
      taxonomyApiService.updateSkillCategory(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skillCategories })
    },
  })
}

export const useCreateSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: ICreateSkillDto) => taxonomyApiService.createSkill(dto),
    onSuccess: (_data, { category_id }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skills(category_id) })
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skills() })
    },
  })
}

export const useUpdateSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateSkillDto }) =>
      taxonomyApiService.updateSkill(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skills() })
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skill(id) })
    },
  })
}

export const useDeleteSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => taxonomyApiService.deleteSkill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skills() })
    },
  })
}

export const useAddSkillLevel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      dto,
    }: {
      skillId: string
      dto: IAddSkillLevelDto
    }) => taxonomyApiService.addSkillLevel(skillId, dto),
    onSuccess: (_data, { skillId }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skill(skillId) })
    },
  })
}

export const useUpdateSkillLevel = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      skillId,
      levelId,
      dto,
    }: {
      skillId: string
      levelId: string
      dto: IUpdateSkillLevelDto
    }) => taxonomyApiService.updateSkillLevel(skillId, levelId, dto),
    onSuccess: (_data, { skillId }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.skill(skillId) })
    },
  })
}

export const useAddPositionSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      positionId,
      dto,
    }: {
      positionId: string
      dto: IAddPositionSkillDto
    }) => taxonomyApiService.addPositionSkill(positionId, dto),
    onSuccess: (_data, { positionId }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.position(positionId) })
    },
  })
}

export const useUpdatePositionSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      positionId,
      positionSkillId,
      dto,
    }: {
      positionId: string
      positionSkillId: string
      dto: IUpdatePositionSkillDto
    }) =>
      taxonomyApiService.updatePositionSkill(positionId, positionSkillId, dto),
    onSuccess: (_data, { positionId }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.position(positionId) })
    },
  })
}

export const useDeletePositionSkill = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      positionId,
      positionSkillId,
    }: {
      positionId: string
      positionSkillId: string
    }) => taxonomyApiService.deletePositionSkill(positionId, positionSkillId),
    onSuccess: (_data, { positionId }) => {
      qc.invalidateQueries({ queryKey: TAXONOMY_KEYS.position(positionId) })
    },
  })
}
