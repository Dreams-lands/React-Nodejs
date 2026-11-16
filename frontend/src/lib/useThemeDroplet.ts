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
    const startY = rect ? rect.bottom - 2 : 34;
    const dropDistance = 38;
    const impactY = Math.min(window.innerHeight - 24, startY + dropDistance);

    const maxR = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(impactY, window.innerHeight - impactY)
    );

    const root = document.documentElement;
    root.style.setProperty('--drop-x', `${Math.round(cx)}px`);
    root.style.setProperty('--drop-y', `${Math.round(impactY)}px`);
    root.style.setProperty('--drop-r', `${Math.ceil(maxR)}px`);

    const commitThemeDom = () => {
      if (nextTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      setTheme(nextTheme);
    };

    const applyTheme = () => {
      if (doc.startViewTransition) {
        doc.startViewTransition(() => {
          flushSync(commitThemeDom);
        });
      } else {
        commitThemeDom();
      }
    };

    if (prefersReduced || !triggerEl || typeof document === 'undefined') {
      applyTheme();
      return;
    }

    const droplet = document.createElement('div');
    droplet.className = `ph-theme-droplet ${nextTheme === 'dark' ? 'is-obsidian' : 'is-daylight'}`;
    droplet.style.left = `${cx}px`;
    droplet.style.top = `${startY}px`;
    document.body.appendChild(droplet);

    const fallAnim = droplet.animate(
      [
        { transform: 'translate(-50%, 0px) scale(0.85, 0.9)', opacity: 0.92 },
        { transform: `translate(-50%, ${dropDistance}px) scale(0.92, 1.24)`, opacity: 1 },
      ],
      {
        duration: 150,
        easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        fill: 'forwards',
      }
    );

    fallAnim.onfinish = () => {
      droplet.remove();
      applyTheme();
    };
  };

  return { theme, toggleWithDroplet };
}
