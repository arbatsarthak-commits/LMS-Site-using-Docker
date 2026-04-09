import React, { useMemo, useState } from 'react'
import { useApp } from '../context/appContext'

export default function Salary() {
  const { students, facultyList, frontOfficeList, labInstructorList, resetMonthly } = useApp()
  const [baseSalary, setBaseSalary] = useState(5000)

  const rows = useMemo(() => {
    const salaryMap = {}

    students.forEach((s) => {
      if (!salaryMap[s.frontOffice]) salaryMap[s.frontOffice] = 0
      if (!salaryMap[s.labInstructor]) salaryMap[s.labInstructor] = 0
      if (!salaryMap[s.faculty]) salaryMap[s.faculty] = 0

      if (s.course === 'MSCIT') {
        salaryMap[s.frontOffice] += 80
        salaryMap[s.labInstructor] += 80
      } else if (s.course === 'Module') {
        salaryMap[s.frontOffice] += 90
        salaryMap[s.labInstructor] += 90
      } else if (s.course === '149') {
        salaryMap[s.faculty] += 74.5
      } else {
        salaryMap[s.frontOffice] += 400
      }
    })

    return Object.entries(salaryMap)
      .filter(([name]) => name && name !== 'undefined')
      .map(([name, incentive]) => ({
        name,
        role: frontOfficeList.includes(name)
          ? 'Front Office'
          : labInstructorList.includes(name)
            ? 'Lab Instructor'
            : facultyList.includes(name)
              ? 'Teacher'
              : 'Other',
        incentive,
        total: Number(baseSalary) + Number(incentive),
      }))
      .sort((a, b) => b.total - a.total)
  }, [students, baseSalary, facultyList, frontOfficeList, labInstructorList])

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 className="cardTitle">Salary (Frontend Only)</h2>
        <p className="cardBody">
          Calculated dynamically from the central <b>students</b> array (no backend, no API calls).
        </p>
        <div className="btnRow">
          <input
            className="input"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            placeholder="Base Salary"
            inputMode="numeric"
            style={{ maxWidth: 220 }}
          />
          <button className="btn btnNeutral" type="button" onClick={resetMonthly}>
            Monthly Reset
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              const header = 'Name,Role,Incentive,Total'
              const lines = rows.map((r) => `${r.name},${r.role},${r.incentive},${r.total}`)
              const csv = [header, ...lines].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'salary-report.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="cardTitle">Incentive Report</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Incentive</th>
              <th>Total (Base + Incentive)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{r.role}</td>
                <td>₹{Number(r.incentive).toFixed(1)}</td>
                <td>
                  <b>₹{Number(r.total).toFixed(1)}</b>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No salary data yet</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

