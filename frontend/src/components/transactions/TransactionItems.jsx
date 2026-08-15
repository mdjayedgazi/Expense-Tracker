import { motion } from 'framer-motion'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'
import { formatAmount } from '../../utils/formatCurrency'
import TransactionIcon from './TransactionIcon'
import TypeBadge from './TypeBadge'

function Amount({ transaction }) {
  const isIncome = transaction.type === 'income'
  return (
    <span
      className={`whitespace-nowrap font-medium tabular-nums ${
        isIncome
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400'
      }`}
    >
      {isIncome ? '+' : '−'} ৳{formatAmount(transaction.amount)}
    </span>
  )
}

const ACTION_BUTTON =
  'inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/[0.07] dark:hover:text-stone-200'

/**
 * Single desktop table row.
 */
export function TransactionRow({ transaction, index = 0, onView, onEdit, onDelete }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      className="group border-b border-stone-100 transition-colors last:border-0 hover:bg-stone-50/70 dark:border-white/[0.05] dark:hover:bg-white/[0.03]"
    >
      <td className="whitespace-nowrap py-3.5 pl-5 pr-3 text-[13px] text-stone-500 dark:text-stone-400">
        {formatDate(transaction.date)}
      </td>
      <td className="py-3.5 pr-3">
        <div className="flex items-center gap-3">
          <TransactionIcon category={transaction.category} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
              {transaction.title}
            </p>
            {transaction.category && (
              <p className="truncate text-xs text-stone-400 dark:text-stone-500">
                {transaction.category}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-3 py-3.5 text-[13px] text-stone-500 dark:text-stone-400 sm:table-cell">
        {transaction.category ?? '—'}
      </td>
      <td className="whitespace-nowrap px-3 py-3.5">
        <TypeBadge type={transaction.type} />
      </td>
      <td className="whitespace-nowrap px-3 py-3.5 text-right">
        <Amount transaction={transaction} />
      </td>
      <td className="py-3.5 pl-3 pr-5">
        <div className="flex justify-end gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onView(transaction)}
            aria-label={`View ${transaction.title}`}
            className={ACTION_BUTTON}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            aria-label={`Edit ${transaction.title}`}
            className={ACTION_BUTTON}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            aria-label={`Delete ${transaction.title}`}
            className={`${ACTION_BUTTON} hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10 dark:hover:!text-rose-400`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

/**
 * Mobile transaction card.
 */
export function TransactionCard({ transaction, index = 0, onView, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      className="card card-hover p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <TransactionIcon category={transaction.category} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
              {transaction.title}
            </p>
            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
              {formatDate(transaction.date)}
            </p>
          </div>
        </div>
        <Amount transaction={transaction} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-white/[0.05]">
        <TypeBadge type={transaction.type} />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onView(transaction)}
            aria-label={`View ${transaction.title}`}
            className={ACTION_BUTTON}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            aria-label={`Edit ${transaction.title}`}
            className={ACTION_BUTTON}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            aria-label={`Delete ${transaction.title}`}
            className={`${ACTION_BUTTON} hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10 dark:hover:!text-rose-400`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}