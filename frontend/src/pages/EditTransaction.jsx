import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TransactionForm from '../components/transactions/TransactionForm'
import Card from '../components/ui/Card'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { getTransaction } from '../services/transactionApi'
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'
import { getErrorMessage } from '../utils/errors'

export default function EditTransaction() {
  const { id } = useParams()
  const { update } = useTransactions()
  const toast = useToast()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getTransaction(id)
      .then(({ data }) => {
        if (active) setTransaction(data)
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  async function handleSubmit(payload) {
    setSubmitting(true)
    try {
      await update(id, payload)
      toast.success('Transaction updated')
      navigate('/transactions')
    } catch (error) {
      setSubmitting(false)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-72" />
        <Card className="space-y-4 p-5 sm:p-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
        </Card>
      </div>
    )
  }

  if (error || !transaction) {
    const notFound = error?.response?.status === 404
    return (
      <div className="mx-auto max-w-xl">
        <Card>
          <ErrorState
            title={notFound ? 'Transaction not found' : "We couldn't load this transaction"}
            message={
              notFound
                ? 'It may have been deleted, or it does not belong to your account.'
                : getErrorMessage(error)
            }
            onRetry={() => navigate('/transactions')}
          />
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-xl"
    >
      <header className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-white">
          Edit transaction
        </h2>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          Update the details below and save your changes.
        </p>
      </header>

      <Card className="p-5 sm:p-6">
        <TransactionForm
          initialValues={transaction}
          submitLabel="Save changes"
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/transactions')}
        />
      </Card>
    </motion.div>
  )
}