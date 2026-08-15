import { useAuthContext } from '../context/AuthContext'

/**
 * Convenience hook for accessing auth state and actions.
 */
export function useAuth() {
  return useAuthContext()
}