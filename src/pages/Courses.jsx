import React, { useState } from 'react'
import { useApp } from '../context/appContext'

export default function Courses() {
  const { courses, registerStudentCourse, currentUser } = useApp()
  const [name, setName] = useState(currentUser?.username || '')

  function register(courseName) {
    if (!name.trim()) {
      alert('Enter student name first.')
      return
    }
    registerStudentCourse({ name: name.trim(), course: courseName })
    alert(`Registered ${name.trim()} for ${courseName}`)
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 className="cardTitle">Courses</h2>
        <p className="cardBody">
          Student-side course registration (dummy). Enter your name, then register.
        </p>
        <div className="btnRow">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student Name (e.g. Rahul)"
            style={{ maxWidth: 320 }}
          />
        </div>
      </div>

      <div className="cardGrid">
        {courses.map((c) => (
          <div key={c.name} className="card">
            <h2 className="cardTitle">{c.name}</h2>
            <p className="cardBody">
              Fee: <b>₹{c.fee}</b>
            </p>
            <div className="btnRow">
              <button className="btn" type="button" onClick={() => register(c.name)}>
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

