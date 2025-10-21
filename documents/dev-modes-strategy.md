# CPR UI - Development Modes & MSW Strategy

**Purpose**: Document the three development modes and MSW (Mock Service Worker) setup strategy

**Last Updated**: October 16, 2025

---

## 🎯 Overview

The CPR UI supports **three distinct development modes** to enable flexible development workflows:

1. **Mock Mode** (`yarn start:mock`) - MSW-powered offline development
2. **Local Mode** (`yarn start:local`) - Connect to local backend API
3. **Dev Mode** (`yarn start:dev`) - Connect to shared dev environment

---

## 🔧 Development Modes

### 1. Mock Mode (MSW) - `yarn start:mock`

**Purpose**: Fully offline UI development without backend dependency

**Use Cases**:
- 🎨 UI/UX development and prototyping
- 🧪 Component development and testing
- 🚀 Frontend-only feature development
- 📱 Demo mode for stakeholders
- ✈️ Offline development (no network needed)

**Configuration**:
```env
# .env.mock
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:5173/api  # Intercepted by MSW
VITE_USE_MSW=true
```

**How It Works**:
1. MSW intercepts all fetch/XHR requests at service worker level
2. Requests never leave the browser
3. Mock handlers return predefined responses
4. Full API simulation with realistic delays
5. Can simulate errors, edge cases, loading states

**Benefits**:
- ✅ No backend required
- ✅ Fast development iterations
- ✅ Consistent test data
- ✅ Easy to simulate edge cases
- ✅ Works offline

**Limitations**:
- ❌ Mock data must be maintained
- ❌ May diverge from real API over time
- ❌ Not suitable for integration testing

---

### 2. Local Mode - `yarn start:local`

**Purpose**: Full-stack local development with real backend

**Use Cases**:
- 🔄 Full integration testing locally
- 🐛 Debugging backend issues
- 📊 Testing with real database data
- 🔐 Testing authentication flows
- ✅ End-to-end feature validation

**Configuration**:
```env
# .env.local
VITE_API_MODE=local
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MSW=false
VITE_AUTH_MODE=stub
VITE_STUB_TOKEN=<your-stub-token-here>
```

**Prerequisites**:
- ✅ Backend API running on `http://localhost:5000`
- ✅ PostgreSQL database running (Docker)
- ✅ Stub authentication token available

**Stub Token Approach**:
```typescript
// Backend provides test tokens for development
// See documents/users.md for available test users

// Example stub tokens:
const STUB_TOKENS = {
  employee: 'eve-adams-token',      // Eve Adams - Employee
  manager: 'henry-wilson-token',    // Henry Wilson - Manager
  director: 'tim-goldman-token',    // Tim Goldman - Director
  admin: 'steve-miller-token',      // Steve Miller - Admin
};
```

**How To Get Stub Token**:
```bash
# Run backend script for specific user
# See documents/users.md for available scripts:
# - run-api-as-employee.cmd (Eve Adams)
# - run-api-as-manager.cmd (Henry Wilson)

# Token will be displayed in console output
# Copy token to .env.local file
```

**Benefits**:
- ✅ Real API responses
- ✅ Real database data
- ✅ Full backend integration
- ✅ Realistic error handling
- ✅ True end-to-end testing

**Limitations**:
- ❌ Requires backend to be running
- ❌ Database must be seeded
- ❌ Slower than mock mode
- ❌ Network-dependent

---

### 3. Dev Mode - `yarn start:dev`

**Purpose**: Connect to shared development environment

**Use Cases**:
- 🤝 Team collaboration
- 🧪 Integration testing in shared environment
- 📊 Testing with shared data
- 🔄 CI/CD pipeline testing
- 🎭 Staging environment preview

**Configuration**:
```env
# .env.development
VITE_API_MODE=dev
VITE_API_BASE_URL=https://api-dev.cpr.com/api  # TBD
VITE_USE_MSW=false
VITE_AUTH_MODE=entra  # Future: Real Entra authentication
# VITE_MSAL_CLIENT_ID=<future>
# VITE_MSAL_TENANT_ID=<future>
```

