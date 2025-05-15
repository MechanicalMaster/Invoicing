"use client"

import type * as React from "react"
import { createContext, useContext, useEffect } from "react"

type Theme = "slate"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
}

const initialState: ThemeProviderState = {
  theme: "slate",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Remove any previously saved theme to ensure consistency
    localStorage.removeItem("ui-theme")
    
    // Apply slate theme directly
    const root = document.documentElement
    root.setAttribute("data-theme", "slate")
  }, [])

  return <ThemeProviderContext.Provider value={initialState}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
