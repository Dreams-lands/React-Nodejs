import React from 'react';
import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../lib/useThemeDroplet';

export const ThemeToggleButton: React.FC<{
  theme?: ThemeMode;
  onToggle?: (el: HTMLElement) => void;
}> = ({ theme = 'light', onToggle }) => {
  if (!onToggle) return null;
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={(e) => onToggle(e.currentTarget)}
      aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      aria-pressed={isDark}
      title={isDark ? 'Giao diện Sáng' : 'Giao diện Tối'}
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#dfe6f0] bg-[#f8faff] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] flex items-center justify-center cursor-pointer transition-colors shrink-0 relative"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
};
