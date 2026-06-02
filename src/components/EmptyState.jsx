import React from 'react'

export default function EmptyState({ title = 'No data yet', hint = 'Try adjusting filters or add a new record.', icon = '📭' }) {
  return (
    <div className="emptyState" role="status">
      <div className="emptyStateIcon" aria-hidden>
        {icon}
      </div>
      <div className="emptyStateTitle">{title}</div>
      <div className="emptyStateHint">{hint}</div>
    </div>
  )
}
