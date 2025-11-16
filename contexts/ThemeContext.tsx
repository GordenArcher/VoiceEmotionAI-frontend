
import { useTheme } from '@/hooks/use-theme';
import React, { createContext, ReactNode, useContext } from 'react';

interface ThemeContextType {
    colorScheme: 'light' | 'dark';
    setColorScheme: (scheme: 'light' | 'dark') => void;
    toggleColorScheme: () => void;
    isDark: boolean;
    isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useTheme();

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}