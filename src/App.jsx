import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppProvider from './context/AppProvider.jsx'
import ProtectedLayout from './layouts/ProtectedLayout.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import Students from './pages/Students.jsx'
import Courses from './pages/Courses.jsx'
import Salary from './pages/Salary.jsx'
import Quiz from './pages/Quiz.jsx'
import Certificate from './pages/Certificate.jsx'
import Teachers from './pages/Teachers.jsx'
import Payment from './pages/Payment.jsx'
import Payments from './pages/Payments.jsx'
import ToastStack from './components/ToastStack.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/salary" element={<Salary />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/teachers" element={<Teachers />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <ToastStack />
      </AppProvider>
    </BrowserRouter>
  )
}
