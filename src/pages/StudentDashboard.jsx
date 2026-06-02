import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { currentUser, myCourses, payments, notices } = useApp()

  const recentPayments = (payments || []).slice(0, 5)
  const recentNotices = (notices || []).slice(0, 3)

  return (
    <div className="dashPage">
      <section className="sectionIntro">
        <h2 className="sectionKicker">Your learning hub</h2>
        <p className="sectionLead">
          Pick up where you left off — courses, assessments, and updates in one dashboard.
        </p>
      </section>

      <div className="summaryGrid dashStatGrid">
        <div className="summaryCard statCard statCard--a dashStatCard">
          <div className="statCardIcon" aria-hidden>
            📘
          </div>
          <div className="summaryLabel">My courses</div>
          <div className="summaryValue">{myCourses.length}</div>
          <div className="statCardHint">Enrolled modules</div>
        </div>
        <div className="summaryCard statCard statCard--b dashStatCard">
          <div className="statCardIcon" aria-hidden>
            🗓️
          </div>
          <div className="summaryLabel">Attendance</div>
          <div className="summaryValue">—</div>
          <div className="statCardHint">Coming soon</div>
        </div>
        <div className="summaryCard statCard statCard--c dashStatCard">
          <div className="statCardIcon" aria-hidden>
            🧪
          </div>
          <div className="summaryLabel">Latest result</div>
          <div className="summaryValue">—</div>
          <div className="statCardHint">Quizzes &amp; grades</div>
        </div>
        <div className="summaryCard statCard statCard--d dashStatCard">
          <div className="statCardIcon" aria-hidden>
            ✨
          </div>
          <div className="summaryLabel">Signed in as</div>
          <div className="summaryValue" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.35rem)' }}>
            {currentUser?.username}
          </div>
          <div className="statCardHint">Student portal</div>
        </div>
      </div>

      <section className="quickActions glassCard">
        <h3 className="sectionKicker sectionKicker--sm">Quick actions</h3>
        <div className="quickActionGrid">
          <button type="button" className="quickAction btnGradient" onClick={() => navigate('/courses')}>
            <span className="quickActionIcon">📚</span>
            <span>
              <strong>Browse courses</strong>
              <small>Register &amp; pay</small>
            </span>
          </button>
          <button type="button" className="quickAction btnGradient btnGradient--alt" onClick={() => navigate('/quiz')}>
            <span className="quickActionIcon">📝</span>
            <span>
              <strong>Take a quiz</strong>
              <small>Practice MCQs</small>
            </span>
          </button>
          <button type="button" className="quickAction btnNeutralSoft" onClick={() => navigate('/payment')}>
            <span className="quickActionIcon">💳</span>
            <span>
              <strong>Payments</strong>
              <small>History &amp; receipts</small>
            </span>
          </button>
        </div>
      </section>

      <div className="cardGrid dashCharts">
        <div className="card glassCard">
          <h2 className="cardTitle">Continue learning</h2>
          <p className="cardBody">Jump back into your catalog and track progress.</p>
          <div className="btnRow">
            <button className="btn btnGradient btnRipple" type="button" onClick={() => navigate('/courses')}>
              Open courses
            </button>
          </div>
        </div>

        <div className="card glassCard">
          <h2 className="cardTitle">Notice board</h2>
          {recentNotices.length ? (
            <ul className="activityList">
              {recentNotices.map((n) => (
                <li key={n.id} className="activityItem">
                  <span className="activityDot activityDot--violet" />
                  <div>
                    <div className="activityTitle">{n.title || 'Notice'}</div>
                    <div className="activityMeta">{n.message}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cardBody mutedEnd">No notices yet.</p>
          )}
        </div>

        <div className="card glassCard dashActivity">
          <h2 className="cardTitle">Recent activity</h2>
          {recentPayments.length ? (
            <ul className="activityList">
              {recentPayments.map((p) => (
                <li key={p.id} className="activityItem">
                  <span className="activityDot activityDot--green" />
                  <div>
                    <div className="activityTitle">Paid ₹{Number(p.amount || 0).toFixed(0)}</div>
                    <div className="activityMeta">{p.course || 'Course'}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cardBody mutedEnd">No recent payments.</p>
          )}
        </div>
      </div>
    </div>
  )
}
