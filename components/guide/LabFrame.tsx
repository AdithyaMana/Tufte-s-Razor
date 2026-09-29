import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Toggle } from './controls.tsx';

/** The frame every interactive figure sits in: a label, the specimen, controls and readout. */
export const LabFrame: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <section aria-label={label} className={`my-12 md:my-16 rounded-xl border border-rule bg-card/60 ${className}`}>
    <div className="px-4 md:px-6 py-2.5 border-b border-rule flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-ink-data" aria-hidden="true" />
      <span className="kicker">{label}</span>
    </div>
    <div className="p-4 md:p-6">{children}</div>
  </section>
);

/** The legend for the ink map, shown whenever the map is on. */
export const InkMapLegend: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ul className={`flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-ink-2 ${className}`}>
    <li className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-[2px] bg-ink-data" aria-hidden="true" /> Data-ink
    </li>
    <li className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-[2px] bg-ink-redundant" aria-hidden="true" /> Redundant data-ink
    </li>
    <li className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-[2px] bg-ink-nondata" aria-hidden="true" /> Non-data ink
    </li>
    <li className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-[2px] border border-rule-2 bg-card" aria-hidden="true" /> Background (not ink)
    </li>
  </ul>
);

export const InkMapToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <div className="max-w-[12rem]">
    <Toggle label="Show ink map" checked={checked} onChange={onChange} hint="Colour every pixel by the kind of ink it is" />
  </div>
);

export interface Warning {
  id: string;
  text: string;
}

/** Plain-language notes when a change costs the reader something the ratio can't see. */
export const Warnings: React.FC<{ warnings: Warning[]; className?: string }> = ({ warnings, className = '' }) => {
  if (!warnings.length) return null;
  return (
    <ul className={`space-y-1.5 font-sans ${className}`} aria-live="polite">
      {warnings.map((w) => (
        <li key={w.id} className="flex gap-2 text-[0.8125rem] leading-snug text-ink-2">
          <AlertTriangle size={15} className="shrink-0 mt-[1px] text-warn" aria-hidden="true" />
          <span>
            <span className="sr-only">Warning: </span>
            {w.text}
          </span>
        </li>
      ))}
    </ul>
  );
};
