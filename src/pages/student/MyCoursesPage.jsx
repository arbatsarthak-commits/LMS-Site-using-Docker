import React, { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import { useApp } from '../../context/appContext'

export default function MyCoursesPage() {
  const { currentUser, courses, getRegisteredCourses, studentRegister, hasPaid, getQuizPercent } = useApp()

  const registered = useMemo(
    () => (currentUser ? getRegisteredCourses(currentUser.username) : []),
    [currentUser, getRegisteredCourses],
  )

  const [open, setOpen] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [courseName, setCourseName] = useState(courses[0]?.name || '')

  function submit() {
    const res = studentRegister({
      username: currentUser?.username,
      studentName,
      courseName,
    })
    if (!res.ok) {
      alert(res.message)
      return
    }
    setOpen(false)
    setStudentName('')
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 className="cardTitle" style={{ marginBottom: 4 }}>
              My Courses
            </h2>
            <p className="cardBody" style={{ marginBottom: 0 }}>
              Register a course to unlock Quiz and Payments.
            </p>
          </div>
          <button className="btn btnSuccess" type="button" onClick={() => setOpen(true)}>
            Register Course
          </button>
        </div>
      </div>

      <div className="cardGrid">
        {courses.map((c) => {
          const isReg = registered.includes(c.name)
          const paid = currentUser ? hasPaid(currentUser.username, c.name) : false
          const pct = currentUser ? getQuizPercent(currentUser.username, c.name) : null
          return (
            <div key={c.name} className="card">
              <h2 className="cardTitle">{c.name}</h2>
              <p className="cardBody">
                Fee: <b>₹{c.fee}</b> • {isReg ? 'Registered' : 'Not registered'}
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
                  Payment: <b>{paid ? 'Paid' : 'Pending'}</b>
                </div>
                <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
                  Quiz: <b>{pct == null ? 'Not attempted' : `${pct}%`}</b>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={open} title="Register for a Course" onClose={() => setOpen(false)}>
        <div className="form">
          <div className="field">
            <label className="label">Student Name</label>
            <input
              className="input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Rahul"
            />
          </div>
          <div className="field">
            <label className="label">Course</label>
            <select className="input" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
              {courses.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (₹{c.fee})
                </option>
              ))}
            </select>
          </div>
          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={submit}>
              Register
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

