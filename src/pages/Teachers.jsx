import React, { useState } from 'react'
import { useApp } from '../context/appContext'

export default function Teachers() {
  const { facultyList, setFacultyList, notices, addNotice } = useApp()
  const [teacher, setTeacher] = useState('')
  const [notice, setNotice] = useState('')

  return (
    <div className="cardGrid">
      <div className="card">
        <h2 className="cardTitle">Teachers</h2>
        <p className="cardBody">Add / remove teachers (dummy).</p>
        <div className="btnRow">
          <input className="input" value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="Teacher name" style={{ maxWidth: 260 }} />
          <button
            className="btn btnSuccess"
            type="button"
            onClick={() => {
              const t = teacher.trim()
              if (!t) return
              if (facultyList.includes(t)) return alert('Already exists')
              setFacultyList((prev) => [...prev, t])
              setTeacher('')
            }}
          >
            Add
          </button>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'grid', gap: 8 }}>
          {facultyList.map((t) => (
            <div key={t} className="card" style={{ padding: 12, boxShadow: 'none' }}>
              <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
                <b>{t}</b>
                <button
                  className="btn btnDanger"
                  type="button"
                  onClick={() => setFacultyList((prev) => prev.filter((x) => x !== t))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="cardTitle">Notice Board</h2>
        <p className="cardBody">Add announcements (dummy).</p>
        <div className="btnRow">
          <input className="input" value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Announcement..." style={{ maxWidth: 360 }} />
          <button
            className="btn"
            type="button"
            onClick={() => {
              const ok = addNotice(notice)
              if (!ok) return
              setNotice('')
            }}
          >
            Add Notice
          </button>
        </div>
        <div style={{ height: 12 }} />
        <div style={{ display: 'grid', gap: 8 }}>
          {notices.slice(0, 6).map((n, idx) => (
            <div key={idx} className="card" style={{ padding: 12, boxShadow: 'none' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

