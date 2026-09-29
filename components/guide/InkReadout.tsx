import React from 'react';
import { ArrowDownRight, ArrowUpRight, Equal } from 'lucide-react';
import type { InkStats } from '../../ink/measure.ts';
import { pct, pct1, px, times } from './format.ts';

export const INK_KINDS = [
  { key: 'data', label: 'Data-ink', swatch: 'bg-ink-data', note: 'The hairline that carries each value' },
  { key: 'redundant', label: 'Redundant data-ink', swatch: 'bg-ink-redundant', note: 'Repeats a value already shown' },
  { key: 'nonData', label: 'Non-data ink', swatch: 'bg-ink-nondata', note: 'Axes, gridlines, borders, fills, text' },
] as const;

/** The whole ink budget as one stacked bar, separated by 2px gaps. */
export const InkBar: React.FC<{ stats: InkStats; className?: string }> = ({ stats, className = '' }) => (
  <div className={`flex h-2.5 gap-[2px] ${className}`} aria-hidden="true">
    {INK_KINDS.map(({ key, swatch }) => {
      const share = stats.total > 0 ? stats[key] / stats.total : 0;
      if (share <= 0) return null;
      return (
        <div
          key={key}
          className={`${swatch} first:rounded-l-[2px] last:rounded-r-[2px] transition-[flex-grow] duration-200`}
          style={{ flexGrow: share, flexBasis: 0, minWidth: 2 }}
        />
      );
    })}
  </div>
);

export interface ReferenceStats {
  label: string;
  stats: InkStats;
}

interface InkReadoutProps {
  stats: InkStats;
  reference?: ReferenceStats | null;
  /** Also show the naive share that counts redundant data-ink as data. */
  showNaive?: boolean;
  className?: string;
}

function asMuch(value: number, reference: number): string {
  const factor = times(value, reference);
  return factor === 'same' ? 'unchanged' : `${factor} as much`;
}

/** The relative value: this chart against a reference version of it. */
const Comparison: React.FC<{ stats: InkStats; reference: ReferenceStats }> = ({ stats, reference }) => {
  const factor = times(stats.ratio, reference.stats.ratio);
  const Icon = factor === 'same' ? Equal : stats.ratio > reference.stats.ratio ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="mt-1.5 text-[0.8125rem] text-ink-2">
      <p className="flex items-center gap-1">
        <Icon size={14} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
        {factor === 'same' ? (
          <span>Same ratio as {reference.label}</span>
        ) : (
          <span>
            <span className="font-semibold text-ink">{factor}</span> the ratio of {reference.label}
          </span>
        )}
      </p>
      <p className="mt-0.5 pl-[18px] text-xs text-muted">
        Non-data ink {asMuch(stats.nonData, reference.stats.nonData)}; redundant {asMuch(stats.redundant, reference.stats.redundant)}
      </p>
    </div>
  );
};

/** The live count: the ratio as a hero figure, then where all the ink went. */
const InkReadout: React.FC<InkReadoutProps> = ({ stats, reference, showNaive = true, className = '' }) => (
  <div className={`font-sans ${className}`}>
    <p className="kicker">Data-ink ratio</p>
    <p className="mt-1 text-[2.75rem] leading-none font-semibold tracking-tight text-ink" aria-live="polite">
      {pct(stats.ratio)}
    </p>
    <p className="mt-1.5 text-[0.8125rem] text-ink-2">of all ink is essential data-ink</p>
    {reference && <Comparison stats={stats} reference={reference} />}

    <InkBar stats={stats} className="mt-5" />
    <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
      {INK_KINDS.map(({ key, label, swatch, note }) => (
        <div key={key} className="flex items-baseline gap-2" title={note}>
          <span className={`w-2.5 h-2.5 rounded-[2px] shrink-0 self-center ${swatch}`} aria-hidden="true" />
          <dt className="text-ink-2 flex-1 min-w-0">{label}</dt>
          <dd className="tabular-nums text-muted">{px(stats[key])}</dd>
          <dd className="tabular-nums text-ink w-12 text-right">{pct1(stats.total ? stats[key] / stats.total : 0)}</dd>
        </div>
      ))}
      <div className="flex items-baseline gap-2 pt-1.5 border-t border-rule">
        <span className="w-2.5 shrink-0" aria-hidden="true" />
        <dt className="text-ink-2 flex-1">Total ink</dt>
        <dd className="tabular-nums text-muted">{px(stats.total)}</dd>
        <dd className="w-12" />
      </div>
    </dl>

    {showNaive && (
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Counting every data-coloured pixel as data, redundant or not:{' '}
        <span className="font-semibold text-ink-2 tabular-nums">{pct1(stats.dataShare)}</span>
      </p>
    )}
  </div>
);

/** On narrow screens the readout sits below the controls; this keeps the ratio in view. */
export const CompactRatio: React.FC<{ stats: InkStats; className?: string }> = ({ stats, className = '' }) => (
  <p className={`lg:hidden flex items-baseline gap-2 font-sans ${className}`} aria-hidden="true">
    <span className="kicker">Data-ink ratio</span>
    <span className="text-lg font-semibold tabular-nums text-ink">{pct(stats.ratio)}</span>
  </p>
);

export default InkReadout;
