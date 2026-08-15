import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../hooks/useAuth'

/**
 * Guards dashboard routes. While the session is being restored a
 * skeleton is shown; unauthenticated users are sent to /login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card p-5">
                <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
                <Skeleton className="mb-2 h-3.5 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}