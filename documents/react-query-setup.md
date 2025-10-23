# React Query API Infrastructure Setup

## 🎯 Overview

Complete React Query (TanStack Query) implementation with native `fetch` API client, authentication integration, and TypeScript support.

## 📁 File Structure

```
src/
├── config/
│   └── queryClient.ts          # React Query configuration and query keys
├── services/
│   ├── apiClient.ts           # Fetch-based API client with interceptors
│   └── userService.ts         # Example service with React Query hooks
├── types/
│   └── apiTypes.ts            # API-related TypeScript types
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx  # React Query provider component
│   └── Application.tsx        # Main app with API Infrastructure tab
├── hooks/
│   └── useInitializeApiClient.ts # Hook to setup API client with auth
└── main.tsx                   # Root integration with providers
```

## 🔧 Core Features

### API Client (`src/services/apiClient.ts`)

- ✅ **Native Fetch API** - No external HTTP dependencies
- ✅ **Authentication Integration** - Automatic token injection via Zustand auth store
- ✅ **Request/Response Interceptors** - Logging, error handling, request IDs
- ✅ **Environment-Based URLs** - Uses `VITE_API_BASE_URL` environment variable
- ✅ **File Upload Support** - Progress tracking with XMLHttpRequest
- ✅ **Error Transformation** - Standardized error format across the app
- ✅ **TypeScript Strict Mode** - Full type safety

### React Query Configuration (`src/config/queryClient.ts`)

- ✅ **Optimized Defaults** - 5min stale time, smart retry logic
- ✅ **Query Keys Factory** - Centralized key management with TypeScript
- ✅ **Error Handling** - Global error boundary support
- ✅ **Cache Strategy** - Production-ready cache configuration

### Types (`src/types/apiTypes.ts`)

- ✅ **Standardized API Response** - `TApiResponse<T>` wrapper
- ✅ **Error Types** - `TApiError` with consistent structure
- ✅ **Request Configuration** - `TRequestConfig` for fetch options
- ✅ **Upload Progress** - `TUploadProgressCallback` for file uploads

## 🚀 Usage Examples

### Basic API Service

```typescript
// userService.ts
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: () => userService.getCurrentUser(),
    select: response => response.data,
  })
}

export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<IUser>) =>
      userService.updateCurrentUser(userData),
    onSuccess: response => {
      queryClient.setQueryData(queryKeys.user.current(), response)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
    },
  })
}
```

### Component Integration

```typescript
// In your React component
const { data: user, isLoading, error } = useCurrentUser()
const updateUser = useUpdateCurrentUser()

const handleUpdate = (userData: Partial<IUser>) => {
  updateUser.mutate(userData)
}
```

### App Integration

```typescript
// main.tsx - Root integration
function ThemedApp() {
  // ... theme setup

  return (
    <QueryProvider>
      <ApiClientInitializer>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <Application />
        </ThemeProvider>
      </ApiClientInitializer>
    </QueryProvider>
  );
}

// ApiClientInitializer component
function ApiClientInitializer({ children }: { children: React.ReactNode }) {
  const getAccessToken = useAuthStore((state) => state.getAccessToken);
  useInitializeApiClient(getAccessToken);
  return <>{children}</>;
}
```

The main Application component includes a new "API Infrastructure" tab that shows:

- ✅ Setup status and features implemented
- 🎯 Next steps for development
- 📊 Development tools information

## 🔑 Environment Variables

The API client automatically uses environment variables for configuration:

```bash
# .env.development
VITE_API_BASE_URL=https://cpr-api-dev.azurewebsites.net/api

# .env.local
VITE_API_BASE_URL=http://localhost:5000/api

# .env.mock (when VITE_MOCK_USER_ROLE is set)
# Uses http://localhost:3000/api automatically
```

## 🔒 Authentication Integration

The API client automatically integrates with your existing Zustand auth store:

1. **Token Injection** - Automatic `Bearer` token in request headers
2. **Token Refresh** - Handles token refresh via auth store
3. **Mock Mode Support** - Works with stub tokens in development
4. **Error Handling** - Proper 401/403 error handling

## 📊 React Query DevTools

Development environment includes React Query DevTools for:

- Query cache inspection
- Network request monitoring
- Performance optimization
- Cache invalidation debugging

## 🎯 Next Steps

1. **Router Integration** - Add React Router with protected routes
2. **MSW Setup** - Mock Service Worker for development API mocking
3. **Service Expansion** - Create additional services (goals, skills, feedback)
4. **Error Boundaries** - App-level error handling for query failures
5. **Offline Support** - Add offline-first capabilities with React Query

## 🔗 Related Documentation

- [Authentication System](./authentication-setup.md)
- [Theme Architecture](./theme-architecture.md)
- [TypeScript Conventions](./typescript-conventions.md)
- [Development Workflow](./development-workflow.md)

---

**Status**: ✅ **COMPLETE** - Ready for feature development with React Query infrastructure
