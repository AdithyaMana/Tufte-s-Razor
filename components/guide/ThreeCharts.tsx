import React, { useMemo } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { presetSpec, resolveSpec } from '../../ink/presets.ts';
import { razorShapeAndLook, STOP_STEP } from '../../ink/razor.ts';
import type { ChartSpec } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import ChartPanels from './ChartPanels.tsx';

/** Part 1's stopping point, optionally with a change: the guide's one model of a good chart. */
function stopSpec(isDark: boolean, change: Partial<ChartSpec> = {}): ChartSpec {
  const { shape, look } = razorShapeAndLook(STOP_STEP);
  return { ...resolveSpec(shape, look, isDark), ...change };
}

const CHARTS: { verdict: string; text: string; spec: (isDark: boolean) => ChartSpec }[] = [
  { verdict: 'Too low', text: 'Fills, gridlines, outlines and heavy type bury five numbers.', spec: (d) => presetSpec('everything', d) },
  { verdict: 'About right', text: 'Each value said once, on its bar, under a title that states the finding.', spec: (d) => stopSpec(d) },
  {
    verdict: 'Too high',
    text: 'Every label is still here, but hairline bars are hard to see and harder to compare.',
    // The same chart with bars cut to the thinnest line that still shows a value.
    spec: (d) => stopSpec(d, { barWidth: 0 }),
  },
];

/** Goldilocks and the three charts: the ratio is a range to aim for, not a score to max out. */
const ThreeCharts: React.FC = () => {
  const isDark = useIsDark();
  const panels = useMemo(
    () =>
      CHARTS.map((chart) => {
        const spec = chart.spec(isDark);
        const issues = readabilityChecks(spec).length;
        return {
          spec,
          label: chart.verdict,
          caption: (
            <>
              <p className="text-[0.8125rem] leading-snug">{chart.text}</p>
              {issues > 0 && (
                <p className="mt-1">
                  {issues} readability warning{issues > 1 ? 's' : ''}
                </p>
              )}
            </>
          ),
        };
      }),
    [isDark],
  );
  return <ChartPanels panels={panels} columns={3} label="Three versions of one chart: too little, about right and too much" inspectable />;
};

export default ThreeCharts;
