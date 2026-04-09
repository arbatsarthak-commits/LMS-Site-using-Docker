import React from 'react'

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="modal">
        <div className="modalHeader">
          <h2 className="cardTitle" style={{ margin: 0 }}>
            {title}
          </h2>
          <button className="btn btnNeutral" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

