import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/appContext'
import AppSidebar from '../components/AppSidebar'
import AppTopNav from '../components/AppTopNav'

export default function ProtectedLayout({ role }) {
  const { currentUser } = useApp()
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
    <div className="appLayout">
      <AppSidebar />
      <div className="mainArea">
        <AppTopNav />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

