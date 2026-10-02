import React, { useMemo } from 'react';
import { readabilityChecks } from '../../ink/checks.ts';
import { presetSpec, resolveSpec } from '../../ink/presets.ts';
import { razorShapeAndLook, STOP_STEP } from '../../ink/razor.ts';
import type { ChartSpec } from '../../ink/spec.ts';
import { useIsDark } from '../site/theme.ts';
import { MarginNote } from './Article.tsx';
import ChartPanels from './ChartPanels.tsx';
import { pct, times } from './format.ts';
import { useInkStatsList } from './useInk.ts';

/** Part 1's stopping point, optionally with a change: the guide's one model of a good chart. */
function stopSpec(isDark: boolean, change: Partial<ChartSpec> = {}): ChartSpec {
  const { shape, look } = razorShapeAndLook(STOP_STEP);
  return { ...resolveSpec(shape, look, isDark), ...change };
}

const CHARTS: { verdict: string; text: string; spec: (isDark: boolean) => ChartSpec }[] = [
  { verdict: 'Too low', text: 'Five numbers buried under fills, gridlines and outlines.', spec: (d) => presetSpec('everything', d) },
  { verdict: 'About right', text: 'Each value said once, on its bar, under a title that states the finding.', spec: (d) => stopSpec(d) },
  {
    verdict: 'Too high',
    text: 'Every label kept, but the bars cut down to hairlines.',
    // The same chart with bars cut to the thinnest line that still shows a value.
    spec: (d) => stopSpec(d, { barWidth: 0 }),
  },
];

/** A relative value worked through on the first two charts, for the margin beside the text. */
export const RelativeValueNote: React.FC = () => {
  const isDark = useIsDark();
  const specs = useMemo(() => CHARTS.slice(0, 2).map((chart) => chart.spec(isDark)), [isDark]);
  const [low, right] = useInkStatsList(specs);
  return (
    <MarginNote title="A relative value">
      From too low to about right, the ratio goes from {pct(low.ratio)} to {pct(right.ratio)}, {times(right.ratio, low.ratio)} as
      much. Neither number means much alone; the change between them shows the clean-up worked.
    </MarginNote>
  );
};

/** Goldilocks and the three charts: the ratio is a range to aim for, not a score to max out. */
const ThreeCharts: React.FC = () => {
  const isDark = useIsDark();
  const panels = useMemo(
    () =>
      CHARTS.map((chart) => {
        const spec = chart.spec(isDark);
        // What the ratio can't see: the same readability checks the challenge in Part 8 uses.
        const issues = readabilityChecks(spec);
        return {
          spec,
          label: chart.verdict,
          caption: (
            <>
              <p className="text-[0.8125rem] leading-snug">{chart.text}</p>
              {issues.length > 0 && (
                <ul className="mt-1.5 space-y-1 text-xs leading-snug">
                  {issues.map((issue) => (
                    <li key={issue.id}>{issue.text}</li>
                  ))}
                </ul>
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
