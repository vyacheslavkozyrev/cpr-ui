# CPR UI - Project Plan & Implementation Guide

**Project**: Continuous Performance Review - User Interface  
**Date**: October 15, 2025  
**Status**: Planning Phase  
**Backend API**: .NET 9, ASP.NET Core, PostgreSQL (Iteration 16 - Microsoft Entra External ID auth)

---

## Executive Summary

Building a modern React SPA to interface with the CPR REST API. The application will support continuous performance feedback, goal tracking, skills assessment, and team management across 5 user personas (Employee, People Manager, Solution Owner, Director, Administrator).

---

## Tech Stack

### Core Framework
- **React**: 18.3+ (latest stable)
- **TypeScript**: 5.x (strict mode enabled)
- **Build Tool**: Vite 5.x
- **Node**: v20 LTS
- **Package Manager**: Yarn

### UI Framework & Styling
- **Material UI (MUI)**: v6 (latest)
- **Theme**: Light/Dark mode with toggle
- **Icons**: @mui/icons-material
- **Layout**: Responsive, mobile-first

### State Management
- **Zustand**: Local/UI state (user info, theme, layout state)
- **React Query (TanStack Query)**: Server state, caching, mutations
- **Context API**: Authentication context

### Routing & Navigation
- **React Router**: v6
- **Route Guards**: Role-based access control (RBAC)
- **Protected Routes**: Authentication required

### Forms & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **MUI Integration**: Custom form components

### Data Management
- **API Client**: Auto-generated from OpenAPI/Swagger spec
- **HTTP Client**: Native Fetch API
- **Caching**: React Query (stale-while-revalidate)

### Authentication
- **MSAL.js**: Microsoft Authentication Library v3
- **Flow**: Redirect flow
- **Token Strategy**: Access token + refresh token
- **Provider**: Microsoft Entra External ID

### Data Tables
- **MUI DataGrid**: For listings, reports, team views

### Testing & Mocking
- **Vitest**: Unit tests (target: high coverage)
- **React Testing Library**: Component tests
- **MSW (Mock Service Worker)**: API mocking for tests AND development
  - Mock mode: Full offline development
  - Browser mocking: Service worker intercepts requests
  - Node mocking: For Vitest tests
- **Coverage Tool**: c8 or vitest coverage

### Development Modes
Three distinct development modes for flexible workflows:

1. **Mock Mode** (`yarn start:mock`)
   - MSW intercepts all API calls
   - No backend required - fully offline
   - Perfect for UI development
   - Consistent mock data

2. **Local Mode** (`yarn start:local`)
   - Connect to `http://localhost:5000/api`
   - Requires backend running
   - Uses stub authentication tokens
   - Real API integration

3. **Dev Mode** (`yarn start:dev`)
   - Connect to shared dev environment
   - Team collaboration
   - Real authentication (future)

See `DEV_MODES_STRATEGY.md` for detailed documentation.

### Code Quality
- **ESLint**: Code linting (Airbnb + React Hooks rules)
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **lint-staged**: Run linters on staged files

### Accessibility
- **Target**: WCAG 2.1 Level AA compliance
- **Tools**: axe-core, eslint-plugin-jsx-a11y
- **Testing**: Manual + automated a11y tests

---

## Project Structure (Layer-Based)

