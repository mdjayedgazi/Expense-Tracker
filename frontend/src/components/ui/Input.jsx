import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  error,
  hint,
  className = '',
  id: providedId,
  type = 'text',
  ...props
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-stone-600 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`h-10 w-full rounded-lg border bg-white px-3.5 text-sm text-stone-900 shadow-sm transition-all duration-150 placeholder:text-stone-400 focus:outline-none dark:bg-panel-dark dark:text-stone-100 dark:placeholder:text-stone-500 ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 dark:border-rose-500/40'
              : 'border-stone-200 hover:border-stone-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:hover:border-white/20'
          } ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-stone-400 dark:text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}