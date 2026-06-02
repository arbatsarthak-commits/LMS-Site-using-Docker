import React, { useMemo, useState } from 'react'
import { useApp } from '../context/appContext'

export default function Courses() {
  const {
    courses,
    coursesLoading,
    coursesError,
    myCourses,
    myCoursesLoading,
    myCoursesError,
    registerCourse,
    payCourse,
    currentUser,
    refreshCourses,
    refreshMyCourses,
    notifySuccess,
    notifyError,
  } = useApp()

  const isStudent = currentUser?.role === 'student'
  const [payingId, setPayingId] = useState(null)
  const [studentName, setStudentName] = useState('')
  const needName = useMemo(() => isStudent && !studentName.trim(), [isStudent, studentName])

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 className="cardTitle">Courses</h2>
        <p className="cardBody" style={{ marginBottom: 0 }}>
          {isStudent ? 'Register courses and pay fees (stored in database).' : 'Manage/view courses (from database).'}
        </p>
        {isStudent ? (
          <div className="btnRow" style={{ marginTop: 10 }}>
            <input
              className="input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name (for registration)"
              style={{ maxWidth: 320 }}
            />
          </div>
        ) : null}
        <div className="btnRow" style={{ marginTop: 10 }}>
          <button className="btn btnNeutral" type="button" onClick={refreshCourses} disabled={coursesLoading}>
            Refresh Courses
          </button>
          {isStudent ? (
            <button className="btn btnNeutral" type="button" onClick={refreshMyCourses} disabled={myCoursesLoading}>
              Refresh My Courses
            </button>
          ) : null}
        </div>

        {coursesError ? (
          <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)', marginTop: 10 }}>
            <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{coursesError}</p>
          </div>
        ) : null}
        {isStudent && myCoursesError ? (
          <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)', marginTop: 10 }}>
            <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{myCoursesError}</p>
          </div>
        ) : null}
      </div>

      <div className="cardGrid">
        {coursesLoading ? <div className="card">Loading…</div> : null}
        {courses.map((c) => {
          const reg = isStudent ? myCourses.find((x) => x.id === c.id) : null
          const registered = Boolean(reg)
          const paid = Boolean(reg?.paid)
          return (
            <div key={c.id} className="card">
              <h2 className="cardTitle">{c.name}</h2>
              <p className="cardBody">
                Fee: <b>₹{c.fee}</b>
                {isStudent ? (
                  <>
                    {' '}
                    • {registered ? <b>Registered</b> : 'Not registered'} • Payment:{' '}
                    <b>{paid ? 'Paid' : 'Pending'}</b>
                  </>
                ) : null}
              </p>

              {isStudent ? (
                <div className="btnRow">
                  <button
                    className="btn"
                    type="button"
                    disabled={registered}
                    onClick={async () => {
                      if (needName) {
                        notifyError('Please enter your name first')
                        return
                      }
                      const res = await registerCourse({ courseId: c.id, studentName })
                      if (!res.ok) notifyError(res.message || 'Registration failed')
                      else notifySuccess('Course registered')
                    }}
                  >
                    {registered ? 'Registered' : 'Register'}
                  </button>
                  <button
                    className="btn btnSuccess"
                    type="button"
                    disabled={!registered || paid || payingId === c.id}
                    onClick={async () => {
                      setPayingId(c.id)
                      try {
                        const res = await payCourse({ courseId: c.id, amount: c.fee })
                        if (!res.ok) notifyError(res.message || 'Payment failed')
                        else notifySuccess('Payment successful')
                      } finally {
                        setPayingId(null)
                      }
                    }}
                  >
                    {paid ? 'Paid' : payingId === c.id ? 'Paying…' : 'Pay'}
                  </button>
                </div>
              ) : (
                <div className="btnRow">
                  <button className="btn" type="button" disabled>
                    Admin view
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

