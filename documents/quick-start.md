# CPR UI - Quick Start Guide

**Last Updated**: October 15, 2025

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js v20 LTS** installed ([Download](https://nodejs.org/))
- ✅ **Yarn** package manager installed (`npm install -g yarn`)
- ✅ **Git** installed and configured
- ✅ **VS Code** (recommended editor)
- ✅ **Backend API** running (for development)

---

## 🚀 Quick Start Commands

### Step 1: Verify Prerequisites

```powershell
# Check Node version (should be 20.x)
node --version

# Check Yarn version
yarn --version

# Check Git
git --version
```

### Step 2: Create Vite Project

```powershell
# Navigate to the cpr-ui directory
cd d:\projects\CPR\source\cpr-ui

# Create Vite project with React + TypeScript template
yarn create vite . --template react-ts

# Install dependencies
yarn install
```

### Step 3: Install Core Dependencies

```powershell
# MUI v6 and dependencies
yarn add @mui/material @mui/icons-material @emotion/react @emotion/styled

# Routing
yarn add react-router-dom

# State management
yarn add zustand @tanstack/react-query @tanstack/react-query-devtools

# Forms
yarn add react-hook-form @hookform/resolvers zod

# Authentication (MSAL)
yarn add @azure/msal-browser @azure/msal-react

# Utilities
yarn add date-fns

# Dev dependencies
yarn add -D @types/node
yarn add -D @vitejs/plugin-react
yarn add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
yarn add -D msw
yarn add -D eslint eslint-config-airbnb eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y @typescript-eslint/eslint-plugin @typescript-eslint/parser
yarn add -D prettier
yarn add -D husky lint-staged
yarn add -D openapi-typescript-codegen
```

### Step 4: Choose Your Development Mode

```powershell
# Option 1: Mock Mode (No backend needed - MSW mocking)
yarn start:mock

# Option 2: Local Mode (Connect to localhost:5000)
yarn start:local

# Option 3: Dev Mode (Connect to dev environment)
yarn start:dev
```

**Recommended for first run**: `yarn start:mock` (no dependencies)

---

## 📂 Next Steps After Initial Setup

1. **Create folder structure** (see PROJECT_PLAN.md)
2. **Setup ESLint and Prettier configs**
3. **Configure TypeScript with strict mode**
4. **Create environment variable files**
5. **Setup MUI theme**
6. **Configure MSAL authentication**
7. **Generate OpenAPI client**

---

## 🔑 Environment Variables

### For Mock Mode (No configuration needed!)
```env
# .env.mock (auto-configured)
VITE_API_MODE=mock
VITE_USE_MSW=true
```

### For Local Mode (Backend required)
```env
# .env.local
VITE_API_MODE=local
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MSW=false
VITE_AUTH_MODE=stub
VITE_STUB_TOKEN=<get-from-backend>  # Optional: for authenticated requests
```

**How to get stub token**:
1. Run backend with: `run-api-as-employee.cmd` (or manager/director/admin)
2. Token will be displayed in console
3. Copy to `.env.local` file

### For Dev Mode (Dev environment required)
```env
# .env.development
VITE_API_MODE=dev
VITE_API_BASE_URL=https://api-dev.cpr.com/api  # TBD
VITE_USE_MSW=false
# Future: Real authentication
```

See [DEV_MODES_STRATEGY.md](./DEV_MODES_STRATEGY.md) for complete documentation.

---

## 🎨 VS Code Extensions (Recommended)

Install these extensions for better DX:

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **TypeScript Vue Plugin (Volar)** - or similar for better TS support
- **Material Icon Theme** (PKief.material-icon-theme)
- **GitLens** (eamodio.gitlens)

---

## 🧪 Testing Commands

```powershell
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format
```

---

## 🏗️ Build Commands

```powershell
# Build for production
yarn build

# Preview production build
yarn preview

# Type check
yarn type-check
```

---

## 📖 Documentation Files

- **PROJECT_PLAN.md** - Complete project plan with phases
- **COMPONENT_HIERARCHY.md** - Component structure and page layouts
- **documents/** - Backend API documentation (endpoints, personas, etc.)

---

## ❓ Troubleshooting

### Issue: Node version mismatch
```powershell
# Install Node Version Manager (nvm) for Windows
# Download from: https://github.com/coreybutler/nvm-windows

# Install Node 20
nvm install 20
nvm use 20
```

### Issue: Yarn not found
```powershell
# Install yarn globally
npm install -g yarn
```

### Issue: Port 5173 already in use
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in vite.config.ts
```

---

## 🔗 Useful Links

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **MUI Documentation**: https://mui.com/
- **React Query Documentation**: https://tanstack.com/query/latest
- **React Router Documentation**: https://reactrouter.com/
- **React Hook Form**: https://react-hook-form.com/
- **MSAL.js Documentation**: https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview

---

## 🎯 Current Status

- [x] Project planning complete
- [x] Documentation created
- [ ] Project initialized
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Authentication configured
- [ ] First component built

---

## 👥 Team Communication

**Questions about:**
- Backend API: Check `documents/endpoints.md`
- User personas: Check `documents/personas.md`
- User stories: Check `documents/stories.md`
- Data model: Check `documents/data.md`

---

**Ready to start coding!** 🚀

Next command: `yarn create vite . --template react-ts`
