import React, { useId, useRef } from 'react';

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
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, onChange, format = String, valueText }) => {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="font-sans">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.8125rem] font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-[0.8125rem] tabular-nums text-ink-2">
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
    </div>
  );
};

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, hint }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 py-1.5 text-left font-sans group rounded-sm"
    title={hint}
  >
    <span className="text-[0.8125rem] text-ink">{label}</span>
    <span
      aria-hidden="true"
      className={`relative shrink-0 w-8 h-[18px] rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-rule-2 group-hover:bg-muted/60'}`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-card shadow-sm transition-transform duration-150 ${checked ? 'translate-x-[14px]' : ''}`}
      />
    </span>
  </button>
);

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: Option<T>[];
  /** May match no option, e.g. once the reader has tweaked a preset. */
  value: T | null;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  hideLabel?: boolean;
}

/** A row of mutually exclusive choices (a radio group), navigable with the arrow keys. */
export function Segmented<T extends string>({ label, options, value, onChange, size = 'md', hideLabel = false }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[0.8125rem]';
  return (
    <div className="font-sans">
      {!hideLabel && <p className="text-[0.8125rem] font-medium text-ink mb-1.5">{label}</p>}
      <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1">
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
              className={`${pad} rounded-md border transition-colors whitespace-nowrap ${
                selected
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-transparent text-ink-2 border-rule hover:text-ink hover:border-rule-2'
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

/** A plain secondary button in the site's quiet style. */
export const QuietButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rule text-[0.8125rem] font-sans text-ink-2 hover:text-ink hover:border-rule-2 transition-colors disabled:opacity-40 disabled:pointer-events-none ${className}`}
  />
);
