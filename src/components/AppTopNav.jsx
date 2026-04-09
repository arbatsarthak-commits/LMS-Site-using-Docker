import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

function titleFromPath(path) {
  const map = {
    '/admin-dashboard': 'Admin Dashboard',
    '/student-dashboard': 'Student Dashboard',
    '/students': 'Students',
    '/courses': 'Courses',
    '/salary': 'Salary',
    '/quiz': 'Quiz',
    '/certificate': 'Certificate',
  }
  return map[path] || 'Student Management System'
}

export default function AppTopNav() {
  const { pathname } = useLocation()
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const title = useMemo(() => titleFromPath(pathname), [pathname])
  const breadcrumb = useMemo(() => {
    const root = currentUser?.role === 'admin' ? 'Admin' : 'Student'
    return `${root} > ${title}`
  }, [currentUser?.role, title])

  function toggleDark() {
    document.body.classList.toggle('dark')
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
        <div className="pill">👤 {currentUser?.username}</div>
        <button
          className="btn btnNeutral"
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

