import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Wallet, ReceiptText } from 'lucide-react'

const CONFIG = {
  balance: {
    label: 'Total Balance',
    icon: Wallet,
    iconClass:
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    valueClass: 'text-stone-900 dark:text-white',
  },
  income: {
    label: 'Total Income',
    icon: ArrowUpRight,
    iconClass:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    valueClass: 'text-emerald-700 dark:text-emerald-300',
  },
  expense: {
    label: 'Total Expense',
    icon: ArrowDownRight,
    iconClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    valueClass: 'text-rose-700 dark:text-rose-300',
  },
  count: {
    label: 'Transactions',
    icon: ReceiptText,
    iconClass:
      'bg-stone-100 text-stone-600 dark:bg-white/[0.07] dark:text-stone-300',
    valueClass: 'text-stone-900 dark:text-white',
  },
}

export default function StatCard({ type, value, sub, index = 0 }) {
  const config = CONFIG[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className="card card-hover flex items-start gap-3.5 p-4.5 sm:p-5"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconClass}`}
      >
        <config.icon className="h-4.5 w-4.5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
          {config.label}
        </p>
        <p className={`mt-0.5 truncate text-xl font-semibold tracking-tight sm:text-[22px] ${config.valueClass}`}>
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}