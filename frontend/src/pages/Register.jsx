import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Logo from '../components/common/Logo'
import { AuthShell } from './Login'
import { registerUser } from '../services/authApi'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getErrorMessage, getFieldErrors } from '../utils/errors'

export default function Register() {
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  function validate() {
    const next = {}
    if (form.username.trim().length < 2) next.username = 'Username must be at least 2 characters.'
    if (form.username.trim().length > 50) next.username = 'Username must be under 50 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (form.password.length < 4) next.password = 'Password must be at least 4 characters.'
    if (form.password.length > 20) next.password = 'Password must be under 20 characters.'
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match.'
    }
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
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      toast.success('Account created. You can now log in.')
      navigate('/login', { state: { registered: true } })
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        setServerError(getErrorMessage(error, 'We could not create your account. Please try again.'))
      }
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
          Create your account
        </h2>
        <p className="mt-1 text-center text-sm text-stone-500 dark:text-stone-400">
          Start tracking your income and expenses.
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
            placeholder="e.g. jayed"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            error={errors.username}
            autoComplete="username"
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 4 characters"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            icon={UserPlus}
            className="w-full"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}