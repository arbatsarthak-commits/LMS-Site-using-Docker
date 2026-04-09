import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext.js'

export default function Payment() {
  const navigate = useNavigate()
  const { currentUser, getRegisteredCourses, courses, payForCourse } = useApp()

  const registered = currentUser ? getRegisteredCourses(currentUser.username) : []
  const [course, setCourse] = useState(registered[0] || '')

  const [amount, setAmount] = useState('')
  const [paid, setPaid] = useState(false)

  function payNow() {
    const courseObj = courses.find((c) => c.name === course)
    const feeToPay = amount ? Number(amount) : Number(courseObj?.fee || 0)

    const res = payForCourse({
      username: currentUser?.username,
      courseName: course,
      amount: feeToPay,
    })
    if (!res.ok) {
      alert(res.message || 'Payment failed')
      return
    }
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
        <p className="cardBody">Enter amount and click Pay Now (dummy payment).</p>

        <div className="form">
          <div className="field">
            <label className="label" htmlFor="payCourse">
              Course
            </label>
            <select
              id="payCourse"
              className="input"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value)
                setPaid(false)
              }}
              disabled={paid}
            >
              {registered.map((c) => (
                <option key={c} value={c}>
                  {c}
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
                Payment Successful ({course})
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

