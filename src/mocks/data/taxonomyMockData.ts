import type {
  ICareerPathDetail,
  ICareerPathSummary,
  ICareerTrackDetail,
  ICareerTrackSummary,
  IPaginatedResponse,
  IPositionDetail,
  IPositionSummary,
  ISkillCategory,
  ISkillDetail,
  ISkillSummary,
} from '@/types/taxonomy.types'

// --- Consistent UUIDs ---
const PATH_001 = 'cp-001-engineering'
const PATH_002 = 'cp-002-product'
const TRACK_001 = 'ct-001-backend'
const TRACK_002 = 'ct-002-frontend'
const TRACK_003 = 'ct-003-pm'
const POS_001 = 'pos-001-junior-be'
const POS_002 = 'pos-002-mid-be'
const POS_003 = 'pos-003-senior-be'
const CAT_001 = 'cat-001-technical'
const CAT_002 = 'cat-002-soft-skills'
const SKILL_001 = 'skill-001-typescript'
const SKILL_002 = 'skill-002-system-design'
const SKILL_003 = 'skill-003-communication'
const SKILL_004 = 'skill-004-dotnet'
const LVL_001_1 = 'lvl-001-1'
const LVL_001_2 = 'lvl-001-2'
const LVL_001_3 = 'lvl-001-3'
const LVL_001_4 = 'lvl-001-4'
const LVL_002_1 = 'lvl-002-1'
const LVL_002_2 = 'lvl-002-2'
const LVL_002_3 = 'lvl-002-3'
const LVL_003_1 = 'lvl-003-1'
const LVL_003_2 = 'lvl-003-2'
const LVL_003_3 = 'lvl-003-3'
const LVL_004_1 = 'lvl-004-1'
const LVL_004_2 = 'lvl-004-2'
const LVL_004_3 = 'lvl-004-3'
const LVL_004_4 = 'lvl-004-4'

// --- Career Paths ---

export const mockCareerPathsResponse: IPaginatedResponse<ICareerPathSummary> = {
  data: [
    {
      id: PATH_001,
      title: 'Engineering',
      description:
        'Software engineering career path for backend, frontend, and full-stack engineers.',
    },
    {
      id: PATH_002,
      title: 'Product',
      description:
        'Product management career path for product managers and owners.',
    },
  ],
  pagination: {
    page: 1,
    per_page: 100,
    total_items: 2,
    total_pages: 1,
  },
}

export const mockCareerPathEngineering: ICareerPathDetail = {
  id: PATH_001,
  title: 'Engineering',
  description:
    'Software engineering career path for backend, frontend, and full-stack engineers.',
  tracks: [
    {
      id: TRACK_001,
      title: 'Backend Engineering',
      description: 'Server-side development with .NET, databases, and APIs.',
    },
    {
      id: TRACK_002,
      title: 'Frontend Engineering',
      description: 'Client-side development with React, TypeScript, and MUI.',
    },
  ],
}

export const mockCareerPathProduct: ICareerPathDetail = {
  id: PATH_002,
  title: 'Product',
  description:
    'Product management career path for product managers and owners.',
  tracks: [
    {
      id: TRACK_003,
      title: 'Product Management',
      description: 'Roadmap planning, stakeholder management, and delivery.',
    },
  ],
}

// --- Career Tracks ---

export const mockCareerTracksResponse: IPaginatedResponse<ICareerTrackSummary> =
  {
    data: [
      {
        id: TRACK_001,
        title: 'Backend Engineering',
        description: 'Server-side development with .NET, databases, and APIs.',
        career_path_id: PATH_001,
        career_path_title: 'Engineering',
      },
      {
        id: TRACK_002,
        title: 'Frontend Engineering',
        description: 'Client-side development with React, TypeScript, and MUI.',
        career_path_id: PATH_001,
        career_path_title: 'Engineering',
      },
      {
        id: TRACK_003,
        title: 'Product Management',
        description: 'Roadmap planning, stakeholder management, and delivery.',
        career_path_id: PATH_002,
        career_path_title: 'Product',
      },
    ],
    pagination: {
      page: 1,
      per_page: 100,
      total_items: 3,
      total_pages: 1,
    },
  }

