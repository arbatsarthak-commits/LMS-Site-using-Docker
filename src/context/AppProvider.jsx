import React, { useCallback, useState } from 'react'
import { AppContext } from './appContext'

const DEFAULT_USERS = [
  { username: 'admin', password: '123', role: 'admin' },
  { username: 'student1', password: '123', role: 'student' },
  { username: 'student2', password: '123', role: 'student' },
]

const DEFAULT_COURSES = [
  { name: 'MSCIT', fee: 700 },
  { name: 'Module', fee: 1000 },
  { name: '149', fee: 149 },
]

const DEFAULT_STUDENTS = [
  {
    name: 'Rahul',
    course: 'MSCIT',
    faculty: 'Teacher A',
    frontOffice: 'Staff A',
    labInstructor: 'Staff B',
  },
  {
    name: 'Amit',
    course: 'Module',
    faculty: 'Teacher B',
    frontOffice: 'Staff A',
    labInstructor: 'Staff C',
  },
]

const DEFAULT_FACULTY = ['Teacher A', 'Teacher B', 'Teacher C']
const DEFAULT_FRONT_OFFICE = ['Staff A', 'Staff B', 'Staff C']
const DEFAULT_LAB = ['Staff B', 'Staff C', 'Staff D']

const DEFAULT_PLACEMENTS = [
  { company: 'TCS', role: 'Junior Developer', salary: '3.5 LPA' },
  { company: 'Infosys', role: 'Support Engineer', salary: '3.2 LPA' },
]

export default function AppProvider({ children }) {
  const [instituteName] = useState('Super Computer Institute')
  const [users, setUsers] = useState(DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useState(null)

  const [courses, setCourses] = useState(DEFAULT_COURSES)
  const [facultyList, setFacultyList] = useState(DEFAULT_FACULTY)
  const [frontOfficeList, setFrontOfficeList] = useState(DEFAULT_FRONT_OFFICE)
  const [labInstructorList, setLabInstructorList] = useState(DEFAULT_LAB)

  const [students, setStudents] = useState(DEFAULT_STUDENTS)
  const [payments, setPayments] = useState([]) // {name, course, amount}
  const [notices, setNotices] = useState(['Welcome to Super Computer Institute'])
  const [quizResults, setQuizResults] = useState({}) // { username: percent }
  const [attendance] = useState({ student1: 86, student2: 91 })
  const [placements, setPlacements] = useState(DEFAULT_PLACEMENTS)
  const [facultyMessages, setFacultyMessages] = useState([]) // {username, teacher, type, text}

  function login({ username, password, role }) {
    const u = (username || '').trim().toLowerCase()
    const p = (password || '').trim()
    const r = (role || '').trim()
    const user = users.find(
      (x) => x.username.toLowerCase() === u && x.password === p && x.role === r,
    )
    if (!user) return { ok: false }
    setCurrentUser(user)
    return { ok: true, user }
  }

  function logout() {
    setCurrentUser(null)
  }

  function addStudent(student) {
    setStudents((prev) => [student, ...prev])
  }

  function deleteStudentByIndex(index) {
    setStudents((prev) => prev.filter((_, i) => i !== index))
  }

  const registerStudentCourse = useCallback(({ name, course }) => {
    addStudent({
      name,
      course,
      faculty: '',
      frontOffice: '',
      labInstructor: '',
    })
  }, [])

  function addUserStudent({ username, password }) {
    const u = (username || '').trim()
    const p = (password || '').trim()
    if (!u || !p) return false
    if (users.some((x) => x.username.toLowerCase() === u.toLowerCase())) return false
    setUsers((prev) => [...prev, { username: u, password: p, role: 'student' }])
    return true
  }

  function addPayment({ name, course, amount }) {
    setPayments((prev) => [{ name, course, amount }, ...prev])
  }

  function addNotice(text) {
    const t = (text || '').trim()
    if (!t) return false
    setNotices((prev) => [t, ...prev])
    return true
  }

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
    users,
    currentUser,
    login,
    logout,
    addUserStudent,

    courses,
    setCourses,
    facultyList,
    setFacultyList,
    frontOfficeList,
    setFrontOfficeList,
    labInstructorList,
    setLabInstructorList,

    students,
    setStudents,
    addStudent,
    deleteStudent: deleteStudentByIndex,
    registerStudentCourse,

    payments,
    addPayment,
    notices,
    addNotice,
    quizResults,
    setQuizResults,
    attendance,
    placements,
    setPlacements,
    facultyMessages,
    submitFacultyMessage,
    resetMonthly,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

