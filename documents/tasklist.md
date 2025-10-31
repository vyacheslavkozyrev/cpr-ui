# CPR UI Implementation Tasklist

## Project Overview

**Timeline**: 15 weeks (Phases 0-9)  
**Tech Stack**: React 18.3+, TypeScript 5.x, Vite 5.x, MUI v6, Zustand, React Query  
**Development Modes**: Mock (MSW), Local (localhost:5000), Dev (shared env)

## 🎉 Recent Progress (October 30, 2025)

**Major Accomplishments:**

- ✅ **Complete User Profile System**: View/edit functionality with React Hook Form
- ✅ **Toast Notification System**: Migrated from Context to Zustand with proper error handling
- ✅ **Clean Architecture**: API/DTO/Model separation with proper error propagation
- ✅ **Azure AD Integration**: Real user data from /me endpoint with avatar display
- ✅ **Settings Page**: Complete settings interface with theme preferences and navigation
- ✅ **Testing Infrastructure**: Comprehensive positive & negative test coverage including full dashboard widget test suite
- ✅ **Type Safety**: Eliminated all 'any' types, strict TypeScript compliance
- ✅ **Code Quality**: Structured logging system, zero console warnings
- ✅ **MSW Browser Setup**: Cross-environment compatibility for testing
- ✅ **Dashboard Widget Testing**: Complete test coverage for all 4 dashboard widgets with Chart.js integration
- ✅ **Advanced Test Infrastructure**: MSW v2, Chart.js mocking, TypeScript interface compliance patterns

**Current Status**: Phase 3 is 100% COMPLETE! All dashboard widget tests passing (83/83 tests). Ready for Phase 4 development.

---

## **Phase 0: Project Setup** (Week 1) ✅ COMPLETE

### Goal

Initialize project with complete tooling and folder structure

### Implementation Tasks

- [x] Initialize Vite project: `yarn create vite . --template react-ts`
- [x] Configure Yarn as package manager
- [x] Setup ESLint with Airbnb config + React Hooks plugin
- [x] Configure Prettier with consistent formatting rules
- [x] Setup Husky pre-commit hooks + lint-staged
- [x] Configure TypeScript strict mode with path aliases (@/)
- [x] Create complete folder structure (components, pages, services, hooks, store, types, utils, routes, config, theme, assets, tests, mocks)
- [x] Configure VS Code settings and recommended extensions
- [x] Install all core dependencies (MUI v6, React Router, React Query, Zustand, MSAL, React Hook Form, Zod, date-fns)
- [x] Install dev dependencies (testing libraries, MSW, linting tools)
- [x] Create environment variable files (.env.mock, .env.localapi, .env.development)
- [x] Configure package.json scripts for three run modes (start:mock, start:local, start:dev)
- [x] Create README with setup instructions
- [x] Test all three development modes work

### Acceptance Criteria

- [x] Project builds without errors
- [x] All linting rules pass
- [x] Three development modes functional
- [x] Folder structure matches documentation

---

## **Phase 1: Core Infrastructure** ✅ COMPLETED (October 24, 2025)

### Goal

Authentication, routing, theming, and API foundation

### Implementation Tasks

- [x] Setup MUI v6 theme system with design tokens
- [x] Implement light/dark mode toggle with Zustand persistence
- [x] Configure MSAL.js v3 for future Entra ID integration
- [x] Create authentication service with stub token support
- [x] Setup React Query with proper configuration and devtools
- [x] Generate OpenAPI TypeScript client from Swagger spec
- [x] Create base API client with axios interceptors
- [x] Setup React Router v6 with protected routes
- [x] Create ProtectedRoute component with loading states
- [x] Build RoleGuard component for RBAC (Employee, Manager, Director, Admin)
- [x] Create basic layout components (AppLayout, Header, Sidebar, Footer)
- [x] Setup authentication context and hooks
- [x] Implement route guards and redirects
- [x] Add error boundaries for route-level error handling
- [x] Test authentication flow with stub tokens

### Acceptance Criteria ✅

- ✅ Authentication working with stub tokens (multiple user roles tested)
- ✅ Routing functional with protection (all routes protected, redirects working)
- ✅ Theme system operational (light/dark toggle with persistence)
- ✅ API client ready for use (infrastructure configured and tested)

---

## **Phase 2: User Management & Foundation** (Week 3)

### Goal

User profile management, settings, internationalization, and testing foundation

### Implementation Tasks

**User Profile & Settings:**

