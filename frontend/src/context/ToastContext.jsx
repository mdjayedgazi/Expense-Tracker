import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { TOAST_DURATION } from '../utils/constants'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback((type, message) => {
    const id = ++toastId
    setToasts((current) => [...current.slice(-3), { id, type, message }])
    const timer = setTimeout(() => dismiss(id), TOAST_DURATION)
    timers.current.set(id, timer)
    return id
  }, [dismiss])

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    success: 'border-emerald-200/70 bg-white text-emerald-700 dark:border-emerald-500/20 dark:bg-panel-dark dark:text-emerald-300',
    error: 'border-rose-200/70 bg-white text-rose-700 dark:border-rose-500/20 dark:bg-panel-dark dark:text-rose-300',
    info: 'border-stone-200 bg-white text-stone-700 dark:border-white/10 dark:bg-panel-dark dark:text-stone-200',
  }
  const Icon = { success: CheckCircle2, error: XCircle, info: Info }[toast.type]

  return (
    <motion.button
      layout
      type="button"
      onClick={() => onDismiss(toast.id)}
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm shadow-lift ${styles[toast.type]}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="font-medium">{toast.message}</span>
    </motion.button>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context.toast
}