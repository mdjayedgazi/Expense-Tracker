import { useLocation } from 'react-router-dom'
import { Menu, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import Avatar from '../common/Avatar'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'Add Transaction',
  '/profile': 'Profile',
}

export default function Header({ onOpenMenu }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  const title =
    TITLES[pathname] ??
    (pathname.match(/^\/transactions\/(\d+)\/edit$/)
      ? 'Edit Transaction'
      : 'Expense Tracker')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-stone-200/80 bg-page/80 px-4 backdrop-blur-md dark:border-white/[0.07] dark:bg-page-dark/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/[0.06] lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-[17px] font-semibold tracking-tight text-stone-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/[0.06]"
        >
          {theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <Moon className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </button>

        <div className="ml-1 hidden items-center gap-2.5 rounded-full border border-stone-200/80 bg-white py-1 pl-1 pr-3 dark:border-white/[0.07] dark:bg-panel-dark sm:flex">
          <Avatar name={user?.username} size="sm" />
          <span className="max-w-[120px] truncate text-[13px] font-medium text-stone-700 dark:text-stone-200">
            {user?.username}
          </span>
        </div>
      </div>
    </header>
  )
}