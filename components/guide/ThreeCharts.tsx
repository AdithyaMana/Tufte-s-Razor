import React, { useMemo } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { presetSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { pct } from './format.ts';
import { useInkStats } from './useInk.ts';

const CHARTS = [
  {
    id: 'everything',
    verdict: 'Too low',
    text: 'Fills, gridlines, outlines, ticks and heavy type bury five numbers.',
  },
  {
    id: 'redundancy-b',
    verdict: 'About right',
    text: 'Values printed once, on the bars; just enough axis to anchor them.',
  },
  {
    id: 'razor',
    verdict: 'Too high',
    text: 'Pure data-ink — and no way to tell what, or how much, any bar shows.',
  },
] as const;

const Specimen: React.FC<{ id: string; verdict: string; text: string }> = ({ id, verdict, text }) => {
  const isDark = useIsDark();
  const spec = useMemo(() => presetSpec(id, isDark), [id, isDark]);
  const stats = useInkStats(spec);
  const issues = readabilityChecks(spec).length;
  return (
    <figure className="min-w-0">
      <ChartCanvas spec={spec} className="rounded-sm ring-1 ring-rule" />
      <figcaption className="mt-3 font-sans">
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-[0.9375rem] font-semibold text-ink">{verdict}</span>
          <span className="text-[0.9375rem] tabular-nums text-ink">{pct(stats.ratio)}</span>
        </p>
        <p className="mt-1 text-[0.8125rem] leading-snug text-ink-2">{text}</p>
        <p className="mt-1 text-xs text-muted">
          {issues === 0 ? 'No readability warnings' : `${issues} readability warning${issues > 1 ? 's' : ''}`}
        </p>
      </figcaption>
    </figure>
  );
};

/** Goldilocks and the three charts: the ratio is a range to aim for, not a score to max out. */
const ThreeCharts: React.FC = () => (
  <div className="my-10 md:my-12 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
    {CHARTS.map((chart) => (
      <Specimen key={chart.id} {...chart} />
    ))}
  </div>
);

export default ThreeCharts;
