import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { PageLoader } from '@/components/ui/Spinner'
import { useMe } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { token, isAuthenticated } = useAuthStore()

  // Re-hydrate user on page load if we have a persisted token
  const { isLoading, isError } = useMe()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    )
  }

  // Token was invalid (401 clears auth in the interceptor, but handle the
  // edge case where the query errored before the interceptor ran)
  if (isError && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
