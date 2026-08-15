import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrencyCompact } from '../../utils/formatCurrency'
import { useChartTheme, ChartTooltip } from './ChartTheme'

export default function MonthlyBar({ data }) {
  const theme = useChartTheme()

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.tick, fontSize: 12 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.tick, fontSize: 11 }}
            tickFormatter={formatCurrencyCompact}
            width={56}
          />
          <Tooltip
            cursor={{ fill: theme.cursor }}
            content={<ChartTooltip formatter={formatCurrencyCompact} />}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill={theme.income}
            radius={[5, 5, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill={theme.expense}
            radius={[5, 5, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}