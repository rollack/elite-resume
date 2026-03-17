import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light' 
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark' 
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'system' 
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
        }`}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
};
