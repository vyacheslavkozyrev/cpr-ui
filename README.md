# CPR UI — Career & Performance Review

A React + TypeScript frontend for managing career progression, performance reviews, skills, and employee feedback.

For stack details, source structure, coding standards, and patterns see [`CLAUDE.md`](./CLAUDE.md).

## Prerequisites

- Node.js v20+ LTS
- Yarn v1.22+

## Quick Start

```bash
# Install dependencies
yarn install

# Copy the appropriate env file and configure it (see Configuration below)
cp .env.example .env.mock        # for mock mode
cp .env.example .env.localapi    # for local API mode

# Start in mock mode (no backend needed — recommended for UI development)
yarn start:mock
```

See `.env.README.md` for a full guide on environment variables.

## Development Modes

### Mock Mode (Recommended for UI development)
```bash
yarn start:mock             # Employee role
yarn start:mock-manager     # PeopleManager role
yarn start:mock-owner       # SolutionOwner role
yarn start:mock-director    # Director role
yarn start:mock-admin       # Administrator role
```
- API calls are intercepted by MSW (Mock Service Worker) — no backend required.
- Realistic mock data covers all scenarios.
- Best for: component development, UI testing, offline work.

### Local Mode (Full-stack development)
```bash
yarn start:local
```
- Connects to the real .NET API at `http://localhost:5000/api`.
- Uses stub token auth — generate a token with `scripts/generate-token.ps1` in `cpr-api`, then set `VITE_STUB_TOKEN` in `.env.localapi`.
- Best for: API integration, verifying real data flows.

### Dev Mode (Shared environment)
```bash
yarn start:dev
```
- Targets the shared development environment.
- Uses Microsoft Entra ID authentication.
- Best for: integration testing, team collaboration.

## Configuration

The project uses per-mode `.env` files. See `.env.README.md` for the complete setup guide.

Quick reference:
```bash
cp .env.example .env.mock       # mock mode — no changes needed
cp .env.example .env.localapi   # local API mode — update below
```

For local API mode, update `.env.localapi`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STUB_TOKEN=your-token-here
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start:mock` | Dev server — MSW mocks, Employee role |
| `yarn start:mock-manager` | Dev server — MSW mocks, PeopleManager role |
| `yarn start:mock-owner` | Dev server — MSW mocks, SolutionOwner role |
| `yarn start:mock-director` | Dev server — MSW mocks, Director role |
| `yarn start:mock-admin` | Dev server — MSW mocks, Administrator role |
| `yarn start:local` | Dev server — local API at localhost:5000 |
| `yarn start:dev` | Dev server — shared dev environment |
| `yarn build` | Production build (tsc + vite) |
| `yarn build:dev` | Development environment build |
| `yarn preview` | Preview production build locally |
| `yarn test` | Unit/integration tests (Vitest) |
| `yarn test:coverage` | Tests with coverage report |
| `yarn test:ui` | Tests with Vitest UI |
| `yarn test:e2e` | E2E tests (Playwright, uses start:mock) |
| `yarn lint` | ESLint (max 10 warnings; `any` is a hard error) |
| `yarn lint:fix` | Auto-fix ESLint issues |
| `yarn format` | Prettier |

## Testing

```bash
yarn test               # run all unit/integration tests
yarn test:coverage      # with coverage report
yarn test:ui            # with interactive Vitest UI
yarn test:e2e           # Playwright E2E (starts mock server automatically)
```

Tests use MSW for API mocking — no running backend required. For coverage thresholds and testing patterns see [`CLAUDE.md`](./CLAUDE.md).

## Code Quality

Pre-commit hooks (Husky) enforce:
- **ESLint** — linting; `any` is a hard error
- **Prettier** — code formatting
- **TypeScript** — type checking

```bash
yarn lint        # check
yarn lint:fix    # auto-fix
yarn format      # format
```

## Deployment

```bash
yarn build        # production build → dist/
yarn preview      # preview the production build locally
```

## Documentation

- [Documentation Index](./documents/README.md) — complete documentation guide
- [Project Structure](./documents/project-structure.md) — folder organisation and architecture
- [Theme Architecture](./documents/theme-architecture.md) — MUI theming system
- [Mock Users Guide](./documents/mock-users.md) — testing with different user roles
- [Quick Start Guide](./documents/quick-start.md) — detailed setup instructions
- [Development Modes](./documents/dev-modes-strategy.md) — mock/local/dev strategy
- [Coding Conventions](./documents/conventions.md) — standards and best practices

## Contributing

1. Follow [Conventional Commits](https://www.conventionalcommits.org/) format.
2. Ensure tests pass and coverage meets thresholds.
3. Run `yarn lint` and `yarn format` before committing.
4. Add documentation for new features.
5. Open a PR with a clear description.
