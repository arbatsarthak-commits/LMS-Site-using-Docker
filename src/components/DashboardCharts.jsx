import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#2563eb', '#0ea5e9', '#22c55e', '#f97316', '#ec4899', '#a855f7']

function fmtMonth(ym) {
  if (!ym || typeof ym !== 'string') return ym
  const p = ym.split('-')
  if (p.length < 2) return ym
  const y = Number(p[0])
  const m = Number(p[1])
  if (!y || !m) return ym
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'short', year: '2-digit' })
}

const tooltipStyle = {
  background: 'rgba(255,255,255,0.95)',
  border: '1px solid rgba(99,102,241,0.25)',
  borderRadius: 12,
  boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
}

export default function DashboardCharts({ studentsPerCourse = [], monthlyRegistrations = [], revenueByCourse = [] }) {
  const barData = useMemo(
    () => studentsPerCourse.map((r) => ({ name: r.course, students: r.count })),
    [studentsPerCourse],
  )

  const lineData = useMemo(
    () =>
      monthlyRegistrations.map((r) => ({
        month: r.month,
        label: fmtMonth(r.month),
        registrations: r.count,
      })),
    [monthlyRegistrations],
  )

  const pieData = useMemo(() => revenueByCourse.map((r) => ({ name: r.name, value: r.value })), [revenueByCourse])

  const hasBar = barData.length > 0
  const hasLine = lineData.length > 0
  const hasPie = pieData.length > 0

  return (
    <div className="analyticsChartsGrid">
      <div className="analyticsChartCard card glassCard">
        <h3 className="analyticsChartTitle">Students per course</h3>
        <p className="analyticsChartSub">Enrollment distribution</p>
        <div className="analyticsChartInner">
          {hasBar ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} interval={0} angle={-18} textAnchor="end" height={56} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} allowDecimals={false} width={36} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [v, 'Students']}
                  labelFormatter={(l) => `Course: ${l}`}
                />
                <Bar dataKey="students" fill="url(#barGrad)" radius={[8, 8, 0, 0]} name="Students" maxBarSize={48} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="analyticsChartEmpty">No student enrollment data</p>
          )}
        </div>
      </div>

      <div className="analyticsChartCard card glassCard">
        <h3 className="analyticsChartTitle">Monthly student registrations</h3>
        <p className="analyticsChartSub">New students by month</p>
        <div className="analyticsChartInner">
          {hasLine ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,99,235,0.12)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} allowDecimals={false} width={32} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [v, 'Registrations']}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.month ? `Month: ${payload[0].payload.month}` : '')}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="analyticsChartEmpty">No registration timeline yet</p>
          )}
        </div>
      </div>

      <div className="analyticsChartCard analyticsChartCard--wide card glassCard">
        <h3 className="analyticsChartTitle">Revenue by course</h3>
        <p className="analyticsChartSub">Payment totals (₹)</p>
        <div className="analyticsChartInner analyticsChartInner--pie">
          {hasPie ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={48}
                  paddingAngle={2}
                  label={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} stroke="rgba(255,255,255,0.9)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="analyticsChartEmpty">No payment data for chart</p>
          )}
        </div>
      </div>
    </div>
  )
}
