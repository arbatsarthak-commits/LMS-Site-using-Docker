import React from 'react'
import { useApp } from '../context/appContext'

export default function ToastStack() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null

  return (
    <div className="toastStack" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button className="toastClose" type="button" onClick={() => dismissToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

