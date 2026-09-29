import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Moon, Sun } from 'lucide-react';
import { SECTIONS } from '../../content/sections.ts';
import { useInkMap } from './inkMap.ts';
import { useReadingProgress, type ReadingProgress } from './progress.ts';
import { linkHandler, navigate } from './router.ts';

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

const control = 'inline-flex items-center justify-center min-h-10 rounded-sm text-[0.8125rem] font-medium transition-colors';

/** The switch that draws every chart as an ink map, with the map's three colours as its icon. */
const InkMapSwitch: React.FC = () => {
  const { charts, page, toggleCharts } = useInkMap();
  const on = charts || page;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggleCharts}
      className={`${control} gap-2 min-w-10 px-1.5 ${on ? 'text-control' : 'text-chrome hover:text-content'}`}
      title="Colour every chart by kind of ink"
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        <span className={`w-[3px] h-3 ${on ? 'bg-ink-data' : 'bg-current'}`} />
        <span className={`w-[3px] h-2 ${on ? 'bg-ink-redundant' : 'bg-current opacity-60'}`} />
        <span className={`w-[3px] h-1.5 ${on ? 'bg-ink-nondata' : 'bg-current opacity-35'}`} />
      </span>
      <span className={`hidden sm:inline ${on ? 'underline decoration-2 underline-offset-[5px]' : ''}`}>Ink map</span>
      <span className="sr-only sm:hidden">Ink map</span>
    </button>
  );
};

/** Where you are in the guide, and a way to jump to any part of it. */
const ContentsMenu: React.FC<{ progress: ReadingProgress }> = ({ progress }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { active, visited } = progress;
  const current = SECTIONS[Math.max(active, 0)];

  useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLAnchorElement>('a');
    items?.[Math.max(active, 0)]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contents-menu"
        className={`${control} gap-1.5 px-2 -mx-1 whitespace-nowrap ${open ? 'text-content' : 'text-chrome hover:text-content'}`}
      >
        <span className="sr-only">Contents. You are in part {Math.max(active, 0) + 1} of {SECTIONS.length}: </span>
        <span className="tabular-nums text-chrome" aria-hidden="true">
          {Math.max(active, 0) + 1}/{SECTIONS.length}
        </span>
        <span className="hidden md:inline">{current.short}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id="contents-menu"
          className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-[23rem] max-h-[calc(100vh-4.5rem)] overflow-y-auto rounded-md border border-line bg-paper py-2 shadow-[0_8px_30px_rgb(0_0_0/0.10)]"
        >
          <nav aria-label="Contents">
            <ol>
              {SECTIONS.map((section, i) => {
                const isCurrent = i === active;
                return (
                  <li key={section.id}>
                    <a
                      href={`/#${section.id}`}
                      onClick={(e) => jump(e, `/#${section.id}`)}
                      aria-current={isCurrent ? 'location' : undefined}
                      className={`grid grid-cols-[1.5rem_minmax(0,1fr)_1rem] items-center gap-2 min-h-10 px-4 text-[0.875rem] outline-offset-[-2px] ${
                        isCurrent ? 'text-content font-semibold bg-content/[0.04]' : 'text-content-2 hover:text-content hover:bg-content/[0.03]'
                      }`}
                    >
                      <span className="tabular-nums text-chrome text-xs">{i + 1}</span>
                      <span className="py-2 leading-snug">{section.title}</span>
                      {visited[i] && !isCurrent ? (
                        <span className="text-chrome">
                          <Check size={13} aria-hidden="true" />
                          <span className="sr-only">(read)</span>
                        </span>
                      ) : (
                        <span />
                      )}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="mt-2 pt-2 border-t border-line px-4 sm:hidden">
            <a href="/analyze" onClick={(e) => jump(e, '/analyze')} className="flex items-center min-h-10 text-[0.875rem] text-content-2 hover:text-content">
              Measure your own chart
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const SECTION_IDS = SECTIONS.map((s) => s.id);

const SiteHeader: React.FC<SiteHeaderProps> = ({ page, isDark, onToggleTheme }) => {
  const progress = useReadingProgress('guide', SECTION_IDS, page);
  const scrolled = progress.fraction > 0 || page === 'analyze';

  return (
    <header className={`sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b transition-colors ${scrolled ? 'border-line' : 'border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 font-sans">
        <a href="/" onClick={linkHandler('/')} className="flex shrink-0 items-center gap-2 min-h-10 text-chrome hover:text-content rounded-sm" aria-label="Tufte's Razor, home">
          <RazorMark className="w-[18px] h-[18px]" />
          <span className="font-serif text-xl leading-none tracking-tight">Tufte's Razor</span>
        </a>

        <nav className="flex min-w-0 items-center gap-1 sm:gap-4" aria-label="Main">
          {page === 'guide' ? (
            <ContentsMenu progress={progress} />
          ) : (
            <a href="/" onClick={linkHandler('/')} className={`${control} px-1.5 text-chrome hover:text-content`}>
              The guide
            </a>
          )}
          <a
            href="/analyze"
            onClick={linkHandler('/analyze')}
            className={`${control} px-1.5 hidden sm:inline-flex ${
              page === 'analyze' ? 'text-control underline decoration-2 underline-offset-[5px]' : 'text-chrome hover:text-content'
            }`}
            aria-current={page === 'analyze' ? 'page' : undefined}
          >
            Measure a chart
          </a>
          <InkMapSwitch />
          <button
            onClick={onToggleTheme}
            className={`${control} min-w-10 -mr-2 text-chrome hover:text-content`}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>
      </div>
      {page === 'guide' && (
        <div className="absolute inset-x-0 -bottom-px h-[2px]" aria-hidden="true">
          <div className="h-full bg-control/70 origin-left" style={{ transform: `scaleX(${progress.fraction})` }} />
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
