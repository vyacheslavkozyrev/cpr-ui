# cpr-ui — Frontend Context

React 19 + TypeScript frontend. See root `CLAUDE.md` for project-wide rules (naming, RBAC, SDD).

## Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | React + TypeScript | 19.1 / 5.8 |
| Build | Vite | 6.x |
| UI | MUI (Material UI) | v7 |
| Server state | TanStack React Query | v5 |
| Client state | Zustand | v5 |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Auth | Azure MSAL (`@azure/msal-browser`) + stub auth | 4.x |
| HTTP | Native `fetch` via `src/services/apiClient.ts` | — |
| Routing | React Router | v7 |
| Testing (unit) | Vitest + Testing Library | 3.x |
| Testing (E2E) | Playwright | 1.x |
| Mocking | MSW (Mock Service Worker) | v2 |
| i18n | i18next + react-i18next | 25.x |
| Charts | Chart.js + Recharts | — |
| Drag-and-drop | dnd-kit | — |
| Offline DB | Dexie (IndexedDB wrapper) | 3.x |
| Date utils | date-fns | v4 |

## Source Structure

```
src/
├── assets/          # Static assets (images, icons, fonts)
├── components/      # Reusable components, organized by domain
├── config/          # App configuration (auth, query client, i18n)
├── db/              # Local constants and IndexedDB helpers
├── dtos/            # API request/response types (snake_case fields)
├── hooks/           # Custom React hooks
├── mappers/         # DTO ↔ model transformers
├── mocks/           # MSW handlers and mock data
├── models/          # Domain models (camelCase fields)
├── pages/           # Page-level components (one folder per route)
├── routes/          # React Router route definitions
├── services/        # API service layer (one class per resource)
├── stores/          # Zustand state stores
├── tests/           # Test setup, utilities, shared fixtures
├── theme/           # MUI theme configuration (light/dark)
├── types/           # Shared TypeScript types, interfaces, enums
└── utils/           # Pure utility functions
```

## Path Aliases

Use `@/` aliases — never use relative `../` traversals:

```
@/components   @/pages        @/services     @/hooks
@/stores       @/types        @/utils        @/config
@/theme        @/assets       @/tests        @/mocks
@/dtos         @/models       @/mappers      @/db
```

## Data Layer Architecture

All API data flows through three layers:

```
DTO  (API wire format — snake_case)
 ↓   mapper function
Model (domain type — camelCase)
 ↓   component props
UI  (render)
```

- **DTOs** in `src/dtos/` — mirror the API `api.md` spec exactly; fields are snake_case.
- **Models** in `src/models/` — UI-friendly camelCase types; no API coupling.
- **Mappers** in `src/mappers/` — pure functions `mapFoo(dto: TFooDto): Foo`.
- **Services** in `src/services/api/` — call the API, return DTOs; never transform data.
- Consumers (hooks/stores) receive DTOs, apply mappers, expose Models.

## TypeScript Standards

- **Strict mode**: `strict: true`, `noImplicitAny`, `noUnusedLocals/Parameters` — no `any`.
- **Interfaces**: `I` prefix — `IUserProfile`, `IGoal`
- **Type aliases**: `T` prefix — `TApiResponse<T>`, `TUser`
- **Enums**: `E` prefix — `EUserRole`, `EGoalStatus`
- **Variables/functions**: camelCase — `userId`, `handleSubmit`
- **DTO fields**: snake_case matching the API wire format — `user_id`, `created_at`
- **Component files**: PascalCase — `GoalCard.tsx`, `LoginForm.tsx`
- **Service/utility files**: camelCase — `goalService.ts`, `userMapper.ts`

## React Standards

- **No inline handlers**: wrap all event handlers in `useCallback` with correct deps.
- **No inline styles**: define style objects outside the component with a factory function and `useMemo`; never `sx={{ ... }}` inline.
- **Expensive computations**: wrap in `useMemo`.
- **Frequent re-renders**: wrap component in `React.memo`.

