import React, { useEffect } from 'react'

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="modalOverlay modalOverlay--blur"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="modal modalPanel">
        <div className="modalHeader">
          <h2 className="cardTitle" style={{ margin: 0 }}>
            {title}
          </h2>
          <button className="btn btnNeutral btnSmall" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
