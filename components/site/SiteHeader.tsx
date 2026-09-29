import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, Moon, Sun } from 'lucide-react';
import { SECTIONS } from '../../content/sections.ts';
import { useInkMap } from './inkMap.ts';
import { useReadingProgress, type ReadingProgress } from './progress.ts';
import { linkHandler, navigate } from './router.ts';
import { useView } from './view.ts';

interface SiteHeaderProps {
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

/** The ink map's three colours, as an icon. */
const InkMapIcon: React.FC<{ on: boolean }> = ({ on }) => (
  <span className="flex h-3 w-[13px] items-end gap-[2px]" aria-hidden="true">
    <span className={`w-[3px] h-3 ${on ? 'bg-ink-data' : 'bg-current'}`} />
    <span className={`w-[3px] h-2 ${on ? 'bg-ink-redundant' : 'bg-current opacity-60'}`} />
    <span className={`w-[3px] h-1.5 ${on ? 'bg-ink-nondata' : 'bg-current opacity-35'}`} />
  </span>
);

/** An on/off setting in the header: an icon, and its name once there is room for it. */
const HeaderSwitch: React.FC<{
  label: string;
  title: string;
  on: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  className?: string;
}> = ({ label, title, on, onToggle, icon, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    title={title}
    className={`${control} gap-2 min-w-10 px-1.5 ${on ? 'text-control' : 'text-chrome hover:text-content'} ${className}`}
  >
    {icon}
    <span className={`hidden sm:inline ${on ? 'underline decoration-2 underline-offset-[5px]' : ''}`}>{label}</span>
    <span className="sr-only sm:hidden">{label}</span>
  </button>
);

const JUST_READ_TITLE = 'Read the whole guide as a plain article, without the interactive parts';
const INK_MAP_TITLE = 'Colour every chart by kind of ink';

/** A setting inside the contents menu on narrow screens, where the header has no room for it. */
const MenuSwitch: React.FC<{ label: string; on: boolean; onToggle: () => void; icon: React.ReactNode }> = ({ label, on, onToggle, icon }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    className="flex w-full items-center gap-3 min-h-10 px-4 text-[0.875rem] text-content-2 hover:text-content hover:bg-content/[0.03]"
  >
    <span className="grid w-4 place-items-center text-chrome">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    <span className={`text-xs ${on ? 'text-content font-semibold' : 'text-chrome'}`}>{on ? 'On' : 'Off'}</span>
  </button>
);

/** Where you are in the guide, and a way to jump to any part of it. */
const ContentsMenu: React.FC<{ progress: ReadingProgress }> = ({ progress }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { view, setView } = useView();
  const inkMap = useInkMap();
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

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    setOpen(false);
    navigate(hash);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contents-menu"
        className={`${control} gap-1.5 px-2 whitespace-nowrap ${open ? 'text-content' : 'text-chrome hover:text-content'}`}
      >
        <span className="sr-only">
          Contents. You are in part {Math.max(active, 0) + 1} of {SECTIONS.length}:{' '}
        </span>
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
          <div className="mt-2 pt-2 border-t border-line sm:hidden">
            <MenuSwitch
              label="Just read (no interactive parts)"
              on={view === 'article'}
              onToggle={() => {
                setOpen(false);
                setView(view === 'article' ? 'interactive' : 'article');
              }}
              icon={<BookOpen size={15} aria-hidden="true" />}
            />
            <MenuSwitch label="Ink map" on={inkMap.charts || inkMap.page} onToggle={inkMap.toggleCharts} icon={<InkMapIcon on={inkMap.charts || inkMap.page} />} />
          </div>
        </div>
      )}
    </div>
  );
};

const SECTION_IDS = SECTIONS.map((s) => s.id);

const SiteHeader: React.FC<SiteHeaderProps> = ({ isDark, onToggleTheme }) => {
  const { view, setView } = useView();
  const inkMap = useInkMap();
  const progress = useReadingProgress('guide', SECTION_IDS, view);
  const mapOn = inkMap.charts || inkMap.page;

  return (
    <header
      className={`sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b transition-colors ${progress.fraction > 0 ? 'border-line' : 'border-transparent'}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 font-sans">
        <a href="/" onClick={linkHandler('')} className="flex shrink-0 items-center gap-2 min-h-10 text-chrome hover:text-content rounded-sm" aria-label="Tufte's Razor, top of the guide">
          <RazorMark className="w-[18px] h-[18px] -ml-[3px]" />
          <span className="font-serif text-xl leading-none tracking-tight">Tufte's Razor</span>
        </a>

        <nav className="flex min-w-0 items-center gap-1 sm:gap-3" aria-label="Main">
          <ContentsMenu progress={progress} />
          <HeaderSwitch
            label="Just read"
            title={JUST_READ_TITLE}
            on={view === 'article'}
            onToggle={() => setView(view === 'article' ? 'interactive' : 'article')}
            icon={<BookOpen size={15} aria-hidden="true" />}
            className="hidden sm:inline-flex"
          />
          <HeaderSwitch
            label="Ink map"
            title={INK_MAP_TITLE}
            on={mapOn}
            onToggle={inkMap.toggleCharts}
            icon={<InkMapIcon on={mapOn} />}
            className="hidden sm:inline-flex"
          />
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
};

export default SiteHeader;
