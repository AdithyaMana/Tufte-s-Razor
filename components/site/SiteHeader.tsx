import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { linkHandler } from './router.ts';

interface SiteHeaderProps {
  page: 'guide' | 'analyze';
  isDark: boolean;
  onToggleTheme: () => void;
}

/** Three hairline bars: the site mark, and a chart with nothing left to take away. */
export const RazorMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect x="6" y="6" width="3" height="20" rx="0.5" fill="currentColor" />
    <rect x="14.5" y="12" width="3" height="14" rx="0.5" fill="currentColor" />
    <rect x="23" y="17" width="3" height="9" rx="0.5" fill="currentColor" />
  </svg>
);

const navLink =
  'px-2 py-1.5 rounded-md text-[0.8125rem] font-medium text-ink-2 hover:text-ink transition-colors';

const SiteHeader: React.FC<SiteHeaderProps> = ({ page, isDark, onToggleTheme }) => (
  <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-rule">
    <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
      <a href="/" onClick={linkHandler('/')} className="flex items-center gap-2 text-ink group" aria-label="Tufte's Razor, home">
        <RazorMark className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-6" />
        <span className="font-serif text-xl md:text-[1.375rem] leading-none tracking-tight">Tufte's Razor</span>
      </a>

      <nav className="flex items-center gap-0.5 sm:gap-2 font-sans" aria-label="Main">
        <a href="/#bar-width" onClick={linkHandler('/#bar-width')} className={`${navLink} hidden sm:inline-block`}>
          Guide
        </a>
        <a href="/#playground" onClick={linkHandler('/#playground')} className={navLink}>
          Playground
        </a>
        <a
          href="/analyze"
          onClick={linkHandler('/analyze')}
          className={`${navLink} ${page === 'analyze' ? 'text-ink underline underline-offset-4 decoration-1' : ''}`}
          aria-current={page === 'analyze' ? 'page' : undefined}
        >
          Measure<span className="hidden sm:inline"> a chart</span>
        </a>
        <span className="w-px h-5 bg-rule mx-1 sm:mx-2" aria-hidden="true" />
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full text-ink-2 hover:text-ink hover:bg-ink/5 transition-colors"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </nav>
    </div>
  </header>
);

export default SiteHeader;
