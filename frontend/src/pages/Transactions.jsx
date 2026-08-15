import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, Receipt, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { TransactionCard, TransactionRow } from '../components/transactions/TransactionItems'
import FilterPanel from '../components/transactions/FilterPanel'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import ViewDialog from '../components/transactions/ViewDialog'
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'
import { getErrorMessage } from '../utils/errors'
import { PAGE_SIZE } from '../utils/constants'

const EMPTY_FILTERS = { type: '', category: '', minimum_amount: '', maximum_amount: '' }

export default function Transactions() {
  const { transactions, loading, error, fetchAll, fetchFiltered, remove } = useTransactions()
  const toast = useToast()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const searchTimer = useRef(null)

  const loadAll = () => {
    setFilters(EMPTY_FILTERS)
    setHasActiveFilters(false)
    fetchAll().catch(() => {})
  }

  useEffect(() => {
    fetchAll().catch(() => {})
  }, [fetchAll])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 250)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  const visible = useMemo(() => {
    if (!debouncedSearch) return transactions
    const query = debouncedSearch.toLowerCase()
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.category ?? '').toLowerCase().includes(query),
    )
  }, [transactions, debouncedSearch])

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(
    () => visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [visible, safePage],
  )

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  async function applyFilters(nextFilters) {
    setFilters(nextFilters)
    const hasFilters = Object.values(nextFilters).some((v) => v !== '' && v != null)
    setHasActiveFilters(hasFilters)
    setPage(1)
    if (hasFilters) {
      await fetchFiltered(nextFilters).catch(() => {})
    } else {
      await fetchAll().catch(() => {})
    }
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
    setHasActiveFilters(false)
    setPage(1)
    fetchAll().catch(() => {})
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await remove(deleting.id)
      toast.success('Transaction deleted')
      setDeleting(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'We could not delete this transaction.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category…"
            aria-label="Search transactions"
            className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-9 text-sm text-stone-900 shadow-sm transition-all duration-150 placeholder:text-stone-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none dark:border-white/10 dark:bg-panel-dark dark:text-stone-100 dark:placeholder:text-stone-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/[0.07]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={hasActiveFilters ? 'primary' : 'secondary'}
            icon={SlidersHorizontal}
            onClick={() => setFilterPanelOpen((v) => !v)}
            aria-expanded={filterPanelOpen}
          >
            Filters
            {hasActiveFilters && (
              <span
                className="ml-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white dark:bg-indigo-400 dark:text-indigo-950"
                aria-label="Filters active"
              >
                1
              </span>
            )}
          </Button>
          <Link to="/transactions/new">
            <Button icon={Plus}>Add</Button>
          </Link>
        </div>
      </div>

      {/* Filter panel (inline on desktop, drawer on mobile) */}
      {filterPanelOpen && (
        <div className="hidden lg:block">
          <FilterPanel
            open={false}
            onClose={() => setFilterPanelOpen(false)}
            filters={filters}
            onApply={applyFilters}
            onReset={resetFilters}
            disabled={loading}
          />
        </div>
      )}

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterPanelOpen && (
          <FilterPanel
            open
            onClose={() => setFilterPanelOpen(false)}
            filters={filters}
            onApply={applyFilters}
            onReset={resetFilters}
            disabled={loading}
          />
        )}
      </AnimatePresence>

      {/* Result meta */}
      <p className="text-[13px] text-stone-400 dark:text-stone-500" aria-live="polite">
        {loading
          ? 'Loading transactions…'
          : `${visible.length} transaction${visible.length === 1 ? '' : 's'}${
              debouncedSearch || hasActiveFilters ? ' found' : ''
            }`}
      </p>

      {/* Content */}
      {loading ? (
        <TransactionTableSkeleton />
      ) : error ? (
        <div className="card">
          <ErrorState
            title="We could not load your transactions"
            message={getErrorMessage(error)}
            onRetry={loadAll}
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title={
              debouncedSearch || hasActiveFilters
                ? 'No matching transactions'
                : 'No transactions yet'
            }
            description={
              debouncedSearch || hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Start tracking your income and expenses today.'
            }
            action={
              debouncedSearch || hasActiveFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('')
                    resetFilters()
                  }}
                >
                  Clear search & filters
                </Button>
              ) : (
                <Link to="/transactions/new">
                  <Button icon={Plus}>Add transaction</Button>
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
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
                  <th scope="col" className="py-2.5 px-3 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Amount
                  </th>
                  <th scope="col" className="py-2.5 pl-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {paged.map((transaction, index) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      onView={setViewing}
                      onEdit={(t) => navigate(`/transactions/${t.id}/edit`)}
                      onDelete={setDeleting}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            <AnimatePresence initial={false}>
              {paged.map((transaction, index) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                  onView={setViewing}
                  onEdit={(t) => navigate(`/transactions/${t.id}/edit`)}
                  onDelete={setDeleting}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-[13px] text-stone-400 dark:text-stone-500">
                Page {safePage} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ViewDialog
        transaction={viewing}
        onClose={() => setViewing(null)}
        onEdit={(t) => {
          setViewing(null)
          navigate(`/transactions/${t.id}/edit`)
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete transaction?"
        description={
          deleting
            ? `"${deleting.title}" will be permanently removed. This action cannot be undone.`
            : undefined
        }
      />
    </div>
  )
}

function TransactionTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="card hidden overflow-hidden md:block">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-stone-100 px-5 py-3.5 last:border-0 dark:border-white/[0.05]"
          >
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-3.5 flex-1 max-w-52" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3.5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}