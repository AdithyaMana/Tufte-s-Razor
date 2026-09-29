import React, { useMemo } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { presetSpec } from '../../ink/presets.ts';
import { useIsDark } from '../site/theme.ts';
import ChartCanvas from './ChartCanvas.tsx';
import { pct } from './format.ts';
import { useInkStats } from './useInk.ts';

const CHARTS = [
  { id: 'everything', verdict: 'Too low', text: 'Fills, gridlines, outlines and heavy type bury five numbers.' },
  { id: 'redundancy-b', verdict: 'About right', text: 'Each value said once, on its bar, with just enough axis.' },
  { id: 'razor', verdict: 'Too high', text: 'All data-ink, and no way to tell what any bar shows.' },
] as const;

const Specimen: React.FC<{ id: string; verdict: string; text: string }> = ({ id, verdict, text }) => {
  const isDark = useIsDark();
  const spec = useMemo(() => presetSpec(id, isDark), [id, isDark]);
  const stats = useInkStats(spec);
  const issues = readabilityChecks(spec).length;
  return (
    <figure className="min-w-0">
      <ChartCanvas spec={spec} />
      <figcaption className="mt-3 font-sans">
        <p className="flex items-baseline justify-between gap-3">
          <span className="text-[0.9375rem] font-semibold text-content">{verdict}</span>
          <span className="text-[0.9375rem] font-semibold tabular-nums text-content">{pct(stats.ratio)}</span>
        </p>
        <p className="mt-1 text-[0.8125rem] leading-snug text-content-2">{text}</p>
        {issues > 0 && (
          <p className="mt-1 text-xs text-content-2">
            {issues} readability warning{issues > 1 ? 's' : ''}
          </p>
        )}
      </figcaption>
    </figure>
  );
};

/** Goldilocks and the three charts: the ratio is a range to aim for, not a score to max out. */
const ThreeCharts: React.FC = () => (
  <div className="my-12 md:my-16 grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-10">
    {CHARTS.map((chart) => (
      <Specimen key={chart.id} {...chart} />
    ))}
  </div>
);

export default ThreeCharts;