export const mockCareerTrackBackend: ICareerTrackDetail = {
  id: TRACK_001,
  title: 'Backend Engineering',
  description: 'Server-side development with .NET, databases, and APIs.',
  career_path_id: PATH_001,
  career_path_title: 'Engineering',
  positions: [
    {
      id: POS_001,
      title: 'Junior Backend Engineer',
      description:
        'Entry-level backend developer building features under guidance.',
      expectations:
        'Complete assigned tasks, write unit tests, participate in code reviews.',
      sort_order: 10,
    },
    {
      id: POS_002,
      title: 'Mid Backend Engineer',
      description: 'Independent contributor delivering end-to-end features.',
      expectations:
        'Design feature implementations, lead code reviews, mentor junior engineers.',
      sort_order: 20,
    },
    {
      id: POS_003,
      title: 'Senior Backend Engineer',
      description: 'Leads backend architecture and mentors junior engineers.',
      expectations:
        'Design scalable systems, conduct code reviews, mentor team members.',
      sort_order: 30,
    },
  ],
}

// --- Positions ---

export const mockPositionSummaries: IPositionSummary[] = [
  {
    id: POS_001,
    title: 'Junior Backend Engineer',
    description:
      'Entry-level backend developer building features under guidance.',
    expectations:
      'Complete assigned tasks, write unit tests, participate in code reviews.',
    sort_order: 10,
    career_track_id: TRACK_001,
    career_track_title: 'Backend Engineering',
  },
  {
    id: POS_002,
    title: 'Mid Backend Engineer',
    description: 'Independent contributor delivering end-to-end features.',
    expectations:
      'Design feature implementations, lead code reviews, mentor junior engineers.',
    sort_order: 20,
    career_track_id: TRACK_001,
    career_track_title: 'Backend Engineering',
  },
  {
    id: POS_003,
    title: 'Senior Backend Engineer',
    description: 'Leads backend architecture and mentors junior engineers.',
    expectations:
      'Design scalable systems, conduct code reviews, mentor team members.',
    sort_order: 30,
    career_track_id: TRACK_001,
    career_track_title: 'Backend Engineering',
  },
]

export const mockPositionJuniorBE: IPositionDetail = {
  id: POS_001,
  title: 'Junior Backend Engineer',
  description:
    'Entry-level backend developer building features under guidance.',
  expectations:
    'Complete assigned tasks, write unit tests, participate in code reviews.',
  career_track_id: TRACK_001,
  career_track_title: 'Backend Engineering',
  career_path_id: PATH_001,
  career_path_title: 'Engineering',
  sort_order: 10,
  skills: [
    {
      id: 'pts-j-001',
      skill_id: SKILL_001,
      skill_title: 'TypeScript',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_001_1,
      skill_level_title: 'Beginner',
      skill_level_value: 1,
      is_mandatory: true,
      rationale: 'Core language for frontend/fullstack work',
    },
    {
      id: 'pts-j-002',
      skill_id: SKILL_004,
      skill_title: '.NET',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_004_1,
      skill_level_title: 'Beginner',
      skill_level_value: 1,
      is_mandatory: true,
      rationale: 'Primary backend framework',
    },
    {
      id: 'pts-j-003',
      skill_id: SKILL_003,
      skill_title: 'Communication',
      category_id: CAT_002,
      category_title: 'Soft Skills',
      skill_level_id: LVL_003_1,
      skill_level_title: 'Beginner',
      skill_level_value: 1,
      is_mandatory: false,
      rationale: null,
    },
  ],
}

