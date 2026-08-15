import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, User, LogOut, ShieldCheck } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/common/Avatar'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export default function Profile() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login', { replace: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-xl"
    >
      <header className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
          Profile
        </h2>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          Your account details. Only public information is shown here.
        </p>
      </header>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.username} size="lg" />
          <div>
            <p className="text-base font-semibold text-stone-900 dark:text-white">
              {user?.username}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 divide-y divide-stone-100 border-t border-stone-100 dark:divide-white/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center justify-between py-3">
            <dt className="flex items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400">
              <User className="h-4 w-4" aria-hidden="true" />
              Username
            </dt>
            <dd className="text-sm font-medium text-stone-800 dark:text-stone-100">
              {user?.username}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="flex items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Email
            </dt>
            <dd className="text-sm font-medium text-stone-800 dark:text-stone-100">
              {user?.email}
            </dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="flex items-center gap-2.5 text-sm text-stone-500 dark:text-stone-400">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Account ID
            </dt>
            <dd className="text-sm font-medium text-stone-800 dark:text-stone-100">
              #{user?.id}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end border-t border-stone-100 pt-5 dark:border-white/[0.06]">
          <Button variant="dangerGhost" icon={LogOut} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}