**Prerequisites**:
- ✅ Access to dev environment API
- ✅ Valid authentication credentials
- ⏳ Dev environment URL (to be determined)

**Benefits**:
- ✅ Shared environment for team
- ✅ Real authentication
- ✅ Shared database state
- ✅ Production-like setup

**Limitations**:
- ❌ Network-dependent
- ❌ Shared state can be unpredictable
- ❌ Requires VPN/network access
- ❌ Slower than local/mock

---

## 🎭 Mock Service Worker (MSW) Setup

### What is MSW?

MSW (Mock Service Worker) intercepts network requests at the service worker level, allowing the UI to work completely offline with realistic API behavior.

### Architecture

```
┌─────────────────────────────────────────┐
│         React Application               │
│  ┌─────────────────────────────────┐   │
│  │   API Service (fetch calls)     │   │
│  └─────────────────────────────────┘   │
│                 ↓                       │
│  ┌─────────────────────────────────┐   │
│  │   Service Worker (MSW)          │   │
│  │   - Intercepts requests         │   │
│  │   - Routes to handlers          │   │
│  │   - Returns mock responses      │   │
│  └─────────────────────────────────┘   │
│                 ↓                       │
│  ┌─────────────────────────────────┐   │
│  │   Mock Handlers                 │   │
│  │   - goals.handlers.ts           │   │
│  │   - feedback.handlers.ts        │   │
│  │   - skills.handlers.ts          │   │
│  │   - team.handlers.ts            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### File Structure

```
src/
├── mocks/
│   ├── browser.ts              # Browser MSW setup
│   ├── server.ts               # Node MSW setup (for tests)
│   ├── handlers/               # Request handlers
│   │   ├── index.ts            # Combined handlers
│   │   ├── auth.handlers.ts    # Auth endpoints
│   │   ├── goals.handlers.ts   # Goals endpoints
│   │   ├── feedback.handlers.ts # Feedback endpoints
│   │   ├── skills.handlers.ts  # Skills endpoints
│   │   ├── team.handlers.ts    # Team endpoints
│   │   └── admin.handlers.ts   # Admin endpoints
│   ├── data/                   # Mock data
│   │   ├── users.ts            # User fixtures
│   │   ├── goals.ts            # Goal fixtures
│   │   ├── feedback.ts         # Feedback fixtures
│   │   ├── skills.ts           # Skills fixtures
│   │   └── taxonomy.ts         # Taxonomy fixtures
│   └── utils/                  # Mock utilities
│       ├── response.ts         # Response helpers
│       ├── pagination.ts       # Pagination helpers
│       └── delay.ts            # Realistic delays
```

### Mock Handler Example

```typescript
// src/mocks/handlers/goals.handlers.ts
import { http, HttpResponse } from 'msw';
import { mockGoals } from '../data/goals';

