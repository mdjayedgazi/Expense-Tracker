import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Logo from '../components/common/Logo'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getErrorMessage } from '../utils/errors'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  function validate() {
    const next = {}
    if (!form.username.trim()) next.username = 'Enter your username.'
    if (!form.password) next.password = 'Enter your password.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await login(form)
      toast.success(`Welcome back, ${form.username}!`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'We could not log you in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="card w-full max-w-[400px] p-6 sm:p-8"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <h2 className="text-center text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">
          Log in to view your finances.
        </p>

        {serverError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
          >
            {serverError}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <Input
            label="Username"
            placeholder="your username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            icon={LogIn}
            className="w-full"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          New here?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}

/**
 * Shared centered shell for auth pages.
 */
export function AuthShell({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/[0.07]"
      />
      {children}
    </div>
  )
}