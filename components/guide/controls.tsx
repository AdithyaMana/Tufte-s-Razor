import React, { useId, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsArticle } from '../site/view.ts';

// Controls are chrome, so each is the least that still reads as a control, but never less
// than a comfortable target for a finger: about 40 px tall.

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  /** What a screen reader announces as the value, e.g. including the resulting ratio. */
  valueText?: string;
  /** Marks under the track, e.g. one per step. */
  marks?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, format = String, valueText, marks }) => {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="font-sans">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-chrome">
          {label}
        </label>
        <output htmlFor={id} className="text-[0.8125rem] tabular-nums text-chrome">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={valueText ?? format(value)}
        style={{ '--fill': `${fill}%` } as React.CSSProperties}
      />
      {marks !== undefined && (
        <div className="relative h-1.5 -mt-1.5 mx-[9px]" aria-hidden="true">
          {Array.from({ length: marks }, (_, i) => {
            const at = marks > 1 ? (i / (marks - 1)) * 100 : 0;
            return (
              <span
                key={i}
                className={`absolute top-0 w-1 h-1 -translate-x-1/2 rounded-full ${at <= fill + 0.01 ? 'bg-control' : 'bg-line-2'}`}
                style={{ left: `${at}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: Option<T>[];
  /** May match no option, e.g. once the reader has changed something by hand. */
  value: T | null;
  onChange: (value: T) => void;
  /** Show the label above the options (otherwise it is only announced). */
  showLabel?: boolean;
  className?: string;
}

/**
 * Mutually exclusive choices as a row of buttons, big enough to tap. A radio group,
 * navigable with the arrow keys.
 */
export function Segmented<T extends string>({ label, options, value, onChange, showLabel = true, className = '' }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={`font-sans ${className}`}>
      {showLabel && <p className="mb-1.5 text-[0.8125rem] font-medium text-chrome">{label}</p>}
      <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-md border border-line-2 p-1">
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (selectedIndex === -1 && index === 0) ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              title={option.hint}
              className={`min-h-9 px-3 rounded-[4px] text-[0.8125rem] whitespace-nowrap transition-colors ${
                selected ? 'bg-control text-paper font-medium' : 'text-chrome hover:text-content hover:bg-content/[0.05]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Something on the chart that can be switched on or off, as a chip with a checkbox in it. */
export const Toggle: React.FC<{ label: string; on: boolean; onChange: (on: boolean) => void }> = ({ label, on, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={() => onChange(!on)}
    className={`inline-flex items-center gap-2 min-h-9 pl-2.5 pr-3 rounded-md border font-sans text-[0.8125rem] transition-colors ${
      on ? 'border-line-2 text-content hover:border-chrome' : 'border-dashed border-line-2 text-chrome hover:text-content hover:border-chrome'
    }`}
  >
    <span
      className={`grid place-items-center w-3.5 h-3.5 rounded-[3px] border transition-colors ${on ? 'bg-control border-control text-paper' : 'border-chrome/60'}`}
      aria-hidden="true"
    >
      {on && (
        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
          <path d="M2.5 6.2 5 8.5 9.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    {label}
  </button>
);

interface CheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Check: React.FC<CheckProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 min-h-10 font-sans text-[0.8125rem] text-chrome hover:text-content cursor-pointer w-fit">
    <input type="checkbox" className="check" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

/** A secondary action set as a word or two. */
export const TextButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center gap-1.5 min-h-10 font-sans text-[0.8125rem] text-chrome hover:text-content underline-offset-4 hover:underline rounded-sm disabled:opacity-40 disabled:pointer-events-none ${className}`}
  />
);

/**
 * Detail on demand: closed by default, so the page says the main thing first. In the article
 * view everything is shown, under `heading` (or the label).
 */
export const More: React.FC<{ label: string; heading?: string; children: React.ReactNode; className?: string }> = ({
  label,
  heading,
  children,
  className = '',
}) => {
  const article = useIsArticle();
  if (article) {
    return (
      <div className={className}>
        <p className="font-sans text-[0.8125rem] font-semibold text-content">{heading ?? label}</p>
        <div className="mt-2">{children}</div>
      </div>
    );
  }
  return (
    <details className={`more ${className}`}>
      <summary>{label}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
};

const slideButton =
  'inline-flex items-center justify-center w-11 h-11 rounded-md border border-line text-content hover:border-line-2 disabled:opacity-30 disabled:hover:border-line';

/** Previous and next for a slideshow, with where the reader is: "3 of 11". */
export const SlideNav: React.FC<{ index: number; count: number; onGo: (index: number) => void; noun: string; className?: string }> = ({
  index,
  count,
  onGo,
  noun,
  className = '',
}) => (
  <div className={`flex items-center gap-3 font-sans ${className}`}>
    <button type="button" className={slideButton} onClick={() => onGo(index - 1)} disabled={index === 0} aria-label={`Previous ${noun}`}>
      <ChevronLeft size={18} />
    </button>
    <button type="button" className={slideButton} onClick={() => onGo(index + 1)} disabled={index === count - 1} aria-label={`Next ${noun}`}>
      <ChevronRight size={18} />
    </button>
    <span className="ml-1 text-[0.8125rem] tabular-nums text-content-2">
      {index + 1} of {count}
    </span>
  </div>
);

/**
 * Slideshow behaviour for a figure: arrow keys and swipes move between slides. Spread the
 * returned props onto the element that holds the slides.
 */
export function useSlideGestures(index: number, count: number, setIndex: (index: number) => void) {
  const touchX = useRef<number | null>(null);
  const go = (i: number) => setIndex(Math.max(0, Math.min(count - 1, i)));
  const props = {
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(index + 1);
      else if (event.key === 'ArrowLeft') go(index - 1);
      else return;
      event.preventDefault();
    },
    onTouchStart: (event: React.TouchEvent) => {
      touchX.current = event.touches[0].clientX;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (touchX.current === null) return;
      const dx = event.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      touchX.current = null;
    },
  };
  return { go, props };
}
