import React from 'react';
import { AlertTriangle, Check as CheckIcon } from 'lucide-react';

/**
 * An interactive figure, with no frame around it: the chart, then (on wide screens beside
 * it) the count, then the controls. On a phone the count sits right under the chart, so it
 * stays in view while you use the controls.
 */
export const Lab: React.FC<{
  label: string;
  chart: React.ReactNode;
  readout: React.ReactNode;
  controls: React.ReactNode;
  after?: React.ReactNode;
}> = ({ label, chart, readout, controls, after }) => (
  <figure aria-label={label} className="mt-6 md:mt-8 mb-12 md:mb-16">
    <div className="lab-grid">
      <div className="min-w-0" style={{ gridArea: 'chart' }}>
        {chart}
      </div>
      <div style={{ gridArea: 'readout' }}>{readout}</div>
      <div className="min-w-0 space-y-5" style={{ gridArea: 'controls' }}>
        {controls}
      </div>
    </div>
    {after}
  </figure>
);

export interface Warning {
  id: string;
  text: string;
}

/** What a change costs the reader that the ratio can't see. */
export const Warnings: React.FC<{ warnings: Warning[]; className?: string }> = ({ warnings, className = '' }) => {
  if (!warnings.length) return null;
  return (
    <ul className={`space-y-1.5 font-sans ${className}`} aria-live="polite">
      {warnings.map((w) => (
        <li key={w.id} className="flex gap-2 text-[0.8125rem] leading-snug text-content-2">
          <AlertTriangle size={14} className="shrink-0 mt-[2px] text-warn" aria-hidden="true" />
          <span>
            <span className="sr-only">Warning: </span>
            {w.text}
          </span>
        </li>
      ))}
    </ul>
  );
};

/** A plain-language all-clear, the counterpart of a warning. */
export const AllClear: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex gap-2 font-sans text-[0.8125rem] leading-snug text-content-2">
    <CheckIcon size={14} className="shrink-0 mt-[2px] text-ink-data" aria-hidden="true" />
    {children}
  </p>
);
