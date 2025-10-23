import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { type ReactNode } from 'react'

import { queryClient } from '../../config/queryClient'

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
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default QueryProvider
