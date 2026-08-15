import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { CATEGORIES, TRANSACTION_TYPES } from '../../utils/constants'
import { todayISO } from '../../utils/formatDate'
import { getErrorMessage, getFieldErrors } from '../../utils/errors'

const EMPTY_FORM = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: todayISO(),
}

const DEFAULT_CATEGORY = 'Food'

function validate(form) {
  const errors = {}
  if (form.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.'
  }
  if (form.title.trim().length > 100) {
    errors.title = 'Title must be under 100 characters.'
  }
  const amount = Number(form.amount)
  if (form.amount === '' || !Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Enter a valid amount greater than 0.'
  }
  if (form.date === '') {
    errors.date = 'Choose a date.'
  }
  return errors
}

/**
 * Shared create/edit transaction form.
 * onSubmit receives { title, amount, type, category, date }.
 */
export default function TransactionForm({
  initialValues,
  submitLabel = 'Save transaction',
  submitting = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    category: initialValues?.category ?? '',
    type: initialValues?.type ?? 'expense',
    ...(initialValues ?? {}),
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!initialValues) return
    setForm((current) => ({
      ...current,
      ...initialValues,
      amount: initialValues.amount != null ? String(initialValues.amount) : '',
    }))
  }, [initialValues])

  const categoryOptions = useMemo(
    () => [...CATEGORIES, { value: '__custom__', label: 'Custom category…' }],
    [],
  )

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    const clientErrors = validate(form)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      type: form.type,
      category:
        form.category === '__custom__'
          ? form.customCategory?.trim() || null
          : form.category || null,
      date: form.date,
    }

    try {
      await onSubmit(payload)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      } else {
        setServerError(getErrorMessage(error, "We couldn't save this transaction. Please check your information and try again."))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {serverError}
        </motion.p>
      )}

      <fieldset>
        <legend className="sr-only">Transaction type</legend>
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-stone-200 bg-stone-100/70 p-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
          {TRANSACTION_TYPES.map((type) => {
            const active = form.type === type.value
            const Icon = type.value === 'income' ? ArrowUpRight : ArrowDownRight
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setField('type', type.value)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-150 ${
                  active
                    ? type.value === 'income'
                      ? 'bg-white text-emerald-700 shadow-sm dark:bg-panel-dark dark:text-emerald-300'
                      : 'bg-white text-rose-700 shadow-sm dark:bg-panel-dark dark:text-rose-300'
                    : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {type.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Title"
          placeholder="e.g. Monthly salary"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          error={errors.title}
          autoComplete="off"
        />
        <Input
          label="Amount (৳)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setField('amount', e.target.value)}
          error={errors.amount}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => setField('category', e.target.value)}
          options={categoryOptions}
          error={errors.category}
        />
        {form.category === '__custom__' && (
          <Input
            label="Custom category"
            placeholder="e.g. Rent"
            value={form.customCategory ?? ''}
            onChange={(e) => setField('customCategory', e.target.value)}
            error={errors.category}
            maxLength={100}
          />
        )}
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          error={errors.date}
          max={todayISO()}
        />
      </div>

      {form.category === '' && (
        <p className="text-[13px] text-stone-400 dark:text-stone-500">
          Tip: a category helps you understand where your money goes.
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5 border-t border-stone-100 pt-5 dark:border-white/[0.06]">
        <Button variant="secondary" onClick={onCancel} disabled={submitting} icon={X}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} className="min-w-36">
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}