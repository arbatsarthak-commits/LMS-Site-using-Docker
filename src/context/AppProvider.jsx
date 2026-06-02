import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './appContext'
import { api } from '../api/client.js'

const DEFAULT_PLACEMENTS = [
  { company: 'TCS', role: 'Junior Developer', salary: '3.5 LPA' },
  { company: 'Infosys', role: 'Support Engineer', salary: '3.2 LPA' },
]

export default function AppProvider({ children }) {
  const [instituteName] = useState('Super Computer Institute')
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [pendingOtp, setPendingOtp] = useState(null)

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState('')
  const [myCourses, setMyCourses] = useState([])
  const [myCoursesLoading, setMyCoursesLoading] = useState(false)
  const [myCoursesError, setMyCoursesError] = useState('')
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [staffError, setStaffError] = useState('')
  const [facultyList, setFacultyList] = useState([])
  const [frontOfficeList, setFrontOfficeList] = useState([])
  const [labInstructorList, setLabInstructorList] = useState([])

  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState('')
  const [notices, setNotices] = useState([])
  const [noticesLoading, setNoticesLoading] = useState(false)
  const [noticesError, setNoticesError] = useState('')
  const [quizResults, setQuizResults] = useState({}) // { username: percent }
  const [attendance] = useState({ student1: 86, student2: 91 })
  const [placements, setPlacements] = useState(DEFAULT_PLACEMENTS)
  const [facultyMessages, setFacultyMessages] = useState([]) // {username, teacher, type, text}
  const [studentUsers, setStudentUsers] = useState([])
  const [studentUsersLoading, setStudentUsersLoading] = useState(false)
  const [studentUsersError, setStudentUsersError] = useState('')
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const notifySuccess = useCallback((message) => pushToast('success', message), [pushToast])
  const notifyError = useCallback((message) => pushToast('error', message), [pushToast])
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    // Restore login after refresh
    try {
      const raw = localStorage.getItem('sms_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token)
          setCurrentUser(parsed.user)
        }
      }
    } catch {
      // ignore
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const persistAuth = useCallback((next) => {
    try {
      localStorage.setItem('sms_auth', JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  const clearAuth = useCallback(() => {
    try {
      localStorage.removeItem('sms_auth')
    } catch {
      // ignore
    }
  }, [])

  const login = useCallback(async ({ username, password, role, captchaAnswer }) => {
    setAuthError('')
    const res = await api.login({ username, password, role, captchaAnswer })
    if (res?.status === 'otp_required') {
      setPendingOtp({
        role: 'admin',
        username,
        otpDebug: res.otp || null,
      })
      return { ok: true, otpRequired: true, otp: res.otp || null }
    }
    if (!res?.ok || !res?.token || !res?.user) return { ok: false }
    setToken(res.token)
    setCurrentUser(res.user)
    setPendingOtp(null)
    persistAuth({ token: res.token, user: res.user })
    return { ok: true, user: res.user }
  }, [persistAuth])

  const verifyAdminOtp = useCallback(async ({ otp }) => {
    const res = await api.verifyOtp({ otp })
    if (!res?.ok || !res?.token || !res?.user) return { ok: false, message: res?.message || 'OTP verify failed' }
    setToken(res.token)
    setCurrentUser(res.user)
    setPendingOtp(null)
    persistAuth({ token: res.token, user: res.user })
    return { ok: true, user: res.user }
  }, [persistAuth])

  function logout() {
    setCurrentUser(null)
    setToken(null)
    setPendingOtp(null)
    clearAuth()
  }

  const refreshStudents = useCallback(async () => {
    if (!token) return
    setStudentsError('')
    setStudentsLoading(true)
    try {
      const res = await api.getStudents(token)
      setStudents(Array.isArray(res?.students) ? res.students : [])
    } catch (e) {
      setStudentsError(e?.message || 'Failed to load students')
    } finally {
      setStudentsLoading(false)
    }
  }, [token])

  const refreshCourses = useCallback(async () => {
    setCoursesError('')
    setCoursesLoading(true)
    try {
      const res = await api.getCourses()
      setCourses(Array.isArray(res?.courses) ? res.courses : [])
    } catch (e) {
      setCoursesError(e?.message || 'Failed to load courses')
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }, [])

  const refreshStaff = useCallback(async () => {
    if (!token || currentUser?.role !== 'admin') {
      setStaff([])
      setFacultyList([])
      setFrontOfficeList([])
      setLabInstructorList([])
      return
    }
    setStaffError('')
    setStaffLoading(true)
    try {
      const res = await api.getStaff(token)
      const items = Array.isArray(res?.staff) ? res.staff : []
      setStaff(items)
      setFacultyList(items.filter((s) => s.role === 'teacher').map((s) => s.name))
      setFrontOfficeList(items.filter((s) => s.role === 'front_office').map((s) => s.name))
      setLabInstructorList(items.filter((s) => s.role === 'lab_instructor').map((s) => s.name))
    } catch (e) {
      setStaffError(e?.message || 'Failed to load staff')
      setStaff([])
      setFacultyList([])
      setFrontOfficeList([])
      setLabInstructorList([])
    } finally {
      setStaffLoading(false)
    }
  }, [token, currentUser])

  const addStaffMember = useCallback(
    async (payload) => {
      if (!token) return { ok: false, message: 'Not logged in' }
      try {
        const res = await api.addStaff(token, payload)
        if (res?.ok) {
          await refreshStaff()
          return { ok: true }
        }
        return { ok: false, message: res?.error || 'Add staff failed' }
      } catch (e) {
        return { ok: false, message: e?.message || 'Add staff failed' }
      }
    },
    [token, refreshStaff],
  )

  const deleteStaffMember = useCallback(
    async (id) => {
      if (!token) return { ok: false, message: 'Not logged in' }
      try {
        const res = await api.deleteStaff(token, id)
        if (res?.ok) {
          await refreshStaff()
          return { ok: true }
        }
        return { ok: false, message: res?.error || 'Delete staff failed' }
      } catch (e) {
        return { ok: false, message: e?.message || 'Delete staff failed' }
      }
    },
    [token, refreshStaff],
  )

  const refreshMyCourses = useCallback(async () => {
    if (!token) return
    setMyCoursesError('')
    setMyCoursesLoading(true)
    try {
      const res = await api.myCourses(token)
      setMyCourses(Array.isArray(res?.courses) ? res.courses : [])
    } catch (e) {
      setMyCoursesError(e?.message || 'Failed to load my courses')
      setMyCourses([])
    } finally {
      setMyCoursesLoading(false)
    }
  }, [token])

  useEffect(() => {
    refreshCourses()
    if (token) refreshStudents()
    else setStudents([])
  }, [token, refreshStudents, refreshCourses])

  useEffect(() => {
    if (token && currentUser?.role === 'student') refreshMyCourses()
    else setMyCourses([])
  }, [token, currentUser, refreshMyCourses])

  useEffect(() => {
    if (token && currentUser?.role === 'admin') refreshStaff()
    else {
      setStaff([])
      setFacultyList([])
      setFrontOfficeList([])
      setLabInstructorList([])
    }
  }, [token, currentUser, refreshStaff])

  const refreshPayments = useCallback(async () => {
    if (!token || !currentUser?.role) return
    setPaymentsError('')
    setPaymentsLoading(true)
    try {
      const res =
        currentUser.role === 'admin' ? await api.getPayments(token) : await api.myPayments(token)
      setPayments(Array.isArray(res?.payments) ? res.payments : [])
    } catch (e) {
      setPaymentsError(e?.message || 'Failed to load payments')
      setPayments([])
    } finally {
      setPaymentsLoading(false)
    }
  }, [token, currentUser])

  const refreshStudentUsers = useCallback(async () => {
    if (!token || currentUser?.role !== 'admin') {
      setStudentUsers([])
      return
    }
    setStudentUsersError('')
    setStudentUsersLoading(true)
    try {
      const res = await api.getUsers(token)
      setStudentUsers(Array.isArray(res?.users) ? res.users : [])
    } catch (e) {
      setStudentUsersError(e?.message || 'Failed to load users')
      setStudentUsers([])
    } finally {
      setStudentUsersLoading(false)
    }
  }, [token, currentUser])

  useEffect(() => {
    if (token && currentUser?.role) refreshPayments()
    else setPayments([])
  }, [token, currentUser, refreshPayments])

  useEffect(() => {
    if (token && currentUser?.role === 'admin') refreshStudentUsers()
    else setStudentUsers([])
  }, [token, currentUser, refreshStudentUsers])

  const refreshNotices = useCallback(async () => {
    if (!token || !currentUser?.role) return
    setNoticesError('')
    setNoticesLoading(true)
    try {
      const res = await api.getNotices(token)
      setNotices(Array.isArray(res?.notices) ? res.notices : [])
    } catch (e) {
      setNoticesError(e?.message || 'Failed to load notices')
      setNotices([])
    } finally {
      setNoticesLoading(false)
    }
  }, [token, currentUser])

  useEffect(() => {
    if (token && currentUser?.role) refreshNotices()
    else setNotices([])
  }, [token, currentUser, refreshNotices])

  const addStudent = useCallback(async (payload) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.addStudent(token, payload)
      if (res?.ok && res?.student) {
        setStudents((prev) => [res.student, ...prev])
        return { ok: true, student: res.student }
      }
      return { ok: false, message: res?.error || 'Add failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Add failed' }
    }
  }, [token])

  const addStudentUser = useCallback(async ({ studentName, username, password, course }) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.addUser(token, { studentName, username, password, course })
      if (res?.ok) {
        await refreshStudentUsers()
        await refreshStudents()
        return { ok: true }
      }
      return { ok: false, message: res?.message || res?.error || 'Create user failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Create user failed' }
    }
  }, [token, refreshStudentUsers, refreshStudents])

  const deleteStudentUser = useCallback(async (id) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.deleteUser(token, id)
      if (res?.ok) {
        await refreshStudentUsers()
        await refreshStudents()
        return { ok: true }
      }
      return { ok: false, message: res?.message || res?.error || 'Delete user failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Delete user failed' }
    }
  }, [token, refreshStudentUsers, refreshStudents])

  const deleteStudent = useCallback(async (id) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.deleteStudent(token, id)
      if (res?.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id))
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Delete failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Delete failed' }
    }
  }, [token])

  const registerCourse = useCallback(async ({ courseId, studentName }) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res =
        studentName && String(studentName).trim()
          ? await api.registerCourseWithName(token, { courseId, studentName: String(studentName).trim() })
          : await api.registerCourse(token, courseId)
      if (res?.ok) {
        await refreshMyCourses()
        await refreshStudents()
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Registration failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Registration failed' }
    }
  }, [token, refreshMyCourses, refreshStudents])

  const payCourse = useCallback(async ({ courseId, amount }) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.payCourse(token, { courseId, amount })
      if (res?.ok) {
        await refreshMyCourses()
        await refreshPayments()
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Payment failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Payment failed' }
    }
  }, [token, refreshMyCourses, refreshPayments])

  const assignStaff = useCallback(async ({ id, faculty, frontOffice, labInstructor }) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.assignStaff(token, { id, faculty, frontOffice, labInstructor })
      if (res?.ok) {
        await refreshStudents()
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Assign failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Assign failed' }
    }
  }, [token, refreshStudents])

  const registerStudentCourse = useCallback(({ name, course }) => {
    // Placeholder: student registration flow will be backed by DB API next.
    // For now, do nothing (prevents reintroducing dummy writes).
    return { ok: false, message: 'Course registration API not implemented yet' }
  }, [])

  const canAdmin = useMemo(() => currentUser?.role === 'admin', [currentUser])

  // Payments are stored in DB (see payCourse + refreshPayments)

  const addNotice = useCallback(async ({ title, message }) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.addNotice(token, { title, message })
      if (res?.ok) {
        await refreshNotices()
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Add notice failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Add notice failed' }
    }
  }, [token, refreshNotices])

  const deleteNotice = useCallback(async (id) => {
    if (!token) return { ok: false, message: 'Not logged in' }
    try {
      const res = await api.deleteNotice(token, id)
      if (res?.ok) {
        await refreshNotices()
        return { ok: true }
      }
      return { ok: false, message: res?.error || 'Delete notice failed' }
    } catch (e) {
      return { ok: false, message: e?.message || 'Delete notice failed' }
    }
  }, [token, refreshNotices])

  function submitFacultyMessage({ username, teacher, type, text }) {
    const t = (text || '').trim()
    if (!t) return false
    setFacultyMessages((prev) => [{ username, teacher, type, text: t }, ...prev])
    return true
  }

  function resetMonthly() {
    setPayments([])
    setQuizResults({})
  }

  // Keep it simple and frontend-only: no manual memoization.
  const value = {
    instituteName,
    currentUser,
    token,
    authLoading,
    authError,
    pendingOtp,
    login,
    verifyAdminOtp,
    logout,
    canAdmin,

    courses,
    setCourses,
    coursesLoading,
    coursesError,
    refreshCourses,
    staff,
    staffLoading,
    staffError,
    refreshStaff,
    addStaffMember,
    deleteStaffMember,
    myCourses,
    myCoursesLoading,
    myCoursesError,
    refreshMyCourses,
    registerCourse,
    payCourse,
    assignStaff,
    facultyList,
    setFacultyList,
    frontOfficeList,
    setFrontOfficeList,
    labInstructorList,
    setLabInstructorList,

    students,
    setStudents,
    studentsLoading,
    studentsError,
    refreshStudents,
    addStudent,
    studentUsers,
    studentUsersLoading,
    studentUsersError,
    refreshStudentUsers,
    addStudentUser,
    deleteStudentUser,
    deleteStudent,
    registerStudentCourse,

    payments,
    paymentsLoading,
    paymentsError,
    refreshPayments,
    notices,
    noticesLoading,
    noticesError,
    refreshNotices,
    addNotice,
    deleteNotice,
    quizResults,
    setQuizResults,
    attendance,
    placements,
    setPlacements,
    facultyMessages,
    submitFacultyMessage,
    resetMonthly,
    toasts,
    notifySuccess,
    notifyError,
    dismissToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

