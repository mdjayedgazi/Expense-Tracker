import { useTheme } from '../../hooks/useTheme'

/**
 * Chart colors that adapt to the active theme.
 */
export function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return {
    dark,
    tick: dark ? '#78716c' : '#a8a29e',
    grid: dark ? 'rgba(255,255,255,0.07)' : '#e7e5e4',
    cursor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(28,25,23,0.05)',
    income: '#5da48f',
    expense: '#c4707c',
  }
}

/**
 * Minimal floating tooltip used by all charts.
 */
export function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-stone-200/80 bg-white px-3 py-2 shadow-lift dark:border-white/10 dark:bg-panel-dark">
      {label && (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-1.5 text-[13px]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.payload?.fill }}
              aria-hidden="true"
            />
            <span className="capitalize text-stone-500 dark:text-stone-400">
              {entry.name}:
            </span>
            <span className="font-medium text-stone-800 dark:text-stone-100">
              {formatter ? formatter(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}