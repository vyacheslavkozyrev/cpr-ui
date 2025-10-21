# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# CPR UI - Continuous Performance Review

A modern React application for career performance review and goal management.

## 🚀 Tech Stack

- **React 18.3+** - Modern React with concurrent features
- **TypeScript 5.x** - Type safety with strict mode
- **Vite 5.x** - Lightning fast build tool
- **Material UI v6** - Component library with theming
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **React Router v6** - Client-side routing with guards
- **React Hook Form + Zod** - Forms with validation
- **MSAL.js v3** - Microsoft Authentication (future)
- **MSW v2** - API mocking for development and testing
- **Vitest + RTL** - Testing framework
- **ESLint + Prettier** - Code quality and formatting

## 🏃‍♀️ Quick Start

### Prerequisites

- Node.js v20+ LTS
- Yarn v1.22+ or npm

### Installation

```bash
# Clone and navigate to project
cd cpr-ui

# Install dependencies
yarn install

# Start development (choose mode)
yarn start:mock    # UI-only with MSW mocking
yarn start:local   # Full-stack with local API (localhost:5000)
yarn start:dev     # Development environment
```

## 🔧 Development Modes

### Mock Mode (Recommended for UI Development)
```bash
yarn start:mock
```
- **Purpose**: UI-only development without backend dependency
- **API**: Intercepted by MSW (Mock Service Worker)
- **Data**: Realistic mock data for all scenarios
- **Best for**: Component development, UI testing, offline work

### Local Mode (Full-Stack Development)
```bash
yarn start:local
```
- **Purpose**: Full-stack development with local backend
- **API**: Real .NET API at `http://localhost:5000/api`
- **Authentication**: Stub tokens from backend scripts
- **Best for**: API integration, end-to-end testing

### Dev Mode (Integration Testing)
```bash
yarn start:dev
```
- **Purpose**: Testing against shared development environment
- **API**: Shared dev environment
- **Authentication**: Microsoft Entra ID (future)
- **Best for**: Integration testing, team collaboration

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Generic UI components
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── goals/          # Goals management
│   ├── feedback/       # Feedback system
│   ├── skills/         # Skills & assessments
│   ├── team/           # Team management
│   ├── admin/          # Admin panel
│   └── profile/        # User profile
├── services/           # API services
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── routes/             # Route configuration
├── config/             # App configuration
├── theme/              # MUI theme configuration
├── assets/             # Static assets
├── tests/              # Test utilities
└── mocks/              # MSW mock handlers
```

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start:mock` | Start in mock mode (MSW) |
| `yarn start:local` | Start with local API |
| `yarn start:dev` | Start with dev environment |
| `yarn build` | Build for production |
| `yarn build:dev` | Build for development |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint issues |
| `yarn format` | Format code with Prettier |
| `yarn test` | Run tests with Vitest |
| `yarn test:coverage` | Run tests with coverage |

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests with UI
yarn test:ui
```

Tests use MSW for API mocking, ensuring consistent test data across all scenarios.

## 📋 Code Quality

### Pre-commit Hooks
- **ESLint**: Linting with Airbnb config
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/component-name

# Make changes, commit with conventional commits
git commit -m "feat: add goal creation form"

# Push and create PR
git push origin feature/component-name
```

## 🔐 Authentication

### Current (Phase 0-1): Stub Tokens
- Get tokens from backend scripts:
  - `run-api-as-employee.cmd` - Employee role
  - `run-api-as-manager.cmd` - Manager role
- Add token to `.env.localapi`:
  ```
  VITE_STUB_TOKEN=your-token-here
  ```

### Future: Microsoft Entra ID
- Full MSAL.js integration
- Role-based access control
- Single sign-on

## 🎨 UI Theming

- Material UI v6 with custom theme
- Light/dark mode support
- Consistent design tokens
- Accessible components (WCAG 2.1 AA)

## 🛣️ Path Aliases

Import using convenient aliases:
```typescript
import { Button } from '@/components/common';
import { useAuth } from '@/hooks';
import { UserService } from '@/services/api';
```

## 📦 Dependencies

### Core
- React, TypeScript, Vite
- Material UI, Emotion
- React Router, React Query, Zustand
- React Hook Form, Zod
- MSAL, date-fns

### Development
- Vitest, RTL, MSW
- ESLint, Prettier, Husky
- TypeScript tooling

## 🔧 Configuration

### Environment Variables
Copy `.env.mock` to `.env.localapi` and update:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STUB_TOKEN=your-token-here
```

### VS Code
Recommended extensions will be suggested automatically. Prettier and ESLint are configured for optimal developer experience.

## 🚀 Deployment

```bash
# Build for production
yarn build:prod

# Preview production build
yarn preview
```

## 📚 Documentation

- [Project Plan](./documents/project-plan.md) - Complete implementation guide
- [Component Hierarchy](./documents/component-hierarchy.md) - UI structure
- [Quick Start Guide](./documents/quick-start.md) - Setup instructions
- [Development Modes](./documents/dev-modes-strategy.md) - Mock/Local/Dev strategy

## 🤝 Contributing

1. Follow conventional commit format
2. Ensure tests pass and coverage ≥80%
3. Run linter and formatter
4. Add documentation for new features
5. Create PR with detailed description

---

**Need help?** Check the documentation in the `documents/` folder or reach out to the team!

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
