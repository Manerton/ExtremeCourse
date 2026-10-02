// ThemeContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

// Create context with default values
export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
});

// Theme provider component
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    // Устанавливаем светлую тему по умолчанию
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Persist theme
    };

    // Load saved theme or use light theme by default
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

        // Всегда используем светлую тему по умолчанию, игнорируя системные настройки
        const initialTheme = savedTheme || 'light';

        setTheme(initialTheme);
        document.documentElement.setAttribute('data-bs-theme', initialTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};