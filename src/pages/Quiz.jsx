import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/appContext'

export default function Quiz() {
  const navigate = useNavigate()
  const { currentUser, setQuizResults } = useApp()

  const fallbackQuestions = useMemo(
    () => [
      {
        id: 'q1',
        text: 'Which HTML tag is used to create a hyperlink?',
        options: ['<div>', '<a>', '<p>', '<span>'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        text: 'Which data structure uses FIFO?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        answerIndex: 1,
      },
      {
        id: 'q3',
        text: 'SQL stands for?',
        options: [
          'Structured Query Language',
          'Simple Query Language',
          'Standard Question List',
          'System Query Logic',
        ],
        answerIndex: 0,
      },
    ],
    [],
  )

  const questions = fallbackQuestions

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [percent, setPercent] = useState(null)

  function choose(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  function submit() {
    let s = 0
    for (const q of questions) {
      if (answers[q.id] === q.answerIndex) s += 1
    }
    setScore(s)
    setSubmitted(true)
    const pct = Math.round((s / questions.length) * 100)
    setPercent(pct)
    if (currentUser) {
      setQuizResults((prev) => ({ ...prev, [currentUser.username]: pct }))
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 className="cardTitle">Quiz</h2>
        <p className="cardBody" style={{ marginBottom: 0 }}>
          Dummy MCQ quiz. Result will be saved as percentage for your account.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: 14 }}>
            <h2 className="cardTitle" style={{ marginBottom: 6 }}>
              {q.text}
            </h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {q.options.map((opt, idx) => (
                <label
                  key={opt}
                  className="card"
                  style={{
                    padding: 12,
                    boxShadow: 'none',
                    cursor: submitted ? 'not-allowed' : 'pointer',
                    borderColor:
                      answers[q.id] === idx ? 'rgba(33,150,243,0.45)' : 'rgba(51,51,51,0.12)',
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === idx}
                    disabled={submitted}
                    onChange={() => choose(q.id, idx)}
                    style={{ marginRight: 10 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="btnRow">
          <button className="btn btnSuccess" type="button" onClick={submit} disabled={submitted}>
            Submit
          </button>
          <button className="btn btnNeutral" type="button" onClick={() => navigate('/student-dashboard')}>
            Back
          </button>
        </div>
      </div>

      {submitted ? (
        <div className="card" style={{ borderColor: 'rgba(76,175,80,0.25)' }}>
          <h2 className="cardTitle">Result</h2>
          <p className="cardBody" style={{ marginBottom: 0 }}>
            You scored <b>{score}</b> out of <b>{questions.length}</b> • Result: <b>{percent}%</b>
          </p>
        </div>
      ) : null}
    </div>
  )
}

