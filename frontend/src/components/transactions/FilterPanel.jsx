import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import Button from '../ui/Button'
import Select from '../ui/Select'
import Input from '../ui/Input'
import { CATEGORIES, TRANSACTION_TYPES } from '../../utils/constants'

const EMPTY_FILTERS = { type: '', category: '', minimum_amount: '', maximum_amount: '' }

/**
 * Filter panel used on both desktop (inline) and mobile (drawer).
 * Backed by GET /transactions/filter.
 */
export default function FilterPanel({ open, onClose, filters, onApply, onReset, disabled }) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    setDraft(filters)
  }, [filters, open])

  function submit(event) {
    event.preventDefault()
    onApply(draft)
    onClose?.()
  }

  function reset() {
    setDraft(EMPTY_FILTERS)
    onReset()
    onClose?.()
  }

  const fields = (
    <div className="grid gap-3.5 sm:grid-cols-2">
      <Select
        label="Type"
        value={draft.type}
        onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
        options={[{ value: '', label: 'All types' }, ...TRANSACTION_TYPES]}
      />
      <Select
        label="Category"
        value={draft.category}
        onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
        options={[{ value: '', label: 'All categories' }, ...CATEGORIES]}
      />
      <Input
        label="Min amount (৳)"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={draft.minimum_amount}
        onChange={(e) => setDraft((d) => ({ ...d, minimum_amount: e.target.value }))}
      />
      <Input
        label="Max amount (৳)"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={draft.maximum_amount}
        onChange={(e) => setDraft((d) => ({ ...d, maximum_amount: e.target.value }))}
      />
    </div>
  )

  const actions = (
    <div className="flex items-center gap-2.5">
      <Button variant="secondary" icon={RotateCcw} onClick={reset} disabled={disabled}>
        Reset
      </Button>
      <Button type="submit" icon={Filter} loading={disabled}>
        Apply
      </Button>
    </div>
  )

  /* Desktop: inline panel below the toolbar. */
  if (!open) {
    return (
      <motion.form
        key="filters-inline"
        onSubmit={submit}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="card mb-4 space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-stone-700 dark:text-stone-200">
              <SlidersHorizontal className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
              Filters
            </p>
            {actions}
          </div>
          {fields}
        </div>
      </motion.form>
    )
  }

  /* Mobile: bottom-sheet drawer. */
  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <motion.form
        onSubmit={submit}
        role="dialog"
        aria-label="Filter transactions"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-stone-200 bg-white p-5 pb-8 shadow-float dark:border-white/10 dark:bg-panel-dark"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-white">
            <SlidersHorizontal className="h-4 w-4 text-stone-400" aria-hidden="true" />
            Filter transactions
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {fields}
        <div className="mt-5 flex justify-end gap-2.5">{actions}</div>
      </motion.form>
    </div>
  )
}