/**
 * Team Member Mappers
 * Transform DTOs to Models for presentation layer (Feature 0010a)
 */

import type {
  IManagerViewFeedbackDto,
  ITeamMemberDto,
} from '../dtos/TeamMemberDto'
import type { IManagerViewFeedback, ITeamMember } from '../models/TeamMember'

/**
 * Map a team member DTO to the presentation model.
 */
export const mapTeamMember = (dto: ITeamMemberDto): ITeamMember => {
  const initials = dto.full_name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)

  return {
    id: dto.id,
    fullName: dto.full_name,
    jobTitle: dto.job_title,
    positionId: dto.position_id,
    positionName: dto.position_name,
    initials,
  }
}

/**
 * Map a manager-view feedback DTO to the presentation model.
 */
export const mapManagerViewFeedback = (
  dto: IManagerViewFeedbackDto
): IManagerViewFeedback => ({
  id: dto.id,
  rating: dto.rating,
  comment: dto.comment,
  submittedById: dto.submitted_by_id,
  submittedByName: dto.submitted_by_name,
  createdAt: new Date(dto.created_at),
})
