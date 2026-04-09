import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/appContext'

function LinkItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`
      }
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ variant }) {
  const { instituteName, currentUser, logout } = useApp()

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/students', icon: '🎓', label: 'Students' },
    { to: '/admin/courses', icon: '📚', label: 'Courses' },
    { to: '/admin/staff', icon: '🧑‍💼', label: 'Staff' },
    { to: '/admin/payments', icon: '💳', label: 'Payments' },
    { to: '/admin/salary', icon: '💰', label: 'Salary' },
    { to: '/admin/notices', icon: '📢', label: 'Notice Board' },
  ]

  const studentLinks = [
    { to: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/student/my-courses', icon: '📚', label: 'My Courses' },
    { to: '/student/payments', icon: '💳', label: 'Payments' },
    { to: '/student/quiz', icon: '📝', label: 'Quiz' },
    { to: '/student/certificate', icon: '🏆', label: 'Certificate' },
    { to: '/student/jobs', icon: '💼', label: 'Jobs' },
  ]

  const links = variant === 'admin' ? adminLinks : studentLinks

  return (
    <aside className="sidebar">
      <div className="sidebarBrand">
        <div className="sidebarBrandTitle">{instituteName}</div>
        <div className="sidebarBrandSub">
          {variant === 'admin' ? 'Admin Panel' : 'Student Panel'}
        </div>
      </div>

      <nav className="sidebarNav" aria-label="Sidebar navigation">
        {links.map((l) => (
          <LinkItem key={l.to} to={l.to} icon={l.icon} label={l.label} />
        ))}
      </nav>

      <div className="sidebarFooter">
        <div className="pill">
          {currentUser?.username} • {currentUser?.role}
        </div>
        <button
          className="btn btnNeutral"
          type="button"
          onClick={() => {
            logout()
            window.location.href = '/login'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

