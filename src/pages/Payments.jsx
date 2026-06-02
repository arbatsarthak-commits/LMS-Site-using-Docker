import React from 'react'
import { useApp } from '../context/appContext'

export default function Payments() {
  const { currentUser, payments, paymentsLoading, paymentsError, refreshPayments } = useApp()
  const isAdmin = currentUser?.role === 'admin'

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h2 className="cardTitle">{isAdmin ? 'All Payments' : 'My Payments'}</h2>
            <p className="cardBody" style={{ marginBottom: 0 }}>
              Stored in database.
            </p>
          </div>
          <button className="btn btnNeutral" type="button" onClick={refreshPayments} disabled={paymentsLoading}>
            {paymentsLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {paymentsError ? (
          <div className="card" style={{ borderColor: 'rgba(220,53,69,0.25)', marginTop: 10 }}>
            <p style={{ margin: 0, color: '#b02a37', fontWeight: 700 }}>{paymentsError}</p>
          </div>
        ) : null}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              {isAdmin ? <th>User</th> : null}
              <th>Course</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                {isAdmin ? <td>{p.username || '—'}</td> : null}
                <td>{p.course || '—'}</td>
                <td>₹{Number(p.amount || 0).toFixed(2)}</td>
                <td>{p.status || '—'}</td>
                <td>{p.createdAt ? String(p.createdAt) : '—'}</td>
              </tr>
            ))}
            {!paymentsLoading && payments.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4}>No payments</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

