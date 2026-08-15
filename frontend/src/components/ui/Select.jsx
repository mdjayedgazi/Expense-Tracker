import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  error,
  options = [],
  placeholder,
  className = '',
  id: providedId,
  ...props
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-stone-600 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full appearance-none rounded-lg border bg-white px-3.5 pr-9 text-sm text-stone-900 shadow-sm transition-all duration-150 focus:outline-none dark:bg-panel-dark dark:text-stone-100 ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 dark:border-rose-500/40'
              : 'border-stone-200 hover:border-stone-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:hover:border-white/20'
          }`}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled={!props.multiple}>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === 'object' ? option.value : option
            const label = typeof option === 'object' ? option.label : option
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="text-[13px] text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  )
}