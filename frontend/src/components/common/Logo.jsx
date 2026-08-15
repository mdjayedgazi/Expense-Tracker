import { Wallet } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Wallet className="h-4 w-4" aria-hidden="true" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight text-stone-900 dark:text-white">
            Expense<span className="text-indigo-600 dark:text-indigo-400">Track</span>
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            Personal finance
          </p>
        </div>
      )}
    </div>
  )
}