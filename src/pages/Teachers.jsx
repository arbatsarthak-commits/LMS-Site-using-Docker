import React, { useState } from 'react'
import { useApp } from '../context/appContext'

export default function Teachers() {
  const { canAdmin, notices, noticesLoading, noticesError, addNotice, deleteNotice } = useApp()
  const [title, setTitle] = useState('')
  const [notice, setNotice] = useState('')

  return (
    <div className="cardGrid">
      <div className="card">
        <h2 className="cardTitle">Notice Board</h2>
        <p className="cardBody">Announcements are stored in database.</p>
        {canAdmin ? (
          <div className="form">
            <div className="field">
              <label className="label">Title (optional)</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Message</label>
              <input className="input" value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Announcement..." />
            </div>
            <div className="btnRow">
              <button
                className="btn btnSuccess"
                type="button"
                onClick={async () => {
                  const res = await addNotice({ title, message: notice })
                  if (!res.ok) return alert(res.message)
                  setTitle('')
                  setNotice('')
                }}
              >
                Add Notice
              </button>
            </div>
          </div>
        ) : null}

        {noticesLoading ? <p className="cardBody">Loading…</p> : null}
        {noticesError ? <p className="cardBody" style={{ color: '#b02a37', fontWeight: 700 }}>{noticesError}</p> : null}
        <div style={{ height: 12 }} />
        <div style={{ display: 'grid', gap: 8 }}>
          {notices.slice(0, 12).map((n) => (
            <div key={n.id} className="card" style={{ padding: 12, boxShadow: 'none' }}>
              <div className="btnRow" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <b>{n.title || 'Notice'}</b>
                  <div style={{ opacity: 0.8 }}>{n.message}</div>
                </div>
                {canAdmin ? (
                  <button className="btn btnDanger" type="button" onClick={() => deleteNotice(n.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {!noticesLoading && notices.length === 0 ? (
            <div className="card" style={{ padding: 12, boxShadow: 'none' }}>No notices</div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

