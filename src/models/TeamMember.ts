/**
 * Team Member Models - Presentation Layer
 * Domain models for team member data (Feature 0010a)
 */

export interface ITeamMember {
  id: string
  fullName: string
  jobTitle: string
  positionId: string
  positionName: string
  /** Computed initials for avatar display */
  initials: string
}

export interface IManagerViewFeedback {
  id: string
  rating: number
  comment: string
  submittedById: string
  submittedByName: string
  createdAt: Date
}
