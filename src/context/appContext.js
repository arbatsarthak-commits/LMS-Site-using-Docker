import React from 'react'

export const AppContext = React.createContext(null)

export function useApp() {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}


