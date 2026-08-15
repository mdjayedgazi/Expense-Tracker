import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { TYPE_META } from '../../utils/constants'

/**
 * Soft pill showing whether a transaction is income or expense.
 */
export default function TypeBadge({ type }) {
  const meta = TYPE_META[type]
  if (!meta) return null

  const Icon = type === 'income' ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium ${meta.bg} ${meta.text}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </span>
  )
}