export const goalsHandlers = [
  // GET /api/me/goals - List my goals
  http.get('/api/me/goals', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '20');
    const status = url.searchParams.get('status');

    // Filter by status if provided
    let filteredGoals = mockGoals;
    if (status) {
      filteredGoals = mockGoals.filter(g => g.status === status);
    }

    // Paginate
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const items = filteredGoals.slice(start, end);

    return HttpResponse.json({
      items,
      total: filteredGoals.length,
      page,
      per_page: perPage,
    });
  }),

  // POST /api/goals - Create goal
  http.post('/api/goals', async ({ request }) => {
    const body = await request.json();
    
    // Validate (optional - can simulate validation errors)
    if (!body.title) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: {
            title: ['The title field is required.']
          }
        },
        { status: 400 }
      );
    }

    // Create new goal
    const newGoal = {
      id: crypto.randomUUID(),
      employeeId: '32323232-3232-4323-2323-323232323232',
      title: body.title,
      description: body.description || null,
      status: 'open',
      deadline: body.deadline || null,
      priority: body.priority || null,
      visibility: body.visibility || 'private',
      createdAt: new Date().toISOString(),
      createdBy: '32323232-3232-4323-2323-323232323232',
    };

    mockGoals.push(newGoal);

    return HttpResponse.json(newGoal, { status: 201 });
  }),

  // GET /api/goals/:id - Get goal by ID
  http.get('/api/goals/:id', ({ params }) => {
    const goal = mockGoals.find(g => g.id === params.id);
    
    if (!goal) {
      return HttpResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(goal);
  }),

  // PATCH /api/goals/:id - Update goal
  http.patch('/api/goals/:id', async ({ params, request }) => {
    const body = await request.json();
    const goalIndex = mockGoals.findIndex(g => g.id === params.id);
    
    if (goalIndex === -1) {
      return HttpResponse.json(
        { message: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update goal
    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockGoals[goalIndex]);
  }),
];
```

### Mock Data Example

```typescript
// src/mocks/data/goals.ts
export const mockGoals = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    employeeId: '32323232-3232-4323-2323-323232323232',
    title: 'Improve API Design Skills',
    description: 'Master RESTful API design principles and best practices',
    status: 'in_progress',
    deadline: '2025-11-30',
    priority: 80,
    visibility: 'team',
    relatedSkillId: '22222222-2222-2222-2222-222222222222',
    relatedSkillLevelId: '33333333-3333-3333-3333-333333333333',
    progress: 60,
    createdAt: '2025-09-01T10:00:00Z',
    createdBy: '32323232-3232-4323-2323-323232323232',
    tasks: [
      {
        id: '44444444-4444-4444-4444-444444444444',
        goalId: '11111111-1111-1111-1111-111111111111',
        title: 'Study REST API best practices',
        isCompleted: true,
        completedAt: '2025-09-15T14:30:00Z',
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        goalId: '11111111-1111-1111-1111-111111111111',
        title: 'Complete API Design course',
        isCompleted: true,
        completedAt: '2025-09-30T16:00:00Z',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        goalId: '11111111-1111-1111-1111-111111111111',
        title: 'Design new API endpoints',
        isCompleted: false,
        completedAt: null,
      },
    ],
  },
  // ... more mock goals
];
```

### Initializing MSW

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function enableMocking() {
  if (import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'warn', // Warn about unhandled requests
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "start:mock": "cross-env VITE_USE_MSW=true vite --mode mock",
    "start:local": "vite --mode local",
    "start:dev": "vite --mode development",
    "build": "tsc && vite build",
    "build:dev": "tsc && vite build --mode development",
    "build:prod": "tsc && vite build --mode production",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "generate-client": "openapi-typescript-codegen --input http://localhost:5000/swagger/v1/swagger.json --output ./src/services/api/generated --client fetch"
  }
}
```

---

## 🔐 Authentication Strategy

### Stub Token Mode (Local Development)

For local development with real backend, we use **stub tokens** provided by the backend:

```typescript
// src/services/auth/stubAuthService.ts
export class StubAuthService {
  private stubToken: string | null = null;

  constructor() {
    // Load stub token from environment
    this.stubToken = import.meta.env.VITE_STUB_TOKEN || null;
  }

  async getAccessToken(): Promise<string> {
    if (!this.stubToken) {
      throw new Error('Stub token not configured. Set VITE_STUB_TOKEN in .env.local');
    }
    return this.stubToken;
  }

  async login(userType: 'employee' | 'manager' | 'director' | 'admin'): Promise<void> {
    // In stub mode, just set the appropriate token
    // Tokens are available from backend documentation
    console.log(`Stub auth: Logging in as ${userType}`);
  }

  async logout(): Promise<void> {
    console.log('Stub auth: Logging out');
  }

  isAuthenticated(): boolean {
    return !!this.stubToken;
  }
}
```

### Mock Mode Authentication

In mock mode, authentication is also mocked:

