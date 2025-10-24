import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { type ReactNode, Suspense, lazy } from 'react'

import { queryClient } from '../../config/queryClient'

// Lazy load devtools to avoid DOM nesting issues
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(module => ({
    default: module.ReactQueryDevtools,
  }))
)

/**
 * Props for the QueryProvider component
 */
interface IQueryProviderProps {
  children: ReactNode
  client?: QueryClient
  showDevtools?: boolean
}

/**
 * React Query provider component
 * Wraps the app with QueryClientProvider and includes devtools in development
 */
export const QueryProvider: React.FC<IQueryProviderProps> = ({
  children,
  client = queryClient,
  showDevtools = import.meta.env.DEV,
}) => {
  return (
    <QueryClientProvider client={client}>
      {children}
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition='bottom-left'
          />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
