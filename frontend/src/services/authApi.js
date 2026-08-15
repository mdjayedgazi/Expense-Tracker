import api from './api'

/**
 * Register a new user.
 * POST /auth/register { username, email, password }
 */
export function registerUser(payload) {
  return api.post('/auth/register', payload)
}

/**
 * Log in with username + password.
 *
 * The backend expects OAuth2 form data, so the payload is sent as
 * application/x-www-form-urlencoded — not JSON.
 */
export function loginUser({ username, password }) {
  const body = new URLSearchParams()
  body.append('username', username)
  body.append('password', password)
  return api.post('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/**
 * Fetch the authenticated user's public profile.
 * GET /users/me
 */
export function getCurrentUser() {
  return api.get('/users/me')
}