```
cpr-ui/
├── .vscode/                  # VS Code settings
├── documents/                # Project documentation (existing)
├── public/                   # Static assets
│   ├── favicon.ico
│   └── locales/              # i18n files (future)
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Generic components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Dialog/
│   │   │   ├── DataTable/
│   │   │   └── Loading/
│   │   ├── forms/            # Form components
│   │   │   ├── FormInput/
│   │   │   ├── FormSelect/
│   │   │   ├── FormDatePicker/
│   │   │   └── FormAutocomplete/
│   │   ├── layout/           # Layout components
│   │   │   ├── AppLayout/
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── NavigationMenu/
│   │   ├── goals/            # Goal-specific components
│   │   │   ├── GoalCard/
│   │   │   ├── GoalList/
│   │   │   ├── GoalForm/
│   │   │   └── GoalProgress/
│   │   ├── feedback/         # Feedback components
│   │   │   ├── FeedbackCard/
│   │   │   ├── FeedbackForm/
│   │   │   └── FeedbackList/
│   │   ├── skills/           # Skills components
│   │   │   ├── SkillAssessment/
│   │   │   ├── SkillMatrix/
│   │   │   └── SkillTree/
│   │   ├── team/             # Team components
│   │   │   ├── TeamMemberCard/
│   │   │   ├── TeamDashboard/
│   │   │   └── OrgChart/
│   │   └── dashboard/        # Dashboard widgets
│   │       ├── GoalSummary/
│   │       ├── FeedbackSummary/
│   │       ├── SkillProgress/
│   │       └── ActivityFeed/
│   ├── pages/                # Page components (route targets)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── CallbackPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── goals/
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── GoalDetailPage.tsx
│   │   │   └── GoalCreatePage.tsx
│   │   ├── feedback/
│   │   │   ├── FeedbackPage.tsx
│   │   │   ├── FeedbackRequestPage.tsx
│   │   │   └── FeedbackHistoryPage.tsx
│   │   ├── skills/
│   │   │   ├── SkillsPage.tsx
│   │   │   └── SkillAssessmentPage.tsx
│   │   ├── team/
│   │   │   ├── TeamPage.tsx
│   │   │   └── TeamMemberPage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   ├── admin/
│   │   │   ├── TaxonomyPage.tsx
│   │   │   └── UsersPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/             # API services & business logic
│   │   ├── api/
│   │   │   ├── client.ts     # Base API client (fetch wrapper)
│   │   │   ├── generated/    # OpenAPI generated code
│   │   │   └── interceptors.ts
│   │   ├── auth/
│   │   │   ├── msalConfig.ts
│   │   │   ├── authService.ts
│   │   │   └── tokenService.ts
│   │   ├── goals/
│   │   │   └── goalsService.ts
│   │   ├── feedback/
│   │   │   └── feedbackService.ts
│   │   ├── skills/
│   │   │   └── skillsService.ts
│   │   └── team/
│   │       └── teamService.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCurrentUser.ts
│   │   ├── useTheme.ts
│   │   ├── usePermissions.ts
│   │   ├── useGoals.ts       # React Query hooks
│   │   ├── useFeedback.ts
│   │   ├── useSkills.ts
│   │   ├── useTeam.ts
│   │   └── useDebounce.ts
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts      # Current user, auth state
│   │   ├── themeStore.ts     # Light/dark mode
│   │   └── layoutStore.ts    # Sidebar open/closed, etc.
│   ├── types/                # TypeScript type definitions
│   │   ├── api.types.ts      # API response types
│   │   ├── user.types.ts
│   │   ├── goal.types.ts
│   │   ├── feedback.types.ts
│   │   ├── skill.types.ts
│   │   └── team.types.ts
│   ├── utils/                # Utility functions
│   │   ├── date.ts           # Date formatting
│   │   ├── validation.ts     # Custom validators
│   │   ├── formatting.ts     # Text/number formatting
│   │   ├── constants.ts      # App constants
│   │   └── helpers.ts
│   ├── routes/               # Route configuration
│   │   ├── index.tsx         # Route definitions
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   ├── config/               # App configuration
│   │   ├── env.ts            # Environment variables
│   │   └── queryClient.ts    # React Query config
│   ├── theme/                # MUI theme configuration
│   │   ├── index.ts
│   │   ├── palette.ts
│   │   ├── typography.ts
│   │   └── components.ts     # Component overrides
│   ├── assets/               # Images, fonts, etc.
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts         # Vite type definitions
├── mocks/                    # MSW - Mock Service Worker
│   ├── browser.ts            # Browser MSW setup
│   ├── server.ts             # Node MSW setup (tests)
│   ├── handlers/             # Request handlers by feature
│   │   ├── index.ts          # Combined handlers
│   │   ├── auth.handlers.ts
│   │   ├── goals.handlers.ts
│   │   ├── feedback.handlers.ts
│   │   ├── skills.handlers.ts
│   │   ├── team.handlers.ts
│   │   └── admin.handlers.ts
│   ├── data/                 # Mock data fixtures
│   │   ├── users.ts
│   │   ├── goals.ts
│   │   ├── feedback.ts
│   │   ├── skills.ts
│   │   └── taxonomy.ts
│   └── utils/                # Mock utilities
│       ├── response.ts       # Response helpers
│       ├── pagination.ts     # Pagination helpers
│       └── delay.ts          # Realistic delays
├── tests/
│   ├── setup.ts              # Test setup & global mocks
│   └── utils/                # Test utilities
│       └── renderWithProviders.tsx
├── .env.development          # Dev environment variables
├── .env.production           # Prod environment variables
├── .eslintrc.json            # ESLint config
├── .prettierrc               # Prettier config
├── tsconfig.json             # TypeScript config
├── tsconfig.node.json        # TypeScript config for Vite
├── vite.config.ts            # Vite configuration
├── package.json
├── yarn.lock
└── README.md
```