```typescript
// Style factory — define OUTSIDE the component
const getStyles = () => ({
  container: { display: 'flex', gap: 2 },
  title: { fontWeight: 600 },
})

const MyComponent = () => {
  const styles = useMemo(() => getStyles(), [])
  return <Box sx={styles.container}>...</Box>
}
```

## React Query Patterns

Server state lives in React Query; Zustand is for client-only state.

```typescript
// Query key factory (src/config/queryKeys.ts)
queryKeys.user.me()
queryKeys.goals.list()
queryKeys.goals.detail(id)

// Typical query hook
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.goals.list(),
  queryFn: () => goalsApiService.getAll(),
})

// Mutation
const mutation = useMutation({
  mutationFn: (payload: TCreateGoalDto) => goalsApiService.create(payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.goals.list() }),
})
```

## Zustand Store Pattern

```typescript
interface IFooState {
  items: Foo[]
  setItems: (items: Foo[]) => void
}

export const useFooStore = create<IFooState>()(
  subscribeWithSelector((set) => ({
    items: [],
    setItems: items => set({ items }),
  }))
)

// Selector-scoped convenience hook
export const useFooItems = () => useFooStore(state => state.items)
```

## Authentication

Two auth modes; selected via `VITE_ENABLE_STUB_AUTH`:

| Mode | Used when | How |
|------|-----------|-----|
| Stub auth | `start:mock*` / tests | HMAC-signed token, mock users |
| MSAL (real) | `start:local`, `start:dev`, production | Azure Entra ID popup/redirect |

Role is determined from the token claims and stored in `authStore`. Use `useAuth()` to read auth state; use `<RoleGuard allowedRoles={[EUserRole.Manager]}>` for conditional rendering.

## MSW Mocking

- Every API endpoint must have a corresponding handler in `src/mocks/handlers/`.
- Handlers must match `api.md` exactly (paths, methods, request/response shapes, error codes).
- `yarn start:mock` and `yarn test` both use MSW — no live backend needed.

## Internationalization

- No hardcoded UI text — all strings via `t('namespace.key')`.
- Supported locales: `en`, `es`, `fr`, `be`.
- Dates/numbers via locale-aware APIs (`toLocaleDateString()`, `Intl.NumberFormat()`).
- API error messages return i18n keys, not hardcoded text.

## Build & Run Commands

```bash
yarn install

# Dev server modes
yarn start:local            # Dev server → local API (:5000)
yarn start:mock             # MSW mocks, Employee role (no API needed)
yarn start:mock-manager     # MSW mocks, PeopleManager role
yarn start:mock-owner       # MSW mocks, SolutionOwner role
yarn start:mock-director    # MSW mocks, Director role
yarn start:mock-admin       # MSW mocks, Administrator role

# Build & test
yarn build                  # Production build (tsc + vite)
yarn test                   # Unit/integration tests (Vitest)
yarn test:coverage          # Tests with coverage report
yarn test:e2e               # E2E tests (Playwright, uses start:mock)

# Lint / format
yarn lint                   # ESLint (max 10 warnings; no `any` is a hard error)
yarn format                 # Prettier
```

## Testing Standards

- Tests never depend on a running backend — use MSW mocks.
- Test files colocated with source: `src/**/*.{test,spec}.{ts,tsx}`.
- Setup file: `src/tests/setup.ts`.
- Coverage thresholds (global): **70%** branches/functions/lines/statements.
- Authentication, validation, and business-rule paths: **100%** coverage required.

**Test render helpers** (`src/tests/utils.tsx`):

```typescript
renderWithProviders(ui)         // Full provider stack
renderWithUser(ui, 'manager')   // Specific role (stub auth)
renderWithTheme(ui)             // Light/dark theme
renderWithLanguage(ui, 'fr')    // Locale
renderProtectedRoute(ui)        // Router + auth guard
renderWithRouter(ui)            // Router only
```

Use `renderWithUser` for components that depend on auth/roles; use `renderWithProviders` otherwise.