export const mockPositionMidBE: IPositionDetail = {
  id: POS_002,
  title: 'Mid Backend Engineer',
  description: 'Independent contributor delivering end-to-end features.',
  expectations:
    'Design feature implementations, lead code reviews, mentor junior engineers.',
  career_track_id: TRACK_001,
  career_track_title: 'Backend Engineering',
  career_path_id: PATH_001,
  career_path_title: 'Engineering',
  sort_order: 20,
  skills: [
    {
      id: 'pts-m-001',
      skill_id: SKILL_001,
      skill_title: 'TypeScript',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_001_2,
      skill_level_title: 'Intermediate',
      skill_level_value: 2,
      is_mandatory: true,
      rationale: 'Core language for frontend/fullstack work',
    },
    {
      id: 'pts-m-002',
      skill_id: SKILL_002,
      skill_title: 'System Design',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_002_1,
      skill_level_title: 'Beginner',
      skill_level_value: 1,
      is_mandatory: true,
      rationale: null,
    },
    {
      id: 'pts-m-003',
      skill_id: SKILL_004,
      skill_title: '.NET',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_004_2,
      skill_level_title: 'Intermediate',
      skill_level_value: 2,
      is_mandatory: true,
      rationale: 'Primary backend framework',
    },
    {
      id: 'pts-m-004',
      skill_id: SKILL_003,
      skill_title: 'Communication',
      category_id: CAT_002,
      category_title: 'Soft Skills',
      skill_level_id: LVL_003_1,
      skill_level_title: 'Beginner',
      skill_level_value: 1,
      is_mandatory: false,
      rationale: null,
    },
  ],
}

export const mockPositionSeniorBE: IPositionDetail = {
  id: POS_003,
  title: 'Senior Backend Engineer',
  description: 'Leads backend architecture and mentors junior engineers.',
  expectations:
    'Design scalable systems, conduct code reviews, mentor team members.',
  career_track_id: TRACK_001,
  career_track_title: 'Backend Engineering',
  career_path_id: PATH_001,
  career_path_title: 'Engineering',
  sort_order: 30,
  skills: [
    {
      id: 'pts-001',
      skill_id: SKILL_001,
      skill_title: 'TypeScript',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_001_3,
      skill_level_title: 'Advanced',
      skill_level_value: 3,
      is_mandatory: true,
      rationale: 'Core language for frontend/fullstack work',
    },
    {
      id: 'pts-002',
      skill_id: SKILL_002,
      skill_title: 'System Design',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_002_3,
      skill_level_title: 'Advanced',
      skill_level_value: 3,
      is_mandatory: true,
      rationale: null,
    },
    {
      id: 'pts-003',
      skill_id: SKILL_003,
      skill_title: 'Communication',
      category_id: CAT_002,
      category_title: 'Soft Skills',
      skill_level_id: LVL_003_2,
      skill_level_title: 'Intermediate',
      skill_level_value: 2,
      is_mandatory: false,
      rationale: null,
    },
    {
      id: 'pts-004',
      skill_id: SKILL_004,
      skill_title: '.NET',
      category_id: CAT_001,
      category_title: 'Technical',
      skill_level_id: LVL_004_4,
      skill_level_title: 'Expert',
      skill_level_value: 4,
      is_mandatory: true,
      rationale: 'Primary backend framework',
    },
  ],
}

// --- Skill Categories ---

export const mockSkillCategoriesResponse: IPaginatedResponse<ISkillCategory> = {
  data: [
    {
      id: CAT_001,
      title: 'Technical',
      description: 'Hard technical skills required for engineering roles.',
    },
    {
      id: CAT_002,
      title: 'Soft Skills',
      description: 'Interpersonal and communication skills for all roles.',
    },
  ],
  pagination: {
    page: 1,
    per_page: 100,
    total_items: 2,
    total_pages: 1,
  },
}

// --- Skills ---

export const mockSkillsResponse: IPaginatedResponse<ISkillSummary> = {
  data: [
    {
      id: SKILL_001,
      title: 'TypeScript',
      description: 'Proficiency in TypeScript language and ecosystem.',
      category_id: CAT_001,
      category_title: 'Technical',
    },
    {
      id: SKILL_002,
      title: 'System Design',
      description: 'Ability to design scalable distributed systems.',
      category_id: CAT_001,
      category_title: 'Technical',
    },
    {
      id: SKILL_003,
      title: 'Communication',
      description:
        'Ability to communicate clearly with technical and non-technical stakeholders.',
      category_id: CAT_002,
      category_title: 'Soft Skills',
    },
    {
      id: SKILL_004,
      title: '.NET',
      description: 'Backend development with .NET and C#.',
      category_id: CAT_001,
      category_title: 'Technical',
    },
  ],
  pagination: {
    page: 1,
    per_page: 100,
    total_items: 4,
    total_pages: 1,
  },
}

