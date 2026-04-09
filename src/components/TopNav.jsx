import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/appContext'

function titleFromPath(pathname) {
  const map = {
    '/admin/dashboard': 'Dashboard',
    '/admin/students': 'Students',
    '/admin/courses': 'Courses',
    '/admin/staff': 'Staff',
    '/admin/payments': 'Payments',
    '/admin/salary': 'Salary',
    '/admin/notices': 'Notice Board',
    '/student/dashboard': 'Dashboard',
    '/student/my-courses': 'My Courses',
    '/student/payments': 'Payments',
    '/student/quiz': 'Quiz',
    '/student/certificate': 'Certificate',
    '/student/jobs': 'Jobs',
  }
  return map[pathname] || 'Student Management System'
}

function breadcrumbFromPath(pathname, role) {
  const base = role === 'admin' ? 'Admin' : 'Student'
  const parts = pathname.split('/').filter(Boolean)
  const tail = parts[1] ? parts[1].replace(/-/g, ' ') : 'dashboard'
  return `${base} > ${tail.charAt(0).toUpperCase()}${tail.slice(1)}`
}

export default function TopNav() {
  const { currentUser } = useApp()
  const loc = useLocation()

  const title = useMemo(() => titleFromPath(loc.pathname), [loc.pathname])
  const breadcrumb = useMemo(
    () => breadcrumbFromPath(loc.pathname, currentUser?.role),
    [loc.pathname, currentUser?.role],
  )

  function toggleDark() {
    const next = !document.body.classList.contains('dark')
    document.body.classList.toggle('dark', next)
    localStorage.setItem('sms_dark_mode', next ? '1' : '0')
  }

  return (
    <header className="topNav">
      <div className="topNavLeft">
        <h1 className="pageTitle">{title}</h1>
        <div className="breadcrumb">{breadcrumb}</div>
      </div>
      <div className="topNavRight">
        <button className="btn btnNeutral" type="button" onClick={toggleDark}>
          Dark Mode
        </button>
        <div className="pill" aria-label="User profile">
          👤 {currentUser?.username}
        </div>
      </div>
    </header>
  )
}