```typescript
// src/mocks/handlers/auth.handlers.ts
export const authHandlers = [
  http.get('/api/me', () => {
    return HttpResponse.json({
      userId: 'c7746e91-a5e8-4f8b-9f22-f48374ffa2a4',
      userName: 'eve.adams',
      displayName: 'Eve Adams',
      employeeId: '32323232-3232-4323-2323-323232323232',
      position: 'Senior Frontend Engineer',
    });
  }),
];
```

---

## 🧪 Testing with MSW

MSW is also used in tests to mock API responses:

```typescript
// tests/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../src/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

```typescript
// tests/components/GoalList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { GoalList } from '@/components/goals/GoalList';

test('displays goals from API', async () => {
  // Override default handler for this test
  server.use(
    http.get('/api/me/goals', () => {
      return HttpResponse.json({
        items: [
          { id: '1', title: 'Test Goal', status: 'open' }
        ],
        total: 1,
        page: 1,
        per_page: 20,
      });
    })
  );

  render(<GoalList />);

  await waitFor(() => {
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
  });
});

test('displays error message on API failure', async () => {
  // Simulate API error
  server.use(
    http.get('/api/me/goals', () => {
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    })
  );

  render(<GoalList />);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

---

## 🎯 Best Practices

### 1. Keep Mock Data Synchronized
- Regularly sync mock data with backend schema
- Use TypeScript types generated from OpenAPI spec
- Review and update mocks when API changes

### 2. Realistic Mock Behavior
- Add artificial delays to simulate network latency
- Implement pagination, filtering, sorting
- Handle edge cases (empty lists, errors, loading states)

### 3. Test All Scenarios
- Use MSW in tests to test error handling
- Test loading states
- Test empty states
- Test pagination

### 4. Documentation
- Document available mock users/roles
- Document mock data structure
- Keep mock examples up to date

### 5. Maintenance
- Regular audits of mock handlers vs. real API
- Update mocks when backend changes
- Remove unused mocks

---

## 📊 Comparison Matrix

| Feature | Mock Mode | Local Mode | Dev Mode |
|---------|-----------|------------|----------|
| **Backend Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Network Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Database Required** | ❌ No | ✅ Yes | ✅ Yes |
| **Speed** | ⚡ Fastest | 🚀 Fast | 🐢 Slower |
| **Data Consistency** | ✅ Always same | ⚠️ Can vary | ⚠️ Shared state |
| **Real API Behavior** | ❌ Simulated | ✅ Yes | ✅ Yes |
| **Offline Development** | ✅ Yes | ❌ No | ❌ No |
| **Test Edge Cases** | ✅ Easy | ⚠️ Harder | ⚠️ Harder |
| **Authentication** | 🎭 Mocked | 🔑 Stub token | 🔐 Real |
| **Use Case** | UI Development | Full-stack dev | Team collaboration |

---

## 🚀 Getting Started

### 1. Mock Mode (First Time)
```bash
# No setup needed - works out of the box
yarn start:mock

# Application runs on http://localhost:5173
# All API calls intercepted by MSW
# Uses mock data from src/mocks/data/
```

### 2. Local Mode
```bash
# Prerequisites:
# 1. Backend API running on http://localhost:5000
# 2. Get stub token from backend

# Option A: Use environment variable
echo "VITE_STUB_TOKEN=your-token-here" >> .env.local
yarn start:local

# Option B: Backend script provides token
# Run backend: run-api-as-employee.cmd
# Copy displayed token to .env.local
yarn start:local
```

### 3. Dev Mode
```bash
# Configure dev environment URL (when available)
echo "VITE_API_BASE_URL=https://api-dev.cpr.com/api" >> .env.development
yarn start:dev
```

---

## 📚 References

- **MSW Documentation**: https://mswjs.io/
- **MSW with React**: https://mswjs.io/docs/integrations/react
- **MSW with Vitest**: https://mswjs.io/docs/integrations/vitest
- **Backend API Documentation**: `documents/endpoints.md`
- **Available Test Users**: `documents/users.md`

---

**Last Updated**: October 16, 2025
