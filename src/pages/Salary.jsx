import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Tabs from '../components/Tabs'
import EmptyState from '../components/EmptyState.jsx'
import { useApp } from '../context/appContext'
import { api } from '../api/client.js'

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'front_office', label: 'Front Office Executive' },
  { value: 'lab_instructor', label: 'Lab Instructor' },
]

const PAYMENT_OPTIONS = [
  { value: 'per_student_incentive', label: 'Per-student incentive (auto)' },
  { value: 'fixed_monthly', label: 'Fixed monthly' },
  { value: 'hybrid', label: 'Hybrid' },
]

function roleLabel(role) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label || role
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Salary() {
  const {
    token,
    canAdmin,
    courses,
    staff,
    staffLoading,
    staffError,
    refreshStaff,
    addStaffMember,
    deleteStaffMember,
    notifySuccess,
    notifyError,
  } = useApp()

  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'staff' ? 'staff' : 'salary'

  const setTab = useCallback(
    (id) => {
      if (id === 'staff') setSearchParams({ tab: 'staff' })
      else setSearchParams({})
    },
    [setSearchParams],
  )

  /* ——— Staff form ——— */
  const [stName, setStName] = useState('')
  const [stRole, setStRole] = useState('teacher')
  const [stCourse, setStCourse] = useState('')
  const [stPay, setStPay] = useState('per_student_incentive')
  const [stBase, setStBase] = useState('0')
  const [stSaving, setStSaving] = useState(false)

  /* ——— Salary report ——— */
  const [month, setMonth] = useState(currentMonth)
  const [allTime, setAllTime] = useState(false)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [salaryRows, setSalaryRows] = useState([])
  const [totalPayout, setTotalPayout] = useState(0)
  const [reportMeta, setReportMeta] = useState({ month: 'all', staffCount: 0 })
  const [salaryLoading, setSalaryLoading] = useState(false)
  const [salaryError, setSalaryError] = useState('')

  const loadSalary = useCallback(async () => {
    if (!token || !canAdmin) return
    setSalaryError('')
    setSalaryLoading(true)
    try {
      const res = await api.calculateSalary(token, {
        month: allTime ? undefined : month,
        role: roleFilter || undefined,
      })
      const rows = Array.isArray(res?.salaries) ? res.salaries : Array.isArray(res?.data) ? res.data : []
      setSalaryRows(rows)
      setTotalPayout(Number(res?.totalPayout ?? 0))
      setReportMeta({
        month: res?.month ?? 'all',
        staffCount: Number(res?.staffCount ?? rows.length),
      })
    } catch (e) {
      setSalaryError(e?.message || 'Failed to load salary calculation')
      setSalaryRows([])
      setTotalPayout(0)
      notifyError(e?.message || 'Salary API failed')
    } finally {
      setSalaryLoading(false)
    }
  }, [token, canAdmin, month, allTime, roleFilter, notifyError])

  useEffect(() => {
    if (tab === 'salary' && token && canAdmin) loadSalary()
  }, [tab, token, canAdmin, loadSalary])

  useEffect(() => {
    if (tab === 'staff' && token && canAdmin) refreshStaff()
  }, [tab, token, canAdmin, refreshStaff])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return salaryRows
    return salaryRows.filter((r) => (r.name || '').toLowerCase().includes(q))
  }, [salaryRows, search])

  async function submitStaff(e) {
    e.preventDefault()
    if (!stName.trim()) {
      notifyError('Enter staff name')
      return
    }
    setStSaving(true)
    try {
      const res = await addStaffMember({
        name: stName.trim(),
        role: stRole,
        courseAssigned: stCourse,
        paymentType: stPay,
        baseSalary: parseFloat(stBase) || 0,
      })
      if (!res.ok) {
        notifyError(res.message || 'Failed to add staff')
        return
      }
      notifySuccess('Staff member added')
      setStName('')
      setStBase('0')
    } finally {
      setStSaving(false)
    }
  }

  function exportCsv() {
    if (!filteredRows.length) return
    const header = 'Name,Role,Students handled,Incentive salary (₹)'
    const lines = filteredRows.map(
      (r) => `"${String(r.name).replace(/"/g, '""')}",${r.role},${r.totalStudents},${r.totalSalary}`,
    )
    const csv = [header, ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salary-report-${reportMeta.month}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notifySuccess('CSV downloaded')
  }

  function printReport() {
    window.print()
  }

  if (!canAdmin) {
    return (
      <div className="card glassCard">
        <h2 className="cardTitle">Salary management</h2>
        <p className="cardBody">Only administrators can manage staff and salary calculations.</p>
      </div>
    )
  }

  return (
    <div className="dashPage">
      <section className="sectionIntro">
        <h2 className="sectionKicker">Employee &amp; salary</h2>
        <p className="sectionLead">
          Maintain teachers, front office, and lab instructors. Incentives follow institute rules and are derived from
          each student&apos;s course and assigned staff — no manual totals required. Works with Docker via the{' '}
          <code>/api</code> proxy to the backend service.
        </p>
      </section>

      <div className="card glassCard" style={{ marginBottom: 14 }}>
        <Tabs
          tabs={[
            { id: 'salary', label: 'Salary management' },
            { id: 'staff', label: 'Manage staff' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'staff' ? (
        <>
          <div className="card glassCard" style={{ marginBottom: 14 }}>
            <h2 className="cardTitle">Add employee</h2>
            <p className="cardBody">
              Names must match how they appear on student records (Teacher / Front office / Lab instructor) for payouts
              to aggregate correctly.
            </p>
            <form className="form" onSubmit={submitStaff}>
              <div className="field">
                <label className="label" htmlFor="st-name">
                  Name
                </label>
                <input
                  id="st-name"
                  className="input"
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="st-role">
                  Role
                </label>
                <select id="st-role" className="input" value={stRole} onChange={(e) => setStRole(e.target.value)}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="st-course">
                  Course assigned (reference)
                </label>
                <select id="st-course" className="input" value={stCourse} onChange={(e) => setStCourse(e.target.value)}>
                  <option value="">Any / multiple</option>
                  {(courses || []).map((c) => (
                    <option key={c.id ?? c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="st-pay">
                  Payment type
                </label>
                <select id="st-pay" className="input" value={stPay} onChange={(e) => setStPay(e.target.value)}>
                  {PAYMENT_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="st-base">
                  Base salary (₹, optional)
                </label>
                <input
                  id="st-base"
                  className="input"
                  value={stBase}
                  onChange={(e) => setStBase(e.target.value)}
                  inputMode="decimal"
                />
              </div>
              <div className="btnRow">
                <button className="btn btnGradient btnRipple" type="submit" disabled={stSaving}>
                  {stSaving ? 'Saving…' : 'Add staff'}
                </button>
                <button className="btn btnNeutral" type="button" onClick={refreshStaff} disabled={staffLoading}>
                  Refresh
                </button>
              </div>
            </form>
          </div>

          <div className="card glassCard printableArea">
            <h2 className="cardTitle">Staff directory</h2>
            {staffLoading ? <p className="cardBody">Loading…</p> : null}
            {staffError ? (
              <p className="cardBody" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                {staffError}
              </p>
            ) : null}
            {!staffLoading && !staff.length ? (
              <EmptyState
                title="No staff yet"
                hint="Add teachers, front office executives, and lab instructors above."
                icon="👥"
              />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Course assigned</th>
                    <th>Payment type</th>
                    <th>Base (₹)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{roleLabel(s.role)}</td>
                      <td>{s.courseAssigned || '—'}</td>
                      <td>{PAYMENT_OPTIONS.find((p) => p.value === s.paymentType)?.label || s.paymentType}</td>
                      <td>{Number(s.baseSalary || 0).toFixed(0)}</td>
                      <td>
                        <button
                          className="btn btnDanger"
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Remove ${s.name} from staff?`)) return
                            const res = await deleteStaffMember(s.id)
                            if (!res.ok) notifyError(res.message || 'Delete failed')
                            else notifySuccess('Staff removed')
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="summaryGrid dashStatGrid" style={{ marginBottom: 14 }}>
            <div className="summaryCard statCard statCard--a dashStatCard">
              <div className="summaryLabel">Total payout (incentives)</div>
              <div className="summaryValue">₹{totalPayout.toLocaleString()}</div>
              <div className="statCardHint">{allTime ? 'All registrations' : `Month: ${month}`}</div>
            </div>
            <div className="summaryCard statCard statCard--b dashStatCard">
              <div className="summaryLabel">Staff in report</div>
              <div className="summaryValue">{reportMeta.staffCount}</div>
              <div className="statCardHint">After role filter</div>
            </div>
          </div>

          <div className="card glassCard printableArea">
            <h2 className="cardTitle">Incentive calculation</h2>
            <p className="cardBody">
              Based on students linked to each staff name. MSCIT / Module / DCFA–DGDA / ₹149 rules are applied on the
              server (<code>calculate_salary.php</code>). Monthly view uses each student&apos;s{' '}
              <strong>registration date</strong>.
            </p>

            <div className="btnRow" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
              <label className="pill" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={allTime} onChange={(e) => setAllTime(e.target.checked)} />
                All time
              </label>
              <input
                type="month"
                className="input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={allTime}
                style={{ maxWidth: 200 }}
              />
              <select
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ maxWidth: 240 }}
              >
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Search name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 220 }}
              />
              <button className="btn btnNeutral" type="button" onClick={loadSalary} disabled={salaryLoading}>
                {salaryLoading ? 'Loading…' : 'Recalculate'}
              </button>
              <button className="btn btnSuccess" type="button" onClick={exportCsv} disabled={!filteredRows.length}>
                Export CSV
              </button>
              <button className="btn btnNeutral" type="button" onClick={printReport} disabled={!filteredRows.length}>
                Print report
              </button>
            </div>

            {salaryError ? (
              <p className="cardBody" style={{ color: 'var(--danger)', fontWeight: 700 }}>
                {salaryError}
              </p>
            ) : null}

            {!salaryLoading && !filteredRows.length && !salaryError ? (
              <EmptyState
                title="No salary data"
                hint="Add students with front office, lab, and teacher names matching your staff directory."
                icon="💰"
              />
            ) : null}

            {filteredRows.length > 0 ? (
              <table className="table salaryReportTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Students handled</th>
                    <th>Salary (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, idx) => (
                    <tr key={`${r.name}-${r.role}-${idx}`}>
                      <td>{r.name}</td>
                      <td>{r.role}</td>
                      <td>{r.totalStudents}</td>
                      <td>
                        <strong>₹{Number(r.totalSalary).toLocaleString()}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </>
      )}

      <style>{`
        @media print {
          .sidebar, .topNav, .tabsRow, .btnRow, .sectionIntro, .toastStack { display: none !important; }
          .printableArea { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}