export const mockSkillTypeScript: ISkillDetail = {
  id: SKILL_001,
  title: 'TypeScript',
  description: 'Proficiency in TypeScript language and ecosystem.',
  category_id: CAT_001,
  category_title: 'Technical',
  levels: [
    {
      id: LVL_001_1,
      title: 'Beginner',
      description:
        'Knows basic types, interfaces, and can read TypeScript code.',
      value: 1,
    },
    {
      id: LVL_001_2,
      title: 'Intermediate',
      description:
        'Uses generics, utility types, and can write well-typed components.',
      value: 2,
    },
    {
      id: LVL_001_3,
      title: 'Advanced',
      description:
        'Creates complex generic types, conditional types, and mapped types.',
      value: 3,
    },
    {
      id: LVL_001_4,
      title: 'Expert',
      description:
        'Designs type-safe APIs, builds TS tooling, deep compiler knowledge.',
      value: 4,
    },
  ],
}

export const mockSkillSystemDesign: ISkillDetail = {
  id: SKILL_002,
  title: 'System Design',
  description: 'Ability to design scalable distributed systems.',
  category_id: CAT_001,
  category_title: 'Technical',
  levels: [
    {
      id: LVL_002_1,
      title: 'Beginner',
      description: 'Understands basic client-server architecture.',
      value: 1,
    },
    {
      id: LVL_002_2,
      title: 'Intermediate',
      description:
        'Designs moderately complex systems with caching and queues.',
      value: 2,
    },
    {
      id: LVL_002_3,
      title: 'Advanced',
      description:
        'Designs large-scale distributed systems with reliability patterns.',
      value: 3,
    },
  ],
}

export const mockSkillCommunication: ISkillDetail = {
  id: SKILL_003,
  title: 'Communication',
  description:
    'Ability to communicate clearly with technical and non-technical stakeholders.',
  category_id: CAT_002,
  category_title: 'Soft Skills',
  levels: [
    {
      id: LVL_003_1,
      title: 'Beginner',
      description: 'Can convey technical information to teammates.',
      value: 1,
    },
    {
      id: LVL_003_2,
      title: 'Intermediate',
      description:
        'Communicates effectively across teams and with stakeholders.',
      value: 2,
    },
    {
      id: LVL_003_3,
      title: 'Advanced',
      description:
        'Drives cross-functional alignment and influences strategic decisions.',
      value: 3,
    },
  ],
}

export const mockSkillDotNet: ISkillDetail = {
  id: SKILL_004,
  title: '.NET',
  description: 'Backend development with .NET and C#.',
  category_id: CAT_001,
  category_title: 'Technical',
  levels: [
    {
      id: LVL_004_1,
      title: 'Beginner',
      description: 'Writes basic C# code and understands the .NET runtime.',
      value: 1,
    },
    {
      id: LVL_004_2,
      title: 'Intermediate',
      description: 'Builds REST APIs with ASP.NET Core and Entity Framework.',
      value: 2,
    },
    {
      id: LVL_004_3,
      title: 'Advanced',
      description:
        'Architects multi-tier .NET applications with advanced patterns.',
      value: 3,
    },
    {
      id: LVL_004_4,
      title: 'Expert',
      description:
        'Deep knowledge of CLR internals, performance optimization, and platform expertise.',
      value: 4,
    },
  ],
}

export const mockSkillDetailsMap: Record<string, ISkillDetail> = {
  [SKILL_001]: mockSkillTypeScript,
  [SKILL_002]: mockSkillSystemDesign,
  [SKILL_003]: mockSkillCommunication,
  [SKILL_004]: mockSkillDotNet,
}

export const mockCareerPathDetailsMap: Record<string, ICareerPathDetail> = {
  [PATH_001]: mockCareerPathEngineering,
  [PATH_002]: mockCareerPathProduct,
}

export const mockCareerTrackDetailsMap: Record<string, ICareerTrackDetail> = {
  [TRACK_001]: mockCareerTrackBackend,
}

export const mockPositionDetailsMap: Record<string, IPositionDetail> = {
  [POS_001]: mockPositionJuniorBE,
  [POS_002]: mockPositionMidBE,
  [POS_003]: mockPositionSeniorBE,
}
