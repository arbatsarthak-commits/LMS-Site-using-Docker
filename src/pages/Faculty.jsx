import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext.js'

export default function Faculty() {
  const navigate = useNavigate()
  const { faculty, currentUser, sendFacultyMessage } = useApp()

  const [selected, setSelected] = useState('')
  const [mode, setMode] = useState('') // "assignment" | "doubt"
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')

  function submit() {
    if (!selected) {
      alert('Please select a faculty member.')
      return
    }
    if (!mode) {
      alert('Please choose Submit Assignment or Ask Doubt.')
      return
    }
    if (!text.trim()) {
      alert('Please enter details.')
      return
    }
    const ok = sendFacultyMessage({
      username: currentUser?.username,
      facultyName: selected,
      type: mode,
      text,
    })
    if (!ok) {
      alert('Could not submit. Please try again.')
      return
    }
    const action = mode === 'assignment' ? 'Assignment submitted' : 'Doubt sent'
    setMessage(`${action} to ${selected}.`)
    setText('')
  }

  return (
    <div className="container">
      <h1 className="pageTitle">Faculty</h1>
      <p className="subTitle">Select a faculty member and submit an assignment or ask a doubt.</p>

      {message ? (
        <div className="card" style={{ borderColor: 'rgba(76,175,80,0.25)' }}>
          <p style={{ margin: 0, color: '#1e7e34', fontWeight: 900 }}>{message}</p>
        </div>
      ) : null}

      <div className="cardGrid">
        {faculty.map((f) => (
          <div className="card" key={f}>
            <h2 className="cardTitle">{f}</h2>
            <p className="cardBody">
              {selected === f ? 'Selected' : 'Click to select this faculty member.'}
            </p>
            <div className="btnRow">
              <button className="btn" type="button" onClick={() => setSelected(f)}>
                Select
              </button>
              <button
                className="btn btnNeutral"
                type="button"
                onClick={() => {
                  setSelected(f)
                  setMode('assignment')
                  setMessage('')
                }}
              >
                Submit Assignment
              </button>
              <button
                className="btn btnNeutral"
                type="button"
                onClick={() => {
                  setSelected(f)
                  setMode('doubt')
                  setMessage('')
                }}
              >
                Ask Doubt
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />

      <div className="card formCard">
        <h2 className="cardTitle">Message</h2>
        <p className="cardBody">
          Faculty: <b>{selected || 'None'}</b> • Action:{' '}
          <b>{mode ? (mode === 'assignment' ? 'Submit Assignment' : 'Ask Doubt') : 'None'}</b>
        </p>

        <div className="form">
          <div className="field">
            <label className="label" htmlFor="facultyText">
              Details
            </label>
            <input
              id="facultyText"
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'assignment' ? 'Paste assignment link / text...' : 'Type your doubt...'}
            />
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={submit}>
              Submit
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => navigate('/student-dashboard')}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

