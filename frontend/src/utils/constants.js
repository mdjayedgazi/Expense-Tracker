import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Wallet,
} from 'lucide-react'

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Salary',
  'Education',
  'Health',
  'Other',
]

const CATEGORY_META = [
  { name: 'Food', icon: UtensilsCrossed, tint: 'amber' },
  { name: 'Transport', icon: Car, tint: 'sky' },
  { name: 'Shopping', icon: ShoppingBag, tint: 'violet' },
  { name: 'Bills', icon: Receipt, tint: 'slate' },
  { name: 'Entertainment', icon: Clapperboard, tint: 'fuchsia' },
  { name: 'Salary', icon: Briefcase, tint: 'emerald' },
  { name: 'Education', icon: GraduationCap, tint: 'blue' },
  { name: 'Health', icon: HeartPulse, tint: 'rose' },
  { name: 'Other', icon: Wallet, tint: 'stone' },
]

/**
 * Soft, muted color tokens per category. Each has:
 * { icon, tintBg, tintText, tintIcon, chart }
 */
export function getCategoryMeta(category) {
  const fallback = CATEGORY_META[CATEGORY_META.length - 1]
  const meta =
    CATEGORY_META.find(
      (c) => c.name.toLowerCase() === String(category ?? '').toLowerCase(),
    ) ?? fallback

  const tints = {
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-300',
      iconClass: 'text-amber-600 dark:text-amber-400',
      chart: '#d6a35c',
    },
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-500/10',
      text: 'text-sky-700 dark:text-sky-300',
      iconClass: 'text-sky-600 dark:text-sky-400',
      chart: '#5b8fc7',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      text: 'text-violet-700 dark:text-violet-300',
      iconClass: 'text-violet-600 dark:text-violet-400',
      chart: '#8b7ec8',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-500/10',
      text: 'text-slate-600 dark:text-slate-300',
      iconClass: 'text-slate-500 dark:text-slate-400',
      chart: '#8a93a6',
    },
    fuchsia: {
      bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
      text: 'text-fuchsia-700 dark:text-fuchsia-300',
      iconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
      chart: '#b46e9c',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      chart: '#5da48f',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-300',
      iconClass: 'text-blue-600 dark:text-blue-400',
      chart: '#5b8cc4',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-300',
      iconClass: 'text-rose-600 dark:text-rose-400',
      chart: '#c4707c',
    },
    stone: {
      bg: 'bg-stone-100 dark:bg-stone-500/10',
      text: 'text-stone-600 dark:text-stone-300',
      iconClass: 'text-stone-500 dark:text-stone-400',
      chart: '#a8a29e',
    },
  }

  return { name: meta.name, icon: meta.icon, ...tints[meta.tint] }
}

export const TYPE_META = {
  income: {
    label: 'Income',
    icon: 'arrow-up',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    chart: '#5da48f',
  },
  expense: {
    label: 'Expense',
    icon: 'arrow-down',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    chart: '#c4707c',
  },
}

export const PAGE_SIZE = 10

export const TOAST_DURATION = 3500