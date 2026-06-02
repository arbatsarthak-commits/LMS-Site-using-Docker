import React, { createContext, useContext, useMemo, useState } from 'react'

const ShellContext = createContext(null)

export function ShellProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const value = useMemo(() => ({ menuOpen, setMenuOpen }), [menuOpen])
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error('useShell must be used within ShellProvider')
  return ctx
}
