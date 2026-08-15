import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrencyCompact } from '../../utils/formatCurrency'
import { useChartTheme, ChartTooltip } from './ChartTheme'

export default function IncomeExpenseChart({ data }) {
  const theme = useChartTheme()

  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.income} stopOpacity={0.22} />
              <stop offset="100%" stopColor={theme.income} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.expense} stopOpacity={0.22} />
              <stop offset="100%" stopColor={theme.expense} stopOpacity={0} />
            </linearGradient>
          </defs>

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
            cursor={{ stroke: theme.tick, strokeWidth: 1, strokeDasharray: '3 3' }}
            content={<ChartTooltip formatter={formatCurrencyCompact} />}
          />

          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={theme.income}
            strokeWidth={2}
            fill="url(#gradIncome)"
            dot={false}
            activeDot={{ r: 3.5 }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke={theme.expense}
            strokeWidth={2}
            fill="url(#gradExpense)"
            dot={false}
            activeDot={{ r: 3.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}