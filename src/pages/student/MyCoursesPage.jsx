import React, { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import { useApp } from '../../context/appContext'

export default function MyCoursesPage() {
  const { courses, myCourses, registerCourse, refreshMyCourses, myCoursesLoading } = useApp()

  const registeredIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses])

  const [open, setOpen] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [courseId, setCourseId] = useState(courses[0]?.id || '')

  async function submit() {
    const res = await registerCourse({ courseId: Number(courseId), studentName })
    if (!res.ok) return alert(res.message || 'Registration failed')
    await refreshMyCourses()
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
          const reg = myCourses.find((x) => x.id === c.id)
          const isReg = registeredIds.has(c.id)
          const paid = Boolean(reg?.paid)
          return (
            <div key={c.id} className="card">
              <h2 className="cardTitle">{c.name}</h2>
              <p className="cardBody">
                Fee: <b>₹{c.fee}</b> • {isReg ? 'Registered' : 'Not registered'}
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
                  Payment: <b>{paid ? 'Paid' : 'Pending'}</b>
                </div>
                <div className="card" style={{ padding: 12, boxShadow: 'none' }}>
                  Quiz: <b>Dummy</b>
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
            <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (₹{c.fee})
                </option>
              ))}
            </select>
          </div>
          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={submit} disabled={myCoursesLoading}>
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

