import React from 'react';
import type { InkStats } from '../../ink/measure.ts';
import { More } from './controls.tsx';
import { pct, pct1, px, times } from './format.ts';

export const INK_KINDS = [
  { key: 'data', label: 'Data-ink', swatch: 'bg-ink-data' },
  { key: 'redundant', label: 'Redundant data-ink', swatch: 'bg-ink-redundant' },
  { key: 'nonData', label: 'Non-data ink', swatch: 'bg-ink-nondata' },
] as const;

/**
 * All of a chart's ink as one bar, drawn to scale: the full width stands for `scale` pixels
 * of ink, so erasing ink shortens the bar while the data-ink stays put. The ratio is simply
 * the dark part over the whole bar.
 */
export const InkBar: React.FC<{ stats: InkStats; scale?: number; className?: string }> = ({ stats, scale, className = '' }) => {
  const full = Math.max(scale ?? stats.total, stats.total, 1);
  return (
    <div className={`relative h-2.5 ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      <div className="relative flex h-full gap-[2px] transition-[width] duration-300" style={{ width: `${(stats.total / full) * 100}%` }}>
        {INK_KINDS.map(({ key, swatch }) => {
          const share = stats.total > 0 ? stats[key] / stats.total : 0;
          if (share <= 0) return null;
          return <div key={key} className={swatch} style={{ flexGrow: share, flexBasis: 0, minWidth: 2 }} />;
        })}
      </div>
    </div>
  );
};

/** A kind of ink's colour, inline with text: the key, where the words are. */
export const Swatch: React.FC<{ kind: 'data' | 'redundant' | 'nonData' }> = ({ kind }) => (
  <span
    className={`inline-block w-[0.62em] h-[0.62em] mr-[0.3em] align-[0.02em] ${INK_KINDS.find((k) => k.key === kind)!.swatch}`}
    aria-hidden="true"
  />
);

/** A kind of ink named in running text, after its colour; the two never split across lines. */
export const InkTerm: React.FC<{ kind: 'data' | 'redundant' | 'nonData'; children: React.ReactNode }> = ({ kind, children }) => (
  <span className="whitespace-nowrap">
    <Swatch kind={kind} />
    <strong className="font-bold">{children}</strong>
  </span>
);

/** The key to the ink colours, used under every ink bar and in the ink-map legend. */
export const InkKey: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ul className={`flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-chrome ${className}`}>
    {INK_KINDS.map(({ key, label, swatch }) => (
      <li key={key} className="flex items-center gap-1.5">
        <span className={`w-2 h-2 ${swatch}`} aria-hidden="true" />
        {label}
      </li>
    ))}
  </ul>
);

export interface ReferenceStats {
  label: string;
  stats: InkStats;
}

/** "4.4× the start", "same as the start", or nothing when there is nothing to compare. */
export function comparedWith(stats: InkStats, reference?: ReferenceStats | null): string | null {
  if (!reference) return null;
  const factor = times(stats.ratio, reference.stats.ratio);
  return factor === 'same' ? `same as ${reference.label}` : `${factor} ${reference.label}`;
}

/**
 * "non-data ink −55%": how much of the reference's non-data ink is gone. Bar width dominates
 * the ratio, so a clean-up of gridlines and labels can barely move it; this figure shows it.
 */
export function nonDataChange(stats: InkStats, reference?: ReferenceStats | null): string | null {
  if (!reference || reference.stats.nonData <= 0) return null;
  const factor = stats.nonData / reference.stats.nonData;
  // Next to a nearly bare chart, a percentage runs into thousands; a multiple reads better.
  if (factor >= 2) return `non-data ink ${times(stats.nonData, reference.stats.nonData)}`;
  const change = Math.round((factor - 1) * 100);
  if (change === 0) return null;
  return `non-data ink ${change > 0 ? '+' : '−'}${Math.abs(change)}%`;
}

/**
 * The count in a line, for figures that stay in view while the text scrolls: the ratio,
 * the ink bar and its key. `hidden` keeps the number back, e.g. until the reader has guessed.
 */
export const InkMeter: React.FC<{
  stats: InkStats;
  scale?: number;
  reference?: ReferenceStats | null;
  hidden?: boolean;
  /** Drop the colour key on narrow screens, where the figure needs the room. */
  compact?: boolean;
  className?: string;
}> = ({ stats, scale, reference, hidden = false, compact = false, className = '' }) => {
  const compared = hidden ? null : comparedWith(stats, reference);
  const nonData = hidden ? null : nonDataChange(stats, reference);
  return (
    <div className={`font-sans ${className}`}>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="kicker">Data-ink ratio</span>
        <span className="text-2xl lg:text-[1.75rem] leading-none font-semibold tracking-tight tabular-nums text-echo" aria-live="polite">
          {hidden ? '?' : pct(stats.ratio)}
        </span>
        {compared && <span className="text-[0.8125rem] text-content-2">{compared}</span>}
        {nonData && <span className="text-[0.8125rem] text-content-2 tabular-nums">· {nonData}</span>}
      </p>
      <InkBar stats={hidden ? { ...stats, total: 0, data: 0, redundant: 0, nonData: 0 } : stats} scale={scale} className="mt-2.5" />
      <InkKey className={`mt-2 ${compact ? 'max-lg:hidden' : ''}`} />
    </div>
  );
};

interface InkReadoutProps {
  stats: InkStats;
  /** Pixels of ink the ink bar's full width stands for. */
  scale?: number;
  /** Compare with another version of the chart (the article's "relative value"). */
  reference?: ReferenceStats | null;
  className?: string;
}

/** The live count, said once: the ratio, and the ink it comes from. Detail on request. */
const InkReadout: React.FC<InkReadoutProps> = ({ stats, scale, reference, className = '' }) => (
  <div className={`font-sans ${className}`}>
    <p className="kicker">Data-ink ratio</p>
    <p className="mt-1.5 flex items-baseline gap-3">
      <span className="text-[2.75rem] leading-none font-semibold tracking-tight tabular-nums text-echo" aria-live="polite">
        {pct(stats.ratio)}
      </span>
      {reference && <span className="text-[0.8125rem] text-content-2">{comparedWith(stats, reference)}</span>}
    </p>
    {nonDataChange(stats, reference) && <p className="mt-1 text-[0.8125rem] text-content-2 tabular-nums">{nonDataChange(stats, reference)}</p>}

    <InkBar stats={stats} scale={scale} className="mt-5" />
    <InkKey className="mt-2.5" />

    <More label="Show the count" className="mt-4">
      <dl className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-[0.8125rem] tabular-nums">
        {INK_KINDS.map(({ key, label }) => (
          <React.Fragment key={key}>
            <dt className="text-content-2">{label}</dt>
            <dd className="text-right text-content-2">{px(stats[key])}</dd>
            <dd className="text-right text-content w-12">{pct1(stats.total ? stats[key] / stats.total : 0)}</dd>
          </React.Fragment>
        ))}
        <dt className="text-content-2 pt-1 border-t border-line">All ink</dt>
        <dd className="text-right text-content-2 pt-1 border-t border-line">{px(stats.total)}</dd>
        <dd className="pt-1 border-t border-line" />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-content-2">
        Counting every data-coloured pixel as data, repeated or not, would give {pct1(stats.dataShare)}.
      </p>
    </More>
  </div>
);

export default InkReadout;
