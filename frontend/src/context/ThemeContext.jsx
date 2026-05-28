/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem('themeMode') || localStorage.getItem('theme') || 'system'
  );
  const [resolvedTheme, setResolvedTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (activeTheme) => {
      setResolvedTheme(activeTheme);
      if (activeTheme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Initial check
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      // Listener for system change
      const handleChange = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(themeMode);
    }

    localStorage.setItem('themeMode', themeMode);
    // Legacy support
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  // Backward compatible toggle
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      if (prevMode === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isSystemDark ? 'light' : 'dark';
      }
      return prevMode === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ themeMode, theme: resolvedTheme, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
