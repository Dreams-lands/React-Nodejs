import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="w-9 h-9 rounded-xl border border-[#dfe6f0] bg-[#f8faff] hover:border-[#0667d0] text-[#17324d] hover:text-[#0667d0] flex items-center justify-center cursor-pointer transition-colors shrink-0 press-tactile relative overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-[#e5834b]" aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 45, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.7 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.24 }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
