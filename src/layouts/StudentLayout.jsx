import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'

export default function StudentLayout() {
  useEffect(() => {
    const dark = localStorage.getItem('sms_dark_mode') === '1'
    document.body.classList.toggle('dark', dark)
  }, [])

  return (
    <div className="appLayout">
      <Sidebar variant="student" />
      <div className="mainArea">
        <TopNav />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

