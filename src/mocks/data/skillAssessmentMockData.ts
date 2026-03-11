import type {
  IEmployeeSkillAssessmentResponse,
  ISkillAssessmentResponse,
  ITeamSkillSummaryResponse,
} from '../../types/skillAssessment.types'

export const mockSkillAssessmentResponse: ISkillAssessmentResponse = {
  position: {
    id: 'pos-001',
    title: 'Senior Software Engineer',
    career_track: {
      id: 'track-001',
      title: 'Backend Engineering',
    },
    career_path: {
      id: 'path-001',
      title: 'Engineering',
    },
  },
  next_position: {
    id: 'pos-002',
    title: 'Staff Software Engineer',
  },
  skill_categories: [
    {
      id: 'cat-001',
      title: 'Technical Skills',
      skills: [
        {
          skill_id: 'skill-001',
          skill_title: 'TypeScript',
          skill_description: 'Proficiency in TypeScript language and ecosystem',
          required_level: { id: 'level-003', title: 'Advanced', value: 3 },
          next_position_required_level: {
            id: 'level-004',
            title: 'Expert',
            value: 4,
          },
          assessed: {
            id: 'assess-001',
            skill_id: 'skill-001',
            self_assessment_value: 2,
            manager_assessment_value: null,
            notes: 'Led API migration in Q3',
          },
          evidence: [
            {
              id: 'evid-001',
              feedback_id: 'fb-001',
              sender_display_name: 'Alice Johnson',
              rating: 4,
              content_excerpt:
                'Great job leading the API review and migration.',
            },
          ],
        },
        {
          skill_id: 'skill-002',
          skill_title: 'System Design',
          skill_description: 'Ability to design scalable distributed systems',
          required_level: { id: 'level-003', title: 'Advanced', value: 3 },
          next_position_required_level: {
            id: 'level-004',
            title: 'Expert',
            value: 4,
          },
          assessed: null,
          evidence: [],
        },
        {
          skill_id: 'skill-003',
          skill_title: '.NET / C#',
          skill_description: 'Backend development with .NET framework',
          required_level: { id: 'level-002', title: 'Intermediate', value: 2 },
          next_position_required_level: {
            id: 'level-003',
            title: 'Advanced',
            value: 3,
          },
          assessed: {
            id: 'assess-002',
            skill_id: 'skill-003',
            self_assessment_value: 3,
            manager_assessment_value: 3.5,
            notes: null,
          },
          evidence: [],
        },
      ],
    },
    {
      id: 'cat-002',
      title: 'Leadership & Communication',
      skills: [
        {
          skill_id: 'skill-004',
          skill_title: 'Team Collaboration',
          skill_description: 'Ability to work effectively within a team',
          required_level: { id: 'level-002', title: 'Intermediate', value: 2 },
          next_position_required_level: {
            id: 'level-003',
            title: 'Advanced',
            value: 3,
          },
          assessed: {
            id: 'assess-003',
            skill_id: 'skill-004',
            self_assessment_value: 2,
            manager_assessment_value: null,
            notes: null,
          },
          evidence: [],
        },
        {
          skill_id: 'skill-005',
          skill_title: 'Technical Writing',
          skill_description: 'Ability to write clear technical documentation',
          required_level: { id: 'level-001', title: 'Beginner', value: 1 },
          next_position_required_level: null,
          assessed: null,
          evidence: [],
        },
      ],
    },
  ],
}

export const mockEmployeeSkillAssessmentResponse: IEmployeeSkillAssessmentResponse =
  {
    ...mockSkillAssessmentResponse,
    employee: {
      id: 'emp-002',
      display_name: 'Jane Smith',
    },
  }

export const mockTeamSkillSummaryResponse: ITeamSkillSummaryResponse = {
  team: [
    {
      employee_id: 'emp-002',
      display_name: 'Jane Smith',
      position_title: 'Senior Software Engineer',
      total_required_skills: 5,
      assessed_skill_count: 3,
      skills_meeting_requirement_count: 2,
    },
    {
      employee_id: 'emp-003',
      display_name: 'Bob Chen',
      position_title: 'Software Engineer',
      total_required_skills: 4,
      assessed_skill_count: 4,
      skills_meeting_requirement_count: 4,
    },
    {
      employee_id: 'emp-004',
      display_name: 'Maria Garcia',
      position_title: 'Senior Software Engineer',
      total_required_skills: 5,
      assessed_skill_count: 1,
      skills_meeting_requirement_count: 0,
    },
  ],
}

// Shared skill levels list for dropdown mock
export const mockSkillLevels = [
  { id: 'level-001', title: 'Beginner', value: 1 },
  { id: 'level-002', title: 'Intermediate', value: 2 },
  { id: 'level-003', title: 'Advanced', value: 3 },
  { id: 'level-004', title: 'Expert', value: 4 },
]