- [x] Implement /me API call integration with React Query ✅ (Oct 27)
- [x] Update Header component to show real user information from /me API ✅ (Oct 27)
- [x] Create ProfilePage with view/edit modes for user information ✅ (Oct 27)
- [x] Build profile form with validation (React Hook Form integration) ✅ (Oct 27)
- [x] Create SettingsPage with theme and language preferences ✅ (Oct 27)
- [x] Implement user avatar component with initials fallback ✅ (Oct 27)
- [ ] Integrate actual Azure AD photos via Microsoft Graph API ⏸️ (Deferred to future phase)

**Internationalization (i18n):**

- [x] Setup i18next with React integration ✅ (Oct 27)
- [x] Create language files structure (en, es, fr, be) ✅ (Oct 27)
- [x] Add language selector in settings ✅ (Oct 27)
- [x] Internationalize all existing text (navigation, forms, buttons, messages) ✅ (Oct 27)
- [x] Setup date/time localization with date-fns ✅ (Oct 27)

**Notification System:**

- [x] Create notification/toast system with Zustand state management ✅ (Oct 27)
- [x] Build Toast component with different severity levels (error, warning, success, info) ✅ (Oct 27)
- [x] Integrate notification system with form validation and API errors ✅ (Oct 27)
- [x] Add notification positioning and auto-dismiss functionality ✅ (Oct 27)
- [x] Create useToast hook for easy toast triggering ✅ (Oct 27)
- [x] Fix infinite loop issues with Zustand selectors ✅ (Oct 27)

**Testing Foundation:**

- [x] Setup testing utilities (renderWithProviders, test wrappers) ✅
- [x] Create mock data generators for testing ✅
- [x] Write comprehensive tests for authentication flow ✅
- [x] Add tests for routing and protected routes ✅
- [x] Test theme switching functionality ✅
- [x] Add tests for user profile and settings components ✅ (Oct 28)
- [x] Setup MSW handlers for /me API endpoint ✅
- [x] Add tests for notification system ✅

**API Integration:**

- [x] Create useCurrentUser hook with React Query ✅ (Oct 27)
- [x] Implement user service with CRUD operations ✅ (Oct 27)
- [x] Add proper error handling for API failures (proper error propagation) ✅ (Oct 27)
- [x] Setup loading states for user data ✅ (Oct 27)
- [x] Implement clean API/DTO/Model architecture separation ✅ (Oct 27)
- [x] Create API services layer in /services/api/ ✅ (Oct 27)

### Acceptance Criteria

- ✅ /me API integrated with real user data in header ✅ (Oct 27)
- ✅ User can view and edit profile information ✅ (Oct 27)
- ✅ Settings page functional with theme switching ✅ (Oct 27)
- ✅ Internationalization working with 4 languages (en, es, fr, be) ✅ (Oct 27)
- ✅ Notification system working with API error handling ✅ (Oct 27)
- ✅ Testing utilities ready for feature development ✅ (Oct 28)
- ✅ All user-related components tested ✅ (Oct 28)

**Phase 2 Status: 100% COMPLETE** ✅

- **Completed**: User Profile System, Toast Notifications, API Architecture, Settings Page, Internationalization (4 languages), Comprehensive Testing Infrastructure
- **Strategic Decision**: Azure AD photo integration deferred to later phase

---

## **Phase 3: Dashboard & Enhanced Features** ✅ COMPLETED (October 30, 2025)

### Goal

Main dashboard implementation and enhanced user experience features - **FOCUS: Testing Infrastructure**

### Implementation Tasks

**Dashboard Development:**

- [x] Create ProfilePage with view/edit modes ✅ (Oct 27)
- [x] Build profile form with validation (React Hook Form) ✅ (Oct 27)
- [x] **Complete Dashboard Widget Test Suite**: All 4 widgets fully tested ✅ (Oct 30)
  - [x] GoalSummaryWidget: 7/7 tests passing with Chart.js Line chart integration ✅
  - [x] FeedbackSummaryWidget: 7/7 tests passing with rating system and feedback data ✅
  - [x] SkillProgressWidget: 8/8 tests passing with Doughnut chart and ISkillsSummary interface ✅
  - [x] ActivityFeedWidget: 9/9 tests passing with IActivityFeed interface and timeline ✅
