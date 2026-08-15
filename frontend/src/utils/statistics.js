/**
 * Derived dashboard statistics, computed client-side from the
 * authenticated user's transactions.
 */
export function computeSummary(transactions) {
  let income = 0
  let expense = 0

  for (const t of transactions) {
    if (t.type === 'income') income += Number(t.amount) || 0
    else expense += Number(t.amount) || 0
  }

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length,
  }
}

/**
 * Aggregate income/expense by calendar month.
 * Returns the last `months` months (oldest first), including months
 * with no transactions.
 */
export function computeMonthlySeries(transactions, months = 6) {
  const now = new Date()
  const buckets = []

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString('en-GB', { month: 'short' }),
      income: 0,
      expense: 0,
    })
  }

  for (const t of transactions) {
    const [year, month] = String(t.date).split('-').map(Number)
    const key = `${year}-${month - 1}`
    const bucket = buckets.find((b) => b.key === key)
    if (!bucket) continue
    if (t.type === 'income') bucket.income += Number(t.amount) || 0
    else bucket.expense += Number(t.amount) || 0
  }

  return buckets
}

/**
 * Expense totals grouped by category, sorted descending.
 * Returns { name, value, meta } entries.
 */
export function computeCategoryBreakdown(transactions) {
  const byCategory = new Map()

  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const category = t.category || 'Other'
    byCategory.set(category, (byCategory.get(category) ?? 0) + (Number(t.amount) || 0))
  }

  return [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}