---

## Key Features by User Persona

### 1. Employee (Jane Smith - Senior Software Engineer)
**Pages**: Dashboard, Goals, Feedback, Skills, Profile

**Dashboard Widgets**:
- Active goals progress (cards/chart)
- Recent feedback received
- Skill level overview
- Upcoming deadlines
- Activity feed

**Goals Management**:
- Create/edit/delete personal goals
- Link goals to skills/skill levels
- Add tasks to goals
- Track progress (% complete)
- Archive completed goals

**Skills**:
- View skills taxonomy (career paths, tracks, positions)
- Self-assessment (rate current skill levels)
- View skill gaps vs. target position
- Skills matrix visualization

**Feedback**:
- Request feedback (select goal, select people)
- View received feedback
- View feedback requests (pending/completed)

### 2. People Manager (Peter Morrison - Principal)
**Pages**: All Employee pages + Team, Team Member Details

**Team Dashboard**:
- Team members list/cards
- Team goals overview
- Skill matrix for team
- Feedback requests pending
- Performance indicators

**Team Member View**:
- View reporter's goals
- View reporter's skill levels
- View feedback for reporter
- Suggest/assign goals

### 3. Director (Tim Goldman)
**Pages**: All Manager pages + Organization Views

**Organization Views**:
- Department-level reports
- Promotion-ready candidates
- Performance review approvals
- Calibration tools

### 4. Solution Owner (Catherine Lumber)
**Pages**: All Manager pages + Project Management

**Project Management**:
- View team skills
- Staffing decisions
- Backlog prioritization
- Team growth tracking

### 5. Administrator (Steve Miller - HR Manager)
**Pages**: All above + Admin Panel

**Admin Panel**:
- Taxonomy management (CRUD for career paths, tracks, positions, skills)
- User management
- Role assignments
- System reports

---

## Implementation Phases

### **Phase 0: Project Setup** (Week 1)
**Goal**: Bootstrap project, configure tooling, establish development workflow

**Tasks**:
1. ✅ Initialize Vite + React + TypeScript project
2. ✅ Configure Yarn workspace
3. ✅ Setup ESLint + Prettier + Husky
4. ✅ Configure TypeScript (strict mode, path aliases)
5. ✅ Setup folder structure
6. ✅ Configure VS Code settings
7. ✅ Install core dependencies
8. ✅ Create base README with setup instructions
9. ✅ Configure environment variables structure

**Deliverables**:
- Running Vite dev server
- Linting/formatting working
- Git hooks functional
- Clean project structure

---

### **Phase 1: Core Infrastructure** (Week 2)
**Goal**: Authentication, routing, theming, API client

