/**
 * renderWithProviders — wraps a component with all required providers
 * (QueryClient, Router) so tests don't need boilerplate.
 */
import { type ReactNode } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

interface Options {
  routerProps?: MemoryRouterProps
  queryClient?: QueryClient
}

function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,          // don't retry in tests — fail fast
        staleTime: Infinity,   // don't refetch during a test
        gcTime: Infinity,
      },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactNode,
  { routerProps, queryClient }: Options = {}
): RenderResult & { queryClient: QueryClient } {
  const client = queryClient ?? makeTestQueryClient()

  const result = render(
    <QueryClientProvider client={client}>
      <MemoryRouter {...routerProps}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )

  return { ...result, queryClient: client }
}

export { makeTestQueryClient }
