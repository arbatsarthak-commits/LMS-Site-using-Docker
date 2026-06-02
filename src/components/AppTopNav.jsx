import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'
import { useShell } from '../context/ShellContext.jsx'

function titleFromPath(path) {
  const map = {
    '/admin-dashboard': 'Analytics Overview',
    '/student-dashboard': 'My Learning',
    '/students': 'Manage Students',
    '/courses': 'Courses',
    '/salary': 'Salary management',
    '/payments': 'Reports & Payments',
    '/payment': 'Payments',
    '/quiz': 'Quiz',
    '/certificate': 'Certificate',
    '/teachers': 'Notice Board',
  }
  return map[path] || 'LMS'
}

function initials(username) {
  const u = (username || 'U').trim()
  return u.slice(0, 2).toUpperCase()
}

export default function AppTopNav() {
  const { pathname } = useLocation()
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const { setMenuOpen } = useShell()

  const title = useMemo(() => titleFromPath(pathname), [pathname])
  const roleLabel = currentUser?.role === 'admin' ? 'Admin' : 'Student'
  const welcome = useMemo(() => {
    if (currentUser?.role === 'admin') return 'Welcome back, Admin 👋'
    return `Welcome back, ${currentUser?.username || 'Student'} 👋`
  }, [currentUser?.role, currentUser?.username])

  const breadcrumb = useMemo(() => {
    const root = roleLabel
    return `${root} · ${title}`
  }, [roleLabel, title])

  function toggleDark() {
    document.body.classList.toggle('dark')
  }

  return (
    <header className="topNav glassTopNav">
      <div className="topNavLeft">
        <button
          type="button"
          className="iconBtn navMenuBtn"
          aria-label="Open navigation"
          onClick={() => setMenuOpen(true)}
        >
          <span className="navMenuIcon" aria-hidden>
            ☰
          </span>
        </button>
        <div className="topNavTitles">
          <p className="welcomeLine">{welcome}</p>
          <h1 className="pageTitle">{title}</h1>
          <div className="breadcrumb">{breadcrumb}</div>
        </div>
      </div>
      <div className="topNavRight">
        <button className="iconBtn notifBtn" type="button" title="Notifications">
          <span className="notifBell" aria-hidden>
            🔔
          </span>
          <span className="notifDot" />
        </button>
        <button className="btn btnNeutral btnSmall" type="button" onClick={toggleDark}>
          Theme
        </button>
        <div className="userChip" title={currentUser?.username}>
          <span className="userAvatar" aria-hidden>
            {initials(currentUser?.username)}
          </span>
          <span className="userChipName">{currentUser?.username}</span>
        </div>
        <button
          className="btn btnNeutral btnSmall"
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
