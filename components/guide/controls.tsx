import React, { useId, useRef } from 'react';

// Controls are chrome, so each is the least that still reads as a control: a hairline
// slider, words for choices, a plain checkbox.

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

interface ChoiceProps<T extends string> {
  label: string;
  options: Option<T>[];
  /** May match no option, e.g. once the reader has changed something by hand. */
  value: T | null;
  onChange: (value: T) => void;
  /** Show the label before the options (otherwise it is only announced). */
  showLabel?: boolean;
}

/**
 * Mutually exclusive choices, set as words: the chosen one is underlined. A radio group,
 * navigable with the arrow keys.
 */
export function Choice<T extends string>({ label, options, value, onChange, showLabel = true }: ChoiceProps<T>) {
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
    <div className="font-sans text-[0.8125rem] flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
      {showLabel && <span className="font-medium text-chrome">{label}</span>}
      <div role="radiogroup" aria-label={label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
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
              className={`whitespace-nowrap rounded-sm underline-offset-[5px] transition-colors ${
                selected ? 'text-control underline decoration-2' : 'text-chrome hover:text-content hover:underline decoration-1'
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

interface CheckProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Check: React.FC<CheckProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 py-1 font-sans text-[0.8125rem] text-chrome hover:text-content cursor-pointer w-fit">
    <input type="checkbox" className="check" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    {label}
  </label>
);

/** A secondary action set as a word or two. */
export const TextButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center gap-1.5 font-sans text-[0.8125rem] text-chrome hover:text-content underline-offset-4 hover:underline rounded-sm disabled:opacity-40 disabled:pointer-events-none ${className}`}
  />
);

/** Detail on demand: closed by default, so the page says the main thing first. */
export const More: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <details className={`more ${className}`}>
    <summary>{label}</summary>
    <div className="mt-3">{children}</div>
  </details>
);
