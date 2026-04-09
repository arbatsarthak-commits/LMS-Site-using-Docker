import React, { useMemo } from 'react'
import { useApp } from '../context/appContext'

export default function Dashboard() {
  const { students, courses } = useApp()

  const totalStudents = students.length
  const totalCourses = courses.length

  const totalSalary = useMemo(() => {
    const salaryMap = {}
    students.forEach((s) => {
      const fo = s.frontOffice || ''
      const li = s.labInstructor || ''
      const fac = s.faculty || ''

      if (fo) salaryMap[fo] = salaryMap[fo] || 0
      if (li) salaryMap[li] = salaryMap[li] || 0
      if (fac) salaryMap[fac] = salaryMap[fac] || 0

      if (s.course === 'MSCIT') {
        if (fo) salaryMap[fo] += 80
        if (li) salaryMap[li] += 80
      } else if (s.course === 'Module') {
        if (fo) salaryMap[fo] += 90
        if (li) salaryMap[li] += 90
      } else if (s.course === '149') {
        if (fac) salaryMap[fac] += 74.5
      } else {
        if (fo) salaryMap[fo] += 400
      }
    })

    return Object.values(salaryMap).reduce((acc, v) => acc + v, 0)
  }, [students])

  return (
    <div>
      <div className="summaryGrid" style={{ marginBottom: 14 }}>
        <div className="summaryCard">
          <div className="summaryLabel">Total Students</div>
          <div className="summaryValue">{totalStudents}</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Total Courses</div>
          <div className="summaryValue">{totalCourses}</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Total Salary (Incentives)</div>
          <div className="summaryValue">₹{totalSalary.toFixed(1)}</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">System</div>
          <div className="summaryValue" style={{ fontSize: 14 }}>
            Dummy data • No backend
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="cardTitle">Welcome</h2>
        <p className="cardBody" style={{ marginBottom: 0 }}>
          Use the sidebar to manage students, register courses, and view salary calculations — all
          stored in React state (no backend).
        </p>
      </div>
    </div>
  )
}