- [x] Build useCurrentUser hook with React Query ✅ (Oct 27)
- [x] Create user avatar component with fallback initials ✅ (Oct 27)
- [x] **Advanced Testing Infrastructure**: MSW v2, Chart.js mocking, TypeScript compliance ✅ (Oct 30)
- [x] **Foundation Testing**: Authentication, Header, Theme, Profile, Settings components ✅ (Oct 30)
- [x] Add loading states and error handling for all widgets ✅ (Oct 30)
- [x] Write comprehensive tests for dashboard components ✅ (Oct 30)
- [x] Add accessibility features (ARIA labels, keyboard navigation) ✅ (Oct 30)
- [ ] Implement DashboardPage with responsive grid layout (Deferred to Phase 4)
- [ ] Implement activity feed with timeline component (Deferred to Phase 4)
- [ ] Add dashboard customization (widget visibility toggles) (Deferred to Phase 4)
- [ ] Create responsive dashboard grid with drag-and-drop (future)
- [ ] Build user statistics cards (goals completed, feedback received, skills assessed) (Deferred to Phase 4)
- [ ] Implement breadcrumb navigation (Deferred to Phase 4)

**Enhanced Testing Infrastructure (Primary Focus):**

- [x] Setup comprehensive test utilities (renderWithProviders, renderWithUser, renderWithLanguage) ✅ (Oct 30)
- [x] Implement MSW v2 with HttpResponse pattern for reliable API mocking ✅ (Oct 30)
- [x] Create Chart.js mocking system supporting Line, Doughnut, Bar, Radar charts ✅ (Oct 30)
- [x] Establish TypeScript interface compliance testing patterns ✅ (Oct 30)
- [x] Build Material-UI component testing methodology ✅ (Oct 30)
- [x] Create systematic test-fixing methodology proven across all widgets ✅ (Oct 30)
- [x] Implement React Query integration testing patterns ✅ (Oct 30)
- [x] Establish error handling and loading state testing standards ✅ (Oct 30)

**Enhanced Internationalization (i18n):**

- [x] Setup i18next with React integration ✅ (Oct 27 - Phase 2)
- [x] Create language files structure (en, es, fr, be) ✅ (Oct 27 - Phase 2)
- [x] Add language selector in settings ✅ (Oct 27 - Phase 2)
- [x] Internationalize all existing text (navigation, forms, buttons, messages) ✅ (Oct 27 - Phase 2)
- [x] Setup date/time localization with date-fns ✅ (Oct 27 - Phase 2)
- [x] Validate i18n integration in comprehensive test suite ✅ (Oct 30)

### Acceptance Criteria

- ✅ **Complete Test Infrastructure**: 10 test files, 83 tests, 100% passing
- ✅ **Dashboard Widget Testing**: All 4 widgets (Goals, Feedback, Skills, Activity) fully tested
- ✅ **MSW v2 Integration**: Reliable API mocking with HttpResponse pattern
- ✅ **Chart.js Mocking**: Complete support for Line, Doughnut, Bar, Radar charts
- ✅ **TypeScript Compliance**: Interface compliance testing for ISkillsSummary, IActivityFeed
- ✅ **Error Handling**: Comprehensive error state testing across all components
- ✅ **Loading States**: Proper loading state validation in all widgets
- ✅ **Future-Proof Architecture**: Scalable testing patterns for ongoing development

**Phase 3 Status: 100% COMPLETE** ✅

- **Strategic Focus**: Established robust testing infrastructure instead of UI implementation
- **Achievement**: Complete dashboard widget test coverage with advanced mocking systems
- **Ready For**: Phase 4 Goals Management with proven testing methodology

---

## **Phase 4: Goals Management** (Week 5-6)

### Goal

Complete CRUD for goals, tasks, and progress tracking

### Implementation Tasks

- [ ] Create GoalsPage with list view and filtering options
- [ ] Build GoalCard component with status indicators
- [ ] Implement GoalForm for create/edit with SMART goal validation
- [ ] Create GoalDetailPage with tasks and progress visualization
- [ ] Build task management (add, edit, complete, delete tasks)
- [ ] Implement goal progress calculation and visualization (progress bars, charts)
- [ ] Add goal filtering (status: active/completed/archived, deadline, skill category)
- [ ] Create goal search functionality
- [ ] Build goal archive/unarchive functionality
- [ ] Implement goal deadline notifications and overdue indicators
- [ ] Create useGoals hook with React Query (CRUD operations)
- [ ] Add goal templates and SMART goal suggestions
- [ ] Build goal hierarchy support (parent/child goals)
- [ ] Implement goal sharing and collaboration features
- [ ] Add goal analytics (completion rates, time tracking)
- [ ] Write comprehensive tests for all goal components
- [ ] Add bulk operations (archive multiple, assign to team)

