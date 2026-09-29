import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useInkLens } from './inkLens.ts';
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

/** The switch for the site-wide ink map, with its three colours as the icon. */
const InkMapSwitch: React.FC = () => {
  const { on, toggle } = useInkLens();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-sm px-1 py-1.5 text-[0.8125rem] font-medium transition-colors ${
        on ? 'text-control' : 'text-chrome hover:text-content'
      }`}
      title="Colour every chart, and this page, by kind of ink"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        <span className={`w-[3px] h-3 ${on ? 'bg-ink-data' : 'bg-current'}`} />
        <span className={`w-[3px] h-2 ${on ? 'bg-ink-redundant' : 'bg-current opacity-60'}`} />
        <span className={`w-[3px] h-1.5 ${on ? 'bg-ink-nondata' : 'bg-current opacity-35'}`} />
      </span>
      <span className={on ? 'underline decoration-2 underline-offset-[5px]' : ''}>Ink map</span>
    </button>
  );
};

const navLink = 'rounded-sm px-1 py-1.5 text-[0.8125rem] font-medium text-chrome hover:text-content transition-colors';

const SiteHeader: React.FC<SiteHeaderProps> = ({ page, isDark, onToggleTheme }) => {
  // A rule under the header only once the page has scrolled beneath it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b transition-colors ${scrolled ? 'border-line' : 'border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-3 font-sans">
        <a href="/" onClick={linkHandler('/')} className="flex items-center gap-2 text-chrome hover:text-content rounded-sm" aria-label="Tufte's Razor, home">
          <RazorMark className="w-[18px] h-[18px]" />
          <span className="font-serif text-xl leading-none tracking-tight">Tufte's Razor</span>
        </a>

        <nav className="flex items-center gap-3 sm:gap-5" aria-label="Main">
          <a href="/#playground" onClick={linkHandler('/#playground')} className={`${navLink} hidden sm:inline-block`}>
            Playground
          </a>
          <a
            href="/analyze"
            onClick={linkHandler('/analyze')}
            className={`${navLink} ${page === 'analyze' ? 'text-control underline decoration-2 underline-offset-[5px]' : ''}`}
            aria-current={page === 'analyze' ? 'page' : undefined}
          >
            Measure<span className="hidden sm:inline"> a chart</span>
          </a>
          <InkMapSwitch />
          <button
            onClick={onToggleTheme}
            className="p-1.5 -mr-1.5 rounded-sm text-chrome hover:text-content transition-colors"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
