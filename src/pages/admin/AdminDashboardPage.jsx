import React from 'react'
import { useApp } from '../../context/appContext'

export default function AdminDashboardPage() {
  const { users, payments, frontOffice, labInstructors, getSalaryReport } = useApp()

  const totalStudents = users.filter((u) => u.role === 'student').length
  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
  const totalStaff = frontOffice.length + labInstructors.length
  const monthlySalary = getSalaryReport().grandTotal

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
          <div className="summaryLabel">Monthly Salary (report)</div>
          <div className="summaryValue">₹{monthlySalary}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="cardTitle">Quick tips</h2>
        <p className="cardBody" style={{ marginBottom: 0 }}>
          Use the sidebar to manage Students, Courses, Staff, Payments, Salary, and Notices. Student
          registrations will appear in Students &gt; Registrations.
        </p>
      </div>
    </div>
  )
}

