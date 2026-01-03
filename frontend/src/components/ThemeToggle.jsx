import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        theme === 'dark' 
          ? 'bg-gray-200 focus:ring-gray-400' 
          : 'bg-gray-800 focus:ring-gray-600'
      } ${className}`}
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
          theme === 'dark' 
            ? 'translate-x-7 bg-gray-800' 
            : 'translate-x-1 bg-white'
        }`}
      >
        <span className="flex h-full w-full items-center justify-center">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-gray-600" />
          ) : (
            <Sun className="h-4 w-4 text-gray-800" />
          )}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;

