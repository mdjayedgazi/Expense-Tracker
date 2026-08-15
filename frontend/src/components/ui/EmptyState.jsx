import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-400 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-stone-500">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-[15px] font-semibold text-stone-800 dark:text-stone-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}