### Acceptance Criteria

- Full CRUD operations working
- Progress tracking functional
- Filtering and search working
- Test coverage ≥80%

---

## **Phase 5: Skills & Self-Assessment** (Week 7)

### Goal

Skills taxonomy browsing and self-assessment

### Implementation Tasks

- [ ] Create SkillsPage with taxonomy browser
- [ ] Build SkillTree component (career paths → tracks → positions hierarchy)
- [ ] Implement SkillMatrix visualization with heat map
- [ ] Create SkillAssessmentPage with rating interface
- [ ] Build skill gap analysis with visual indicators
- [ ] Add skill level indicators (Beginner, Intermediate, Advanced, Expert)
- [ ] Create useSkills hook with taxonomy data fetching
- [ ] Implement position comparison view (current vs target)
- [ ] Build skill search and filtering
- [ ] Add skill recommendations based on career path
- [ ] Create skill progress tracking over time
- [ ] Implement skill endorsements from colleagues (future)
- [ ] Build skill-based goal suggestions
- [ ] Add skill export functionality (PDF/CSV)
- [ ] Write tests for skills components
- [ ] Add accessibility for skill matrix navigation

### Acceptance Criteria

- Skills taxonomy browsable and searchable
- Self-assessment functional with persistence
- Skill gaps clearly visualized
- Position comparison working

---

## **Phase 6: Feedback System** (Week 8-9)

### Goal

Request, submit, and view feedback

### Implementation Tasks

- [ ] Create FeedbackPage with received feedback list
- [ ] Build FeedbackRequestPage with multi-step wizard
- [ ] Implement FeedbackForm with rating scales and comments
- [ ] Create FeedbackCard component with rating visualization
- [ ] Build feedback filtering (by goal, date range, rating, feedback type)
- [ ] Implement FeedbackHistoryPage with timeline view
- [ ] Add "Feedback To-Do" list for pending requests
- [ ] Create useFeedback hook with CRUD operations
- [ ] Build feedback analytics dashboard (ratings distribution, trends)
- [ ] Implement feedback templates for common scenarios
- [ ] Add feedback reminder system
- [ ] Create feedback export functionality
- [ ] Build anonymous feedback option
- [ ] Implement feedback approval workflow (manager review)
- [ ] Add feedback categories (goal-related, general, peer, manager)
- [ ] Write comprehensive tests for feedback flow
- [ ] Add email notifications for feedback requests

### Acceptance Criteria

- Complete feedback request flow functional
- Feedback submission and viewing working
- Analytics providing insights
- Notification system operational

---

## **Phase 7: Team Management (Manager Features)** (Week 10-11)

### Goal

Manager views for team oversight

### Implementation Tasks

- [ ] Create TeamPage with team members list and search
- [ ] Build TeamMemberCard with quick stats and actions
- [ ] Implement TeamMemberPage with detailed reporter view
- [ ] Create team dashboard with aggregated widgets
- [ ] Build team goals view with progress rollup
- [ ] Implement team skills matrix with gap analysis
- [ ] Add manager-specific actions (suggest goals, review feedback, approve requests)
- [ ] Create useTeam hook with team data management
- [ ] Implement role-based UI components (show/hide based on permissions)
- [ ] Build team analytics (goal completion rates, skill distribution, feedback trends)
- [ ] Add team member comparison views
- [ ] Create team reports and export functionality
- [ ] Implement 1-on-1 meeting notes integration
- [ ] Build team calendar with goal deadlines
- [ ] Add team skill development recommendations
- [ ] Write tests for all manager features
- [ ] Add manager training and onboarding flows

### Acceptance Criteria

- Manager dashboard functional with team insights
- Team member details accessible
- Team-level analytics working
- Role-based access enforced

---

## **Phase 8: Admin Panel (Taxonomy Management)** (Week 12-13)

### Goal

CRUD operations for career paths, tracks, positions, skills

### Implementation Tasks

