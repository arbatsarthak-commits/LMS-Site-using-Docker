import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'
import { api } from '../api/client.js'
import EmptyState from '../components/EmptyState.jsx'

const DashboardCharts = React.lazy(() => import('../components/DashboardCharts.jsx'))

function TrendBadge({ value, suffix = '%' }) {
  if (value == null || !Number.isFinite(Number(value))) return null
  const n = Number(value)
  if (n === 0) {
    return <span className="trendBadge trendBadge--flat">0{suffix}</span>
  }
  const up = n > 0
  return (
    <span className={`trendBadge ${up ? 'trendBadge--up' : 'trendBadge--down'}`}>
      {up ? '↑' : '↓'} {Math.abs(n).toFixed(1)}
      {suffix}
    </span>
  )
}

function StatSkeleton() {
  return <div className="dashStatSkeleton" aria-hidden />
}

function formatActivityTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

function activityIcon(type) {
  if (type === 'payment') return '💳'
  if (type === 'registration') return '📘'
  return '🎓'
}

const DEFAULT_STATS = {
  totalStudents: 0,
  totalRevenue: 0,
  totalCourses: 0,
  totalStaff: 0,
  monthlyGrowthPercent: 0,
  studentTrendPercent: 0,
  revenueTrendPercent: 0,
  courseTrendPercent: 0,
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { token, canAdmin, notifyError } = useApp()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [studentsPerCourse, setStudentsPerCourse] = useState([])
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([])
  const [revenueByCourse, setRevenueByCourse] = useState([])
  const [activity, setActivity] = useState([])

  const loadOverview = useCallback(async () => {
    if (!token || !canAdmin) {
      setLoading(false)
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await api.dashboardOverview(token)
      if (!res?.ok) {
        throw new Error(res?.error || 'Dashboard failed')
      }
      setStats({ ...DEFAULT_STATS, ...(res.stats || {}) })
      setStudentsPerCourse(Array.isArray(res.studentsPerCourse) ? res.studentsPerCourse : [])
      setMonthlyRegistrations(Array.isArray(res.monthlyRegistrations) ? res.monthlyRegistrations : [])
      setRevenueByCourse(Array.isArray(res.revenueByCourse) ? res.revenueByCourse : [])
      setActivity(Array.isArray(res.activity) ? res.activity : [])
    } catch (e) {
      const msg = e?.message || 'Failed to load dashboard'
      setError(msg)
      notifyError(msg)
      setStats(DEFAULT_STATS)
      setStudentsPerCourse([])
      setMonthlyRegistrations([])
      setRevenueByCourse([])
      setActivity([])
    } finally {
      setLoading(false)
    }
  }, [token, canAdmin, notifyError])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  const chartsData = useMemo(
    () => ({ studentsPerCourse, monthlyRegistrations, revenueByCourse }),
    [studentsPerCourse, monthlyRegistrations, revenueByCourse],
  )

  if (!canAdmin) {
    return (
      <div className="card glassCard">
        <h2 className="cardTitle">Admin dashboard</h2>
        <p className="cardBody">This analytics view is only available to administrators.</p>
      </div>
    )
  }

  return (
    <div className="dashPage adminAnalyticsPage">
      <header className="analyticsHeader">
        <div>
          <h2 className="sectionKicker">Analytics Overview</h2>
          <p className="sectionLead">
            Live metrics from MySQL via <code>dashboard_overview.php</code> (Docker: browser → <code>/api</code> → backend
            service).
          </p>
        </div>
        <button type="button" className="btn btnNeutral btnSmall" onClick={loadOverview} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </header>

      {error ? (
        <div className="card glassCard analyticsErrorBanner" role="alert">
          <strong>Could not load analytics.</strong> {error}
        </div>
      ) : null}

      <section className="analyticsStatGrid" aria-busy={loading}>
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="summaryCard statCard statCard--a dashStatCard statCardReveal" style={{ animationDelay: '0s' }}>
              <div className="statCardIcon" aria-hidden>
                🎓
              </div>
              <div className="summaryLabel">Total students</div>
              <div className="summaryValue">{stats.totalStudents.toLocaleString()}</div>
              <div className="statCardTrendRow">
                <TrendBadge value={stats.studentTrendPercent} />
                <span className="trendHint">vs last month</span>
              </div>
            </div>
            <div className="summaryCard statCard statCard--b dashStatCard statCardReveal" style={{ animationDelay: '0.06s' }}>
              <div className="statCardIcon" aria-hidden>
                💵
              </div>
              <div className="summaryLabel">Total revenue</div>
              <div className="summaryValue">₹{Number(stats.totalRevenue || 0).toLocaleString()}</div>
              <div className="statCardTrendRow">
                <TrendBadge value={stats.revenueTrendPercent} />
                <span className="trendHint">vs last month</span>
              </div>
            </div>
            <div className="summaryCard statCard statCard--c dashStatCard statCardReveal" style={{ animationDelay: '0.12s' }}>
              <div className="statCardIcon" aria-hidden>
                📚
              </div>
              <div className="summaryLabel">Total courses</div>
              <div className="summaryValue">{stats.totalCourses}</div>
              <div className="statCardTrendRow">
                <span className="trendHint">Catalog size</span>
              </div>
            </div>
            <div className="summaryCard statCard statCard--d dashStatCard statCardReveal" style={{ animationDelay: '0.18s' }}>
              <div className="statCardIcon" aria-hidden>
                👥
              </div>
              <div className="summaryLabel">Total staff</div>
              <div className="summaryValue">{stats.totalStaff}</div>
              <div className="statCardTrendRow">
                <span className="trendHint">Teachers &amp; ops</span>
              </div>
            </div>
            <div className="summaryCard statCard statCard--growth dashStatCard statCardReveal" style={{ animationDelay: '0.24s' }}>
              <div className="statCardIcon" aria-hidden>
                📈
              </div>
              <div className="summaryLabel">Monthly growth</div>
              <div className="summaryValue summaryValue--growth">
                <TrendBadge value={stats.monthlyGrowthPercent} />
              </div>
              <div className="statCardTrendRow">
                <span className="trendHint">New registrations (MoM)</span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="quickActions glassCard analyticsQuickCard">
        <h3 className="sectionKicker sectionKicker--sm">Quick actions</h3>
        <div className="quickActionGrid quickActionGrid--three">
          <button type="button" className="quickAction btnGradient btnRipple" onClick={() => navigate('/students')}>
            <span className="quickActionIcon">➕</span>
            <span>
              <strong>Add student</strong>
              <small>Manage Students</small>
            </span>
          </button>
          <button type="button" className="quickAction btnGradient btnGradient--alt btnRipple" onClick={() => navigate('/courses')}>
            <span className="quickActionIcon">📚</span>
            <span>
              <strong>Add course</strong>
              <small>Catalog &amp; fees</small>
            </span>
          </button>
          <button type="button" className="quickAction btnNeutralSoft btnRipple" onClick={() => navigate('/salary')}>
            <span className="quickActionIcon">💼</span>
            <span>
              <strong>View salary</strong>
              <small>Incentives &amp; staff</small>
            </span>
          </button>
        </div>
        <div className="quickLinksRow">
          <button type="button" className="linkLikeBtn" onClick={() => navigate('/payments')}>
            Reports &amp; payments
          </button>
          <span className="dotSep">·</span>
          <button type="button" className="linkLikeBtn" onClick={() => navigate('/salary?tab=staff')}>
            Manage staff
          </button>
        </div>
      </section>

      <section className="analyticsChartsSection">
        <h3 className="sectionKicker sectionKicker--sm">Performance charts</h3>
        {loading ? (
          <div className="analyticsChartsSkeleton">
            <div className="chartSkeletonBlock" />
            <div className="chartSkeletonBlock" />
            <div className="chartSkeletonBlock chartSkeletonBlock--wide" />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="analyticsChartsSkeleton">
                <div className="chartSkeletonBlock" />
                <div className="chartSkeletonBlock" />
                <div className="chartSkeletonBlock chartSkeletonBlock--wide" />
              </div>
            }
          >
            <DashboardCharts
              studentsPerCourse={chartsData.studentsPerCourse}
              monthlyRegistrations={chartsData.monthlyRegistrations}
              revenueByCourse={chartsData.revenueByCourse}
            />
          </Suspense>
        )}
      </section>

      <div className="analyticsBottomGrid">
        <section className="card glassCard activityTimelineCard">
          <h3 className="cardTitle">Recent activity</h3>
          <p className="cardBody">Students, payments, and course registrations (newest first).</p>
          {loading ? (
            <div className="timelineSkeleton">
              {[1, 2, 3, 4].map((k) => (
                <div key={k} className="timelineSkeletonLine" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <EmptyState title="No activity yet" hint="Add students, record payments, or register courses." icon="📋" />
          ) : (
            <ul className="activityTimeline">
              {activity.map((item, idx) => (
                <li key={`${item.type}-${item.at}-${idx}`} className="activityTimelineItem">
                  <span className="activityTimelineDot" />
                  <div className="activityTimelineBody">
                    <div className="activityTimelineTitle">
                      <span className="activityTimelineIcon" aria-hidden>
                        {activityIcon(item.type)}
                      </span>
                      {item.title}
                    </div>
                    <div className="activityTimelineMeta">{item.subtitle}</div>
                    <time className="activityTimelineTime">{formatActivityTime(item.at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card glassCard">
          <h3 className="cardTitle">Employee &amp; salary</h3>
          <p className="cardBody">
            Staff directory and automated incentives from student assignments. Uses the same backend rules as Salary
            Management.
          </p>
          <div className="btnRow">
            <button type="button" className="btn btnGradient btnRipple" onClick={() => navigate('/salary?tab=staff')}>
              Manage staff
            </button>
            <button type="button" className="btn btnNeutral" onClick={() => navigate('/salary')}>
              Salary report
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
