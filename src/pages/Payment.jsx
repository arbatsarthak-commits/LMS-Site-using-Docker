import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext.js'

export default function Payment() {
  const navigate = useNavigate()
  const { myCourses, payCourse, refreshMyCourses } = useApp()
  const registered = myCourses
  const [courseId, setCourseId] = useState(registered[0]?.id || '')

  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState(false)

  async function payNow() {
    const c = registered.find((x) => String(x.id) === String(courseId))
    const feeToPay = amount ? Number(amount) : Number(c?.fee || 0)
    const res = await payCourse({ courseId: Number(courseId), amount: feeToPay })
    if (!res.ok) return alert(res.message || 'Payment failed')
    await refreshMyCourses()
    setPaid(true)
  }

  if (!registered.length) {
    return (
      <div className="container">
        <h1 className="pageTitle">Payment</h1>
        <p className="subTitle">Payment is available only after course registration.</p>
        <div className="btnRow">
          <button className="btn" type="button" onClick={() => navigate('/courses')}>
            Go to Courses
          </button>
          <button className="btn btnNeutral" type="button" onClick={() => navigate('/student-dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="pageTitle">Payment</h1>
      <p className="subTitle">Pay fees for a registered course.</p>

      <div className="card formCard">
        <h2 className="cardTitle">Pay Fees</h2>
        <p className="cardBody">Enter amount and click Pay Now (saved in database).</p>

        <div className="form">
          <div className="field">
            <label className="label" htmlFor="payCourse">
              Course
            </label>
            <select
              id="payCourse"
              className="input"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value)
                setPaid(false)
              }}
              disabled={paid}
            >
              {registered.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="amount">
              Amount
            </label>
            <input
              id="amount"
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Leave empty to pay course fee"
              inputMode="numeric"
              disabled={paid}
            />
          </div>

          <div className="btnRow">
            <button className="btn btnSuccess" type="button" onClick={payNow} disabled={paid}>
              Pay Now
            </button>
            <button className="btn btnNeutral" type="button" onClick={() => navigate('/student-dashboard')}>
              Back
            </button>
          </div>

          {paid ? (
            <div className="card" style={{ borderColor: 'rgba(76,175,80,0.25)' }}>
              <p style={{ margin: 0, color: '#1e7e34', fontWeight: 900 }}>
                Payment Successful
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

