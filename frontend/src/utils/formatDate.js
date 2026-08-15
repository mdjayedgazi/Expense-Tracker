const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
})

const monthShortFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
})

/**
 * "2026-08-16" -> "16 Aug 2026"
 */
export function formatDate(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}

/**
 * "2026-08-16" -> "Aug 2026"
 */
export function formatMonth(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return '—'
  return monthFormatter.format(date)
}

/**
 * "2026-08-16" -> "Aug"
 */
export function formatMonthShort(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : value
  if (Number.isNaN(date.getTime())) return '—'
  return monthShortFormatter.format(date)
}

/**
 * Today's date as "YYYY-MM-DD" (local time), for date inputs.
 */
export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}