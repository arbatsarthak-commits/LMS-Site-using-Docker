import React from 'react'
import { useApp } from '../context/appContext'

export default function Certificate() {
  const { currentUser, quizResults } = useApp()
  const pct = quizResults[currentUser?.username]

  return (
    <div className="card">
      <h2 className="cardTitle">Certificate</h2>
      {pct == null ? (
        <p className="cardBody" style={{ marginBottom: 0 }}>
          Complete the quiz first to generate your certificate.
        </p>
      ) : (
        <p className="cardBody" style={{ marginBottom: 0 }}>
          This certifies that <b>{currentUser?.username}</b> has completed the course successfully
          with <b>{pct}%</b> at <b>Super Computer Institute</b>.
        </p>
      )}
    </div>
  )
}

