import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { students, payments, frontOfficeList, labInstructorList } = useApp()

  const totalStudents = students.length
  const totalRevenue = useMemo(
    () => payments.reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payments],
  )
  const totalStaff = frontOfficeList.length + labInstructorList.length
  const totalSalary = useMemo(() => {
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
          <div className="summaryLabel">Total Revenue</div>
          <div className="summaryValue">₹{totalRevenue}</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Total Staff</div>
          <div className="summaryValue">{totalStaff}</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Total Salary (Incentives)</div>
          <div className="summaryValue">₹{totalSalary.toFixed(1)}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="cardTitle">Admin Actions</h2>
        <div className="btnRow">
          <button className="btn" type="button" onClick={() => navigate('/students')}>
            Manage Students
          </button>
          <button className="btn" type="button" onClick={() => navigate('/courses')}>
            Courses
          </button>
          <button className="btn btnSuccess" type="button" onClick={() => navigate('/salary')}>
            Salary
          </button>
        </div>
      </div>
    </div>
  )
}