- [ ] Create AdminLayout with dedicated navigation
- [ ] Build TaxonomyPage with tabbed interface
- [ ] Implement CRUD forms for Career Paths (create, edit, archive)
- [ ] Build CRUD forms for Career Tracks with path association
- [ ] Create CRUD forms for Positions with track mapping
- [ ] Implement CRUD forms for Skill Categories with hierarchy
- [ ] Build CRUD forms for Skills with category assignment
- [ ] Create CRUD forms for Skill Levels with competency definitions
- [ ] Add position-to-skill mapping interface with skill requirements
- [ ] Create admin DataTables with inline editing and bulk operations
- [ ] Implement soft-delete confirmation dialogs with impact analysis
- [ ] Add admin-only route guards and permission checks
- [ ] Build taxonomy import/export functionality (CSV/Excel)
- [ ] Create taxonomy validation and integrity checks
- [ ] Add audit logging for admin actions
- [ ] Implement taxonomy versioning and rollback
- [ ] Write comprehensive tests for admin functionality
- [ ] Add admin analytics and usage reports

### Acceptance Criteria

- All taxonomy CRUD operations functional
- Data integrity maintained
- Administrator role properly enforced
- Import/export working

---

## **Phase 9: Polish & Optimization** (Week 14)

### Goal

Performance, accessibility, UX improvements

### Implementation Tasks

- [ ] Audit and optimize React Query caching strategies
- [ ] Implement code splitting with React.lazy for all major routes
- [ ] Add loading skeletons for all data loading states
- [ ] Run comprehensive accessibility audit using axe-core
- [ ] Fix all WCAG 2.1 AA violations
- [ ] Add complete keyboard navigation support
- [ ] Optimize bundle size using rollup-plugin-visualizer
- [ ] Implement error tracking with Sentry or similar service
- [ ] Add offline detection and graceful degradation
- [ ] Implement PWA support with service worker (optional)
- [ ] Add performance monitoring and Core Web Vitals tracking
- [ ] Optimize images and assets (compression, lazy loading)
- [ ] Implement virtual scrolling for large data sets
- [ ] Add search debouncing and optimization
- [ ] Create comprehensive error pages (404, 500, network error)
- [ ] Add print stylesheets for reports
- [ ] Implement browser compatibility testing

### Acceptance Criteria

- Performance metrics meet targets
- WCAG 2.1 AA compliance achieved
- Bundle size optimized
- Error tracking operational

---

## **Phase 10: Testing & Documentation** (Week 15)

### Goal

Comprehensive testing and documentation

### Implementation Tasks

- [ ] Achieve ≥80% test coverage across all components
- [ ] Write integration tests for critical user flows
- [ ] Create end-to-end tests for main scenarios
- [ ] Add performance regression tests
- [ ] Document all components with comprehensive JSDoc
- [ ] Create user guide with screenshots and workflows
- [ ] Write developer documentation (contributing, architecture, patterns)
- [ ] Create deployment guide with environment setup
- [ ] Document API integration patterns
- [ ] Create troubleshooting guide
- [ ] Add code examples and best practices documentation
- [ ] Create component showcase with Storybook
- [ ] Record demo videos for key features (optional)
- [ ] Create onboarding documentation for new developers
- [ ] Add security documentation and guidelines
- [ ] Create maintenance and update procedures
- [ ] Document testing strategies and patterns

### Acceptance Criteria

- Test coverage ≥80% with quality tests
- Complete documentation suite
- Deployment procedures documented
- Knowledge transfer materials ready

---

## Development Workflow

### Daily Process

1. Pull latest from `main`
2. Create feature branch: `feature/[phase]-[component-name]`
3. Choose development mode (`yarn start:mock`, `yarn start:local`, or `yarn start:dev`)
4. Develop feature with TDD approach
5. Write/update tests (MSW mocks automatically in tests)
6. Run linter and tests locally
7. Commit with conventional commit format
8. Push and create PR with detailed description
9. Code review with checklist
10. Merge to `main` after approval

### Quality Gates

- [ ] Tests written and passing (≥80% coverage)
- [ ] TypeScript strict mode compliant
- [ ] ESLint/Prettier passing
- [ ] Accessibility considered (ARIA, keyboard nav)
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified
- [ ] No console.log statements
- [ ] Performance impact assessed

---

## Dependencies Tracking

### Core Dependencies Status

- [ ] React 18.3+ installed and configured
- [ ] TypeScript 5.x with strict mode
- [ ] Vite 5.x build system
- [ ] MUI v6 with theme system
- [ ] Zustand for state management
- [ ] React Query for server state
- [ ] React Router v6 for navigation
- [ ] React Hook Form + Zod for forms
- [ ] MSAL.js v3 for authentication
- [ ] MSW v2 for API mocking
- [ ] Vitest + RTL for testing
- [ ] ESLint + Prettier for code quality
