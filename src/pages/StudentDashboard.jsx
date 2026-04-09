import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { currentUser, attendance, quizResults, notices, placements } = useApp()

  return (
    <div>
      <div className="summaryGrid" style={{ marginBottom: 14 }}>
        <div className="summaryCard">
          <div className="summaryLabel">My Courses</div>
          <div className="summaryValue">3</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Attendance %</div>
          <div className="summaryValue">{attendance[currentUser?.username] || 80}%</div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Latest Result</div>
          <div className="summaryValue">
            {quizResults[currentUser?.username] != null ? `${quizResults[currentUser?.username]}%` : '—'}
          </div>
        </div>
        <div className="summaryCard">
          <div className="summaryLabel">Quick</div>
          <div className="summaryValue" style={{ fontSize: 14 }}>
            Dummy data • No backend
          </div>
        </div>
      </div>

      <div className="cardGrid">
        <div className="card">
          <h2 className="cardTitle">Courses</h2>
          <p className="cardBody">Register for a course.</p>
          <button className="btn" type="button" onClick={() => navigate('/courses')}>
            Open Courses
          </button>
        </div>

        <div className="card">
          <h2 className="cardTitle">Quiz</h2>
          <p className="cardBody">Attempt MCQ quiz and see result %.</p>
          <button className="btn" type="button" onClick={() => navigate('/quiz')}>
            Start Quiz
          </button>
        </div>

        <div className="card">
          <h2 className="cardTitle">Certificate</h2>
          <p className="cardBody">View certificate after completion.</p>
          <button className="btn btnSuccess" type="button" onClick={() => navigate('/certificate')}>
            View Certificate
          </button>
        </div>

        <div className="card">
          <h2 className="cardTitle">Notice Board</h2>
          <p className="cardBody" style={{ marginBottom: 0 }}>
            {notices[0] || 'No notices'}
          </p>
        </div>

        <div className="card">
          <h2 className="cardTitle">Jobs</h2>
          <p className="cardBody">Placed students:</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {placements.slice(0, 2).map((p, idx) => (
              <div key={idx} className="card" style={{ padding: 12, boxShadow: 'none' }}>
                <b>{p.company}</b> • {p.role} • {p.salary}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

