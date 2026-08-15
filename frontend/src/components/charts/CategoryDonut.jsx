import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryMeta } from '../../utils/constants'
import { formatCurrencyCompact } from '../../utils/formatCurrency'
import { ChartTooltip } from './ChartTheme'

export default function CategoryDonut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) return null

  return (
    <div className="relative mx-auto h-48 w-full max-w-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip formatter={formatCurrencyCompact} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="92%"
            paddingAngle={2.5}
            cornerRadius={4}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={getCategoryMeta(entry.name).chart} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
          Expense
        </span>
        <span className="text-lg font-semibold text-stone-800 dark:text-stone-100">
          {formatCurrencyCompact(total)}
        </span>
      </div>
    </div>
  )
}