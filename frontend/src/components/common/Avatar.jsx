export default function Avatar({ name, size = 'md' }) {
  const initials = (name ?? '?')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizes = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-[13px]',
    lg: 'h-12 w-12 text-[15px]',
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 ${sizes[size]}`}
    >
      {initials}
    </span>
  )
}