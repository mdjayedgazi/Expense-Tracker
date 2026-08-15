import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Receipt } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart'
import CategoryDonut from '../components/charts/CategoryDonut'
import MonthlyBar from '../components/charts/MonthlyBar'
import { TransactionCard, TransactionRow } from '../components/transactions/TransactionItems'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { useTransactions } from '../hooks/useTransactions'
import { getErrorMessage } from '../utils/errors'
import { formatCurrency } from '../utils/formatCurrency'
import { computeCategoryBreakdown, computeMonthlySeries, computeSummary } from '../utils/statistics'
import { getCategoryMeta } from '../utils/constants'

export default function Dashboard() {
  const { transactions, loading, error, fetchAll } = useTransactions()

  useEffect(() => {
    fetchAll().catch(() => {})
  }, [fetchAll])

  const summary = useMemo(() => computeSummary(transactions), [transactions])
  const monthly = useMemo(() => computeMonthlySeries(transactions, 6), [transactions])
  const categories = useMemo(() => computeCategoryBreakdown(transactions), [transactions])
  const recent = useMemo(() => [...transactions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5), [transactions])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
              <Skeleton className="mb-2 h-3.5 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
          <div className="card p-5">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="mx-auto h-48 w-48 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState
          title="We could not load your dashboard"
          message={getErrorMessage(error)}
          onRetry={() => fetchAll().catch(() => {})}
        />
      </div>
    )
  }

  const hasData = summary.count > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
        <StatCard type="balance" value={formatCurrency(summary.balance)} index={0} />
        <StatCard type="income" value={formatCurrency(summary.income)} index={1} />
        <StatCard type="expense" value={formatCurrency(summary.expense)} index={2} />
        <StatCard type="count" value={summary.count} index={3} />
      </div>

      {hasData ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="card p-5 lg:col-span-2" aria-label="Income vs expense">
              <header className="mb-2">
                <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Income vs Expense
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Last 6 months
                </p>
              </header>
              <IncomeExpenseChart data={monthly} />
            </section>

            <section className="card p-5" aria-label="Expense by category">
              <header className="mb-4">
                <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Expense by Category
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  Where your money went
                </p>
              </header>
              {categories.length > 0 ? (
                <>
                  <CategoryDonut data={categories} />
                  <ul className="mt-4 space-y-1.5">
                    {categories.slice(0, 5).map((item) => {
                      const meta = getCategoryMeta(item.name)
                      return (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-2 text-[13px]"
                        >
                          <span className="flex min-w-0 items-center gap-2 text-stone-500 dark:text-stone-400">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: meta.chart }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="font-medium tabular-nums text-stone-700 dark:text-stone-200">
                            {formatCurrency(item.value)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              ) : (
                <p className="py-10 text-center text-sm text-stone-400 dark:text-stone-500">
                  No expenses yet
                </p>
              )}
            </section>
          </div>

          <section className="card p-5" aria-label="Monthly spending">
            <header className="mb-2">
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                Monthly Spending
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Income and expenses per month
              </p>
            </header>
            <MonthlyBar data={monthly} />
          </section>
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Start tracking your income and expenses today. It only takes a moment."
            action={
              <Link to="/transactions/new">
                <Button icon={Plus}>Add your first transaction</Button>
              </Link>
            }
          />
        </div>
      )}

      <section aria-label="Recent transactions">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Recent transactions
          </h2>
          {summary.count > 0 && (
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {recent.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 text-left dark:border-white/[0.05]">
                    <th scope="col" className="py-2.5 pl-5 pr-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Date
                    </th>
                    <th scope="col" className="py-2.5 pr-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Title
                    </th>
                    <th scope="col" className="hidden py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 sm:table-cell">
                      Category
                    </th>
                    <th scope="col" className="py-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Type
                    </th>
                    <th scope="col" className="py-2.5 pl-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((transaction, index) => (
                    <TransactionRow key={transaction.id} transaction={transaction} index={index} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 md:hidden">
              {recent.map((transaction, index) => (
                <TransactionCard key={transaction.id} transaction={transaction} index={index} />
              ))}
            </div>
          </>
        ) : (
          !hasData && (
            <p className="py-6 text-center text-sm text-stone-400 dark:text-stone-500">
              Your transactions will appear here.
            </p>
          )
        )}
      </section>
    </div>
  )
}