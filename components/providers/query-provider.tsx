'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time for all queries (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Default cache time (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Refetch on window focus (good UX for catalog data freshness)
            refetchOnWindowFocus: false,
            // Don't retry failed requests immediately (avoid API spam)
            retry: 1,
            // Retry delay (exponential backoff)
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}