'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    // Load saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem('jf-theme') as Theme | null
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved)
        }
        setMounted(true)
    }, [])

    // Apply theme class to <html>
    useEffect(() => {
        if (!mounted) return
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('jf-theme', theme)
    }, [theme, mounted])

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }, [])

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
