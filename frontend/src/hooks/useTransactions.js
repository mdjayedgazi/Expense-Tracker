import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  filterTransactions,
  getTransactions,
  updateTransaction,
} from '../services/transactionApi'

/**
 * Central data hook for transactions.
 *
 * - fetchAll: GET /transactions (dashboard, list page)
 * - fetchFiltered: GET /transactions/filter (list page filters)
 * - create / update / remove: CRUD with optimistic-ish UI refresh
 *
 * State: { transactions, loading, error, refresh }
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async (fetcher) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const { data } = await fetcher()
      if (id === requestId.current) {
        setTransactions(Array.isArray(data) ? data : [])
      }
      return data
    } catch (err) {
      if (id === requestId.current) setError(err)
      throw err
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  const fetchAll = useCallback(() => load(getTransactions), [load])
  const fetchFiltered = useCallback(
    (params) => load(() => filterTransactions(params)),
    [load],
  )

  const create = useCallback(
    async (payload) => {
      const { data } = await createTransaction(payload)
      setTransactions((current) => [data, ...current])
      return data
    },
    [],
  )

  const update = useCallback(
    async (id, payload) => {
      const { data } = await updateTransaction(id, payload)
      setTransactions((current) =>
        current.map((t) => (t.id === id ? data : t)),
      )
      return data
    },
    [],
  )

  const remove = useCallback(async (id) => {
    await deleteTransaction(id)
    setTransactions((current) => current.filter((t) => t.id !== id))
  }, [])

  const clear = useCallback(() => {
    requestId.current += 1
    setTransactions([])
    setError(null)
  }, [])

  useEffect(() => clear, [clear])

  const value = useMemo(
    () => ({
      transactions,
      loading,
      error,
      fetchAll,
      fetchFiltered,
      create,
      update,
      remove,
    }),
    [transactions, loading, error, fetchAll, fetchFiltered, create, update, remove],
  )

  return value
}