**Tasks**:
1. ✅ Setup MUI v6 theme provider
2. ✅ Implement light/dark theme toggle (Zustand store)
3. ✅ Configure MSAL for Microsoft Entra External ID
4. ✅ Create authentication service
5. ✅ Setup React Query with configuration
6. ✅ Generate OpenAPI client from backend Swagger
7. ✅ Create base API client with interceptors (auth token, error handling)
8. ✅ Setup React Router with route definitions
9. ✅ Create ProtectedRoute and RoleGuard components
10. ✅ Build basic layout (AppLayout, Header, Sidebar, Footer)

**Deliverables**:
- Working authentication flow (login/logout)
- Protected routes with role guards
- Theme toggle functional
- API client ready for use
- Basic navigation structure

---

### **Phase 2: Common Components & Patterns** (Week 3)
**Goal**: Build reusable component library

**Tasks**:
1. ✅ Create common components (Button, Card, Dialog, Loading, etc.)
2. ✅ Build form components (FormInput, FormSelect, FormDatePicker, etc.)
3. ✅ Create DataTable wrapper around MUI DataGrid
4. ✅ Build error boundary component
5. ✅ Create notification/toast system
6. ✅ Build page layouts (PageHeader, PageContainer)
7. ✅ Setup testing utilities (renderWithProviders)
8. ✅ Write tests for common components
9. ✅ Create Storybook stories (optional, but useful)

**Deliverables**:
- Component library ready for feature development
- Consistent UI patterns established
- Test coverage for common components

---

### **Phase 3: User Profile & Dashboard** (Week 4)
**Goal**: Implement user profile and main dashboard

**Tasks**:
1. ✅ Build ProfilePage (view/edit user info)
2. ✅ Create dashboard widgets (GoalSummary, FeedbackSummary, SkillProgress)
3. ✅ Implement DashboardPage layout
4. ✅ Create useCurrentUser hook (fetch /api/me)
5. ✅ Build activity feed component
6. ✅ Implement responsive dashboard grid
7. ✅ Add loading states and error handling
8. ✅ Write tests for dashboard components

**Deliverables**:
- Functional user profile page
- Dashboard with multiple widgets
- Current user context available app-wide

---

### **Phase 4: Goals Management** (Week 5-6)
**Goal**: Full CRUD for goals, tasks, and progress tracking

**Tasks**:
1. ✅ Create GoalsPage (list view with filters)
2. ✅ Build GoalCard component
3. ✅ Implement GoalForm (create/edit)
4. ✅ Create GoalDetailPage (view goal, tasks, progress)
5. ✅ Build task management (add/edit/complete tasks)
6. ✅ Implement goal progress visualization
7. ✅ Add goal filtering (status, deadline, skill)
8. ✅ Create useGoals hook (React Query)
9. ✅ Implement goal archive functionality
10. ✅ Add SMART goal suggestions (future: AI integration)
11. ✅ Write comprehensive tests

**Deliverables**:
- Complete goals management feature
- CRUD operations functional
- Progress tracking working
- Test coverage ≥80%

---

### **Phase 5: Skills & Self-Assessment** (Week 7)
**Goal**: Skills taxonomy browsing and self-assessment

**Tasks**:
1. ✅ Create SkillsPage (browse taxonomy)
2. ✅ Build SkillTree component (career paths → tracks → positions)
3. ✅ Implement SkillMatrix visualization
4. ✅ Create SkillAssessmentPage (self-rate skills)
5. ✅ Build skill gap analysis view
6. ✅ Add skill level indicators
7. ✅ Create useSkills hook
8. ✅ Implement position comparison view
9. ✅ Write tests

**Deliverables**:
- Skills taxonomy browsable
- Self-assessment functional
- Skill gaps visualized

---

### **Phase 6: Feedback System** (Week 8-9)
**Goal**: Request, submit, and view feedback

