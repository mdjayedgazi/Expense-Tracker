import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TransactionForm from '../components/transactions/TransactionForm'
import Card from '../components/ui/Card'
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'

export default function AddTransaction() {
  const { create } = useTransactions()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(payload) {
    await create(payload)
    toast.success('Transaction created')
    navigate('/transactions')
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
          Add transaction
        </h2>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
          Record an income or expense. The amount is always positive; the type decides how it counts.
        </p>
      </header>

      <Card className="p-5 sm:p-6">
        <TransactionForm
          submitLabel="Create transaction"
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </Card>
    </motion.div>
  )
}