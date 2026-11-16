import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'pethub-theme';

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
  };
};

export function useThemeDroplet() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleWithDroplet = (triggerEl?: HTMLElement | null) => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    const doc = document as ViewTransitionDocument;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const rect = triggerEl?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth - 84;
    const cy = rect ? rect.top + rect.height / 2 : 36;

    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    const root = document.documentElement;
    root.style.setProperty('--drop-x', `${Math.round(cx)}px`);
    root.style.setProperty('--drop-y', `${Math.round(cy)}px`);
    root.style.setProperty('--drop-r', `${Math.ceil(maxR)}px`);

    const commitThemeDom = () => {
      if (nextTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      setTheme(nextTheme);
    };

    if (!prefersReduced && doc.startViewTransition) {
      doc.startViewTransition(() => {
        flushSync(commitThemeDom);
      });
    } else {
      commitThemeDom();
    }
  };

  return { theme, toggleWithDroplet };
}
