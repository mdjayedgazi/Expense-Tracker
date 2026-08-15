const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Format an amount as Bangladeshi Taka, e.g. ৳ 1,250.00
 */
export function formatCurrency(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '৳ 0.00'
  return `৳ ${currencyFormatter.format(value)}`
}

/**
 * Compact currency, e.g. ৳ 1.25K / ৳ 2M — for chart axes.
 */
export function formatCurrencyCompact(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '৳0'
  if (Math.abs(value) >= 1_000_000) return `৳${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `৳${(value / 1_000).toFixed(1)}K`
  return `৳${value}`
}

/**
 * Format amount without the currency symbol, e.g. "1,250.00".
 */
export function formatAmount(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '0.00'
  return currencyFormatter.format(value)
}