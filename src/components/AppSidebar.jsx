import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/appContext'
import { useShell } from '../context/ShellContext.jsx'

function Item({ to, label, icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
      onClick={onNavigate}
    >
      <span className="sidebarIcon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function AppSidebar() {
  const { currentUser } = useApp()
  const { menuOpen, setMenuOpen } = useShell()

  const isAdmin = currentUser?.role === 'admin'

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          className="sidebarBackdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <aside className={`sidebar glassSidebar ${menuOpen ? 'sidebarOpen' : ''}`}>
        <div className="sidebarBrand">
          <div className="sidebarBrandTitle">Super Computer Institute</div>
          <div className="sidebarBrandSub">{isAdmin ? 'Admin · LMS Console' : 'Student · Learning Hub'}</div>
        </div>

        <nav className="sidebarNav">
          {isAdmin ? (
            <>
              <Item to="/admin-dashboard" label="Analytics Overview" icon="📊" onNavigate={closeMenu} />
              <Item to="/students" label="Manage Students" icon="🎓" onNavigate={closeMenu} />
              <Item to="/courses" label="Courses & Catalog" icon="📚" onNavigate={closeMenu} />
              <Item to="/payments" label="Reports & Payments" icon="💳" onNavigate={closeMenu} />
              <Item to="/salary" label="Staff & salary" icon="💰" onNavigate={closeMenu} />
              <Item to="/teachers" label="Notice Board" icon="📢" onNavigate={closeMenu} />
            </>
          ) : (
            <>
              <Item to="/student-dashboard" label="My Dashboard" icon="📊" onNavigate={closeMenu} />
              <Item to="/courses" label="My Courses" icon="📘" onNavigate={closeMenu} />
              <Item to="/payment" label="Payments" icon="💳" onNavigate={closeMenu} />
              <Item to="/quiz" label="Quiz" icon="📝" onNavigate={closeMenu} />
              <Item to="/certificate" label="Certificate" icon="🏆" onNavigate={closeMenu} />
            </>
          )}
        </nav>
        <div className="sidebarFooterText">LMS · v1.0 · SaaS-ready</div>
      </aside>
    </>
  )
}
