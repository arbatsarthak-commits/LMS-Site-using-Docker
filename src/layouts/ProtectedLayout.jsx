import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/appContext'
import { ShellProvider } from '../context/ShellContext.jsx'
import AppSidebar from '../components/AppSidebar'
import AppTopNav from '../components/AppTopNav'

function LmsBackground() {
  return (
    <div className="lmsBgDecor" aria-hidden>
      <svg className="lmsBgSvg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="eduDots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="currentColor" />
          </pattern>
          <pattern id="eduGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M48 0H0v48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.35"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#eduDots)" opacity="0.35" />
        <rect width="100%" height="100%" fill="url(#eduGrid)" opacity="0.2" />
      </svg>
      <div className="lmsBlob lmsBlob--a" />
      <div className="lmsBlob lmsBlob--b" />
      <div className="lmsBlob lmsBlob--c" />
    </div>
  )
}

export default function ProtectedLayout({ role }) {
  const { currentUser, authLoading } = useApp()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="lmsShell">
        <LmsBackground />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="card glassCard">
            <p className="cardBody" style={{ marginBottom: 0 }}>
              Loading…
            </p>
          </div>
        </div>
      </div>
    )
  }
  if (!currentUser) return <Navigate to="/login" replace />
  if (role && currentUser.role !== role) {
    return (
      <Navigate
        to={currentUser.role === 'admin' ? '/admin-dashboard' : '/student-dashboard'}
        replace
      />
    )
  }

  return (
    <ShellProvider>
      <div className="lmsShell">
        <LmsBackground />
        <div className="appLayout">
          <AppSidebar />
          <div className="mainArea">
            <AppTopNav />
            <main key={location.pathname} className="content pageTransition">
              <Outlet />
            </main>
            <footer className="appFooter">
              © {new Date().getFullYear()} Super Computer Institute LMS · Learning Management System
            </footer>
          </div>
        </div>
      </div>
    </ShellProvider>
  )
}
