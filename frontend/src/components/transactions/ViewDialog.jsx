import { Pencil } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import TransactionIcon from './TransactionIcon'
import TypeBadge from './TypeBadge'
import { formatDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

/**
 * Read-only details for a single transaction.
 */
export default function ViewDialog({ transaction, onClose, onEdit }) {
  if (!transaction) return null

  const rows = [
    { label: 'Date', value: formatDate(transaction.date) },
    { label: 'Category', value: transaction.category ?? 'Uncategorized' },
  ]

  return (
    <Modal
      open={Boolean(transaction)}
      onClose={onClose}
      title="Transaction details"
      size="sm"
    >
      <div className="flex items-start gap-3.5">
        <TransactionIcon category={transaction.category} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-stone-900 dark:text-white">
            {transaction.title}
          </p>
          <div className="mt-1">
            <TypeBadge type={transaction.type} />
          </div>
        </div>
      </div>

      <p
        className={`mt-5 text-2xl font-semibold tracking-tight tabular-nums ${
          transaction.type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {transaction.type === 'income' ? '+' : '−'} {formatCurrency(transaction.amount)}
      </p>

      <dl className="mt-5 divide-y divide-stone-100 border-t border-stone-100 dark:divide-white/[0.05] dark:border-white/[0.06]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <dt className="text-[13px] text-stone-500 dark:text-stone-400">{row.label}</dt>
            <dd className="text-[13px] font-medium text-stone-800 dark:text-stone-100">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button icon={Pencil} onClick={() => onEdit(transaction)}>
          Edit
        </Button>
      </div>
    </Modal>
  )
}