import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser } from '../services/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? 'null')
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  /**
   * On first load, validate the stored token by fetching /users/me.
   * This restores the session after a page refresh.
   */
  useEffect(() => {
    let active = true
    const token = localStorage.getItem('access_token')

    async function restore() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const { data } = await getCurrentUser()
        if (active) {
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        }
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    restore()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await loginUser(credentials)
    localStorage.setItem('access_token', data.access_token)
    const { data: profile } = await getCurrentUser()
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}