**Tasks**:
1. ✅ Create FeedbackPage (view received feedback)
2. ✅ Build FeedbackRequestPage (request feedback flow)
3. ✅ Implement FeedbackForm (submit feedback)
4. ✅ Create FeedbackCard component
5. ✅ Build feedback filtering (by goal, date, rating)
6. ✅ Implement FeedbackHistoryPage
7. ✅ Add "Feedback To-Do" list (requests to respond to)
8. ✅ Create useFeedback hook
9. ✅ Add feedback analytics (ratings distribution)
10. ✅ Write tests

**Deliverables**:
- Complete feedback request flow
- Feedback submission working
- Feedback history viewable

---

### **Phase 7: Team Management (Manager Features)** (Week 10-11)
**Goal**: Manager views for team oversight

**Tasks**:
1. ✅ Create TeamPage (team members list)
2. ✅ Build TeamMemberCard component
3. ✅ Implement TeamMemberPage (detail view for reporter)
4. ✅ Create team dashboard with widgets
5. ✅ Build team goals view
6. ✅ Implement team skills matrix
7. ✅ Add manager-specific actions (suggest goals, view feedback)
8. ✅ Create useTeam hook
9. ✅ Implement role-based UI (show/hide manager features)
10. ✅ Write tests

**Deliverables**:
- Manager dashboard functional
- Team member details accessible
- Team-level views working

---

### **Phase 8: Admin Panel (Taxonomy Management)** (Week 12-13)
**Goal**: CRUD operations for career paths, tracks, positions, skills

**Tasks**:
1. ✅ Create AdminLayout
2. ✅ Build TaxonomyPage (tabs for each entity type)
3. ✅ Implement CRUD forms for:
   - Career Paths
   - Career Tracks
   - Positions
   - Skill Categories
   - Skills
   - Skill Levels
4. ✅ Add position-to-skill mapping interface
5. ✅ Create admin DataTables with inline editing
6. ✅ Implement soft-delete confirmation dialogs
7. ✅ Add admin-only route guards
8. ✅ Write tests

**Deliverables**:
- Admin panel functional
- Taxonomy CRUD working
- Administrator role enforced

---

### **Phase 9: Polish & Optimization** (Week 14)
**Goal**: Performance, accessibility, UX improvements

**Tasks**:
1. ✅ Audit and optimize React Query caching
2. ✅ Implement code splitting (React.lazy)
3. ✅ Add loading skeletons everywhere
4. ✅ Run accessibility audit (axe-core)
5. ✅ Fix WCAG AA violations
6. ✅ Add keyboard navigation support
7. ✅ Optimize bundle size (analyze with rollup-plugin-visualizer)
8. ✅ Add error tracking (Sentry or similar)
9. ✅ Implement offline detection
10. ✅ Add PWA support (optional)

**Deliverables**:
- Performance optimized
- WCAG AA compliant
- Production-ready build

---

### **Phase 10: Testing & Documentation** (Week 15)
**Goal**: Comprehensive testing and documentation

**Tasks**:
1. ✅ Achieve ≥80% test coverage
2. ✅ Write integration tests for critical flows
3. ✅ Document all components (JSDoc)
4. ✅ Create user guide
5. ✅ Write developer documentation
6. ✅ Create deployment guide
7. ✅ Record demo videos (optional)

**Deliverables**:
- High test coverage
- Complete documentation
- Deployment ready

---

## 🔧 Development Workflow

### Daily Workflow
1. Pull latest from `main`
2. Create feature branch: `feature/goals-list-page`
3. **Choose development mode**:
   - `yarn start:mock` - UI-only work, no backend needed
   - `yarn start:local` - Full-stack development with local API
   - `yarn start:dev` - Integration testing with dev environment
4. Develop feature
5. Write tests (MSW automatically mocks API in tests)
6. Run linter + tests locally
7. Commit with conventional commit message
8. Push and create PR
9. Code review
10. Merge to `main`

### Commit Message Convention
```
feat: add goal creation form
fix: correct date formatting in goal card
chore: update dependencies
docs: add API service documentation
test: add tests for feedback components
refactor: simplify dashboard layout logic
```

### Code Review Checklist
- [ ] Tests written and passing
- [ ] TypeScript strict mode compliant
- [ ] ESLint/Prettier passing
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] No console.log statements

---

## Environment Variables

### `.env.mock` (Mock Mode - MSW)
```env
# Mode
VITE_API_MODE=mock
VITE_USE_MSW=true

# API (intercepted by MSW)
VITE_API_BASE_URL=http://localhost:5173/api

# App
VITE_APP_NAME=CPR - Continuous Performance Review (Mock)
VITE_APP_VERSION=1.0.0
```

### `.env.local` (Local Development)
```env
# Mode
VITE_API_MODE=local
VITE_USE_MSW=false

# API
VITE_API_BASE_URL=http://localhost:5000/api

# Authentication (Stub Token)
VITE_AUTH_MODE=stub
VITE_STUB_TOKEN=your-stub-token-here  # Get from backend scripts

# App
VITE_APP_NAME=CPR - Continuous Performance Review (Local)
VITE_APP_VERSION=1.0.0
```

### `.env.development` (Dev Environment)
```env
# Mode
VITE_API_MODE=dev
VITE_USE_MSW=false

# API
VITE_API_BASE_URL=https://api-dev.cpr.com/api  # TBD

# Authentication (Future: Real Entra)
VITE_AUTH_MODE=entra
# VITE_MSAL_CLIENT_ID=your-client-id
# VITE_MSAL_TENANT_ID=your-tenant-id
# VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
# VITE_MSAL_REDIRECT_URI=https://app-dev.cpr.com/auth/callback

# App
VITE_APP_NAME=CPR - Continuous Performance Review (Dev)
VITE_APP_VERSION=1.0.0
```

### `.env.production`
```env
# Mode
VITE_API_MODE=production
VITE_USE_MSW=false

# API
VITE_API_BASE_URL=https://api.cpr-prod.com/api

# Authentication (Real Entra)
VITE_AUTH_MODE=entra
VITE_MSAL_CLIENT_ID=prod-client-id
VITE_MSAL_TENANT_ID=prod-tenant-id
VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/prod-tenant-id
VITE_MSAL_REDIRECT_URI=https://app.cpr-prod.com/auth/callback

# App
VITE_APP_NAME=CPR - Continuous Performance Review
VITE_APP_VERSION=1.0.0
```

**Note**: For local development, obtain stub tokens by running backend scripts:
- `run-api-as-employee.cmd` - Eve Adams (Employee role)
- `run-api-as-manager.cmd` - Henry Wilson (Manager role)

See `documents/users.md` for complete list of test users.

---

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@mui/material": "^6.1.0",
    "@mui/icons-material": "^6.1.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-query-devtools": "^5.56.0",
    "zustand": "^4.5.5",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    "@azure/msal-browser": "^3.24.0",
    "@azure/msal-react": "^2.1.0",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.3",
    "typescript": "^5.5.4",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.2",
    "msw": "^2.4.5",
    "eslint": "^8.57.0",
    "eslint-config-airbnb": "^19.0.4",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-jsx-a11y": "^6.10.0",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "prettier": "^3.3.3",
    "husky": "^9.1.5",
    "lint-staged": "^15.2.10",
    "openapi-typescript-codegen": "^0.29.0"
  }
}
```

---

## Next Steps

1. **Review and approve this plan**
2. **Start Phase 0: Project Setup**
3. **Generate initial project structure**
4. **Setup authentication with MSAL**
5. **Begin building core features**

---

## Open Questions

1. **API Base URL**: What is the current backend API URL for development?
2. **Entra External ID**: Do you have the Client ID and Tenant ID from Phase 1 completion?
3. **OpenAPI Spec**: Where can we access the Swagger JSON? (e.g., `http://localhost:5000/swagger/v1/swagger.json`)
4. **Logo/Branding**: Do you have any logo files or will we use text-only branding?
5. **Permissions Matrix**: Should we create a detailed RBAC matrix for UI feature visibility?

---

**Ready to proceed?** Let me know if you'd like to adjust anything in this plan, or we can start with Phase 0! 🚀
