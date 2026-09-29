import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronUp, List, Moon, Scissors, Sun } from 'lucide-react';
import { SECTIONS } from '../../content/sections.ts';
import { useReadingProgress, type ReadingProgress } from './progress.ts';
import { linkHandler, navigate } from './router.ts';
import { useView } from './view.ts';

interface SiteHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

/** The site mark: Tufte's razor, as a pair of scissors. */
export const RazorMark: React.FC<{ className?: string }> = ({ className }) => (
  <Scissors className={className} strokeWidth={1.75} aria-hidden="true" />
);

const control = 'inline-flex items-center justify-center min-h-10 rounded-sm text-[0.8125rem] font-medium transition-colors';

/** Interactive stories, or the plain article. Shown as a switch: on means interactive. */
const InteractiveSwitch: React.FC = () => {
  const { view, setView } = useView();
  const on = view === 'interactive';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setView(on ? 'article' : 'interactive')}
      title={on ? 'Switch to the plain article' : 'Switch to the interactive guide'}
      className={`${control} gap-2 px-1.5 text-chrome hover:text-content`}
    >
      <span
        className={`relative inline-block w-7 h-4 rounded-full transition-colors ${on ? 'bg-control' : 'bg-line-2'}`}
        aria-hidden="true"
      >
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-paper transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      Interactive
    </button>
  );
};

const SECTION_IDS = SECTIONS.map((s) => s.id);

/** Where you are in the guide, and a way to jump to any part of it: a button at the foot of the screen. */
export const ContentsDock: React.FC<{ progress: ReadingProgress }> = ({ progress }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { active, visited } = progress;
  const current = SECTIONS[Math.max(active, 0)];
  // Out of the way while reading down the page; back when the reader scrolls up or pauses.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let timer = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) setTucked(y > last);
      last = y;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setTucked(false), 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelectorAll<HTMLAnchorElement>('a')[Math.max(active, 0)]?.focus();
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

  // Hidden until the reader is past the opening, and on pages without the guide.
  if (active < 0 || progress.fraction < 0.02) return null;

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setOpen(false);
    navigate(hash);
  };

  return (
    <div
      className={`fixed left-3 sm:left-5 bottom-3 sm:bottom-5 z-40 font-sans transition-[transform,opacity] duration-300 ${
        tucked && !open ? 'translate-y-[150%] opacity-0 pointer-events-none' : ''
      }`}
    >
      {open && (
        <div
          ref={menuRef}
          id="contents-menu"
          className="absolute bottom-full mb-2 left-0 w-[min(23rem,calc(100vw-1.5rem))] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-md border border-line bg-paper py-2 shadow-[0_8px_30px_rgb(0_0_0/0.12)]"
        >
          <nav aria-label="Contents">
            <ol>
              {SECTIONS.map((section, i) => {
                const isCurrent = i === active;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => jump(e, `#${section.id}`)}
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
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contents-menu"
        className="inline-flex items-center gap-2 min-h-10 rounded-full border border-line bg-paper/95 backdrop-blur-md px-3.5 text-[0.8125rem] text-content-2 hover:text-content shadow-[0_2px_12px_rgb(0_0_0/0.08)]"
      >
        <List size={14} aria-hidden="true" />
        <span className="sr-only">Contents. You are in part {Math.max(active, 0) + 1} of {SECTIONS.length}: </span>
        <span className="tabular-nums text-chrome" aria-hidden="true">
          {Math.max(active, 0) + 1}/{SECTIONS.length}
        </span>
        <span className="hidden sm:inline">{current.short}</span>
        <ChevronUp size={14} className={`transition-transform ${open ? '' : 'rotate-180'}`} aria-hidden="true" />
      </button>
    </div>
  );
};

/** Reading progress, shared by the header's progress line and the contents dock. */
export function useGuideProgress() {
  const { view } = useView();
  return useReadingProgress('guide', SECTION_IDS, view);
}

const SiteHeader: React.FC<SiteHeaderProps & { progress: ReadingProgress }> = ({ isDark, onToggleTheme, progress }) => (
  <header
    className={`sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b transition-colors ${progress.fraction > 0 ? 'border-line' : 'border-transparent'}`}
  >
    <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 font-sans">
      <a
        href="/"
        onClick={linkHandler('')}
        className="flex shrink-0 items-center gap-2 min-h-10 text-chrome hover:text-content rounded-sm"
        aria-label="Tufte's Razor, top of the guide"
      >
        <RazorMark className="w-[18px] h-[18px]" />
        <span className="font-serif text-xl leading-none tracking-tight">Tufte's Razor</span>
      </a>

      <nav className="flex min-w-0 items-center gap-1 sm:gap-3" aria-label="Settings">
        <InteractiveSwitch />
        <button
          onClick={onToggleTheme}
          className={`${control} min-w-10 -mr-3 text-chrome hover:text-content`}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>
    </div>
    <div className="absolute inset-x-0 -bottom-px h-[2px]" aria-hidden="true">
      <div className="h-full bg-control/70 origin-left" style={{ transform: `scaleX(${progress.fraction})` }} />
    </div>
  </header>
);

export default SiteHeader;
