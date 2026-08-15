import { getCategoryMeta } from '../../utils/constants'

/**
 * Small tinted icon for a transaction's category.
 */
export default function TransactionIcon({ category, size = 'md' }) {
  const meta = getCategoryMeta(category)
  const sizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-9 w-9 rounded-lg',
    lg: 'h-10 w-10 rounded-xl',
  }
  const iconSizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-4.5 w-4.5' }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${meta.bg} ${meta.iconClass} ${sizes[size]}`}
      aria-hidden="true"
    >
      <meta.icon className={iconSizes[size]} />
    </span>
  )
}