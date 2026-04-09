import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/appContext'

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
    >
      {label}
    </NavLink>
  )
}

export default function AppSidebar() {
  const { currentUser } = useApp()

  const isAdmin = currentUser?.role === 'admin'

  return (
    <aside className="sidebar">
      <div className="sidebarBrand">
        <div className="sidebarBrandTitle">Super Computer Institute</div>
        <div className="sidebarBrandSub">{isAdmin ? 'Admin Panel' : 'Student Panel'}</div>
      </div>

      <nav className="sidebarNav">
        {isAdmin ? (
          <>
            <Item to="/admin-dashboard" label="Dashboard" />
            <Item to="/students" label="Students" />
            <Item to="/courses" label="Courses" />
            <Item to="/salary" label="Salary" />
            <Item to="/teachers" label="Notice Board" />
          </>
        ) : (
          <>
            <Item to="/student-dashboard" label="Dashboard" />
            <Item to="/courses" label="My Courses" />
            <Item to="/quiz" label="Quiz" />
            <Item to="/certificate" label="Certificate" />
          </>
        )}
      </nav>
    </aside>
  )
}

