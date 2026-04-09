import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, instituteName } = useApp()
  const [role, setRole] = useState('student')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const u = username.trim()
    const p = password.trim()

    if (!u || !p) {
      setError('Please enter username and password.')
      return
    }

    const res = login({ username: u, password: p, role })
    if (!res.ok) {
      alert('Invalid credentials')
      return
    }

    navigate(res.user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard', {
      replace: true,
    })
  }

  return (
    <div className="container">
      <h1 className="pageTitle">Login</h1>
      <p className="subTitle">
        {instituteName} • Sign in to continue.
      </p>

      <div className="card formCard">
        <h2 className="cardTitle">Welcome back</h2>
        <p className="cardBody">
          Admin: <b>admin</b> / <b>123</b> • Students: <b>student1</b>, <b>student2</b> / <b>123</b>
        </p>

        {error ? (
          <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)' }}>
            <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{error}</p>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" type="submit">
              Login
            </button>
            <button
              className="btn btnNeutral"
              type="button"
              onClick={() => {
                setRole('student')
                setUsername('')
                setPassword('')
                